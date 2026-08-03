import { AxiosAdapter, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { createHttpClient } from '@/http/createHttpClient';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';

type Outcome = number | 'network';

// Simulates the HTTP transport without sockets: each call consumes the next
// outcome (an HTTP status or a network error) and counts attempts, so tests
// can assert exactly how many times the retry interceptor re-issued a request.
function fakeTransport(outcomes: Outcome[]) {
    let attempts = 0;
    const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        const outcome = outcomes[Math.min(attempts, outcomes.length - 1)];
        attempts += 1;
        if (outcome === 'network') {
            throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config);
        }
        const response: AxiosResponse = {
            data: {},
            status: outcome,
            statusText: '',
            headers: {},
            config,
        };
        if (outcome >= 400) {
            throw new AxiosError(
                `Request failed with status code ${outcome}`,
                AxiosError.ERR_BAD_RESPONSE,
                config,
                undefined,
                response
            );
        }
        return response;
    };
    return { adapter, attempts: () => attempts };
}

type Settled<T> = { status: 'resolved'; value: T } | { status: 'rejected'; reason: unknown };

// Attaches handlers before advancing fake timers so retry delays run
// instantly and rejections never surface as unhandled.
async function settle<T>(promise: Promise<T>): Promise<Settled<T>> {
    const outcome = promise.then(
        (value): Settled<T> => ({ status: 'resolved', value }),
        (reason): Settled<T> => ({ status: 'rejected', reason })
    );
    await jest.runAllTimersAsync();
    return outcome;
}

describe('createHttpClient retry policy', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('retries GET on 500 and succeeds', async () => {
        const transport = fakeTransport([500, 200]);
        const client = createHttpClient({ logger: noopLogger });

        const result = await settle(client.get('https://api.test/x', { adapter: transport.adapter }));

        expect(result.status).toBe('resolved');
        expect(transport.attempts()).toBe(2);
    });

    it('does not retry POST on 500', async () => {
        const transport = fakeTransport([500, 200]);
        const client = createHttpClient({ logger: noopLogger });

        const result = await settle(client.post('https://api.test/x', {}, { adapter: transport.adapter }));

        expect(result.status).toBe('rejected');
        expect(transport.attempts()).toBe(1);
    });

    it('retries POST on 429 because a rate-limited request was never processed', async () => {
        const transport = fakeTransport([429, 200]);
        const client = createHttpClient({ logger: noopLogger });

        const result = await settle(client.post('https://api.test/x', {}, { adapter: transport.adapter }));

        expect(result.status).toBe('resolved');
        expect(transport.attempts()).toBe(2);
    });

    it('does not retry POST on a network error', async () => {
        const transport = fakeTransport(['network']);
        const client = createHttpClient({ logger: noopLogger });

        const result = await settle(client.post('https://api.test/x', {}, { adapter: transport.adapter }));

        expect(result.status).toBe('rejected');
        expect(transport.attempts()).toBe(1);
    });

    it('does not retry PATCH on 500', async () => {
        const transport = fakeTransport([500, 200]);
        const client = createHttpClient({ logger: noopLogger });

        const result = await settle(client.patch('https://api.test/x', {}, { adapter: transport.adapter }));

        expect(result.status).toBe('rejected');
        expect(transport.attempts()).toBe(1);
    });

    it('retries PUT on a network error', async () => {
        const transport = fakeTransport(['network', 200]);
        const client = createHttpClient({ logger: noopLogger });

        const result = await settle(client.put('https://api.test/x', {}, { adapter: transport.adapter }));

        expect(result.status).toBe('resolved');
        expect(transport.attempts()).toBe(2);
    });

    it('retries DELETE on 503', async () => {
        const transport = fakeTransport([503, 200]);
        const client = createHttpClient({ logger: noopLogger });

        const result = await settle(client.delete('https://api.test/x', { adapter: transport.adapter }));

        expect(result.status).toBe('resolved');
        expect(transport.attempts()).toBe(2);
    });

    it('gives up after the default number of retries', async () => {
        const transport = fakeTransport([500]);
        const client = createHttpClient({ logger: noopLogger });

        const result = await settle(client.get('https://api.test/x', { adapter: transport.adapter }));

        expect(result.status).toBe('rejected');
        expect(transport.attempts()).toBe(4);
    });

    it('respects the maxRetries option', async () => {
        const transport = fakeTransport([500]);
        const client = createHttpClient({ logger: noopLogger, maxRetries: 1 });

        const result = await settle(client.get('https://api.test/x', { adapter: transport.adapter }));

        expect(result.status).toBe('rejected');
        expect(transport.attempts()).toBe(2);
    });

    it('does not retry non-retryable statuses', async () => {
        const transport = fakeTransport([400]);
        const client = createHttpClient({ logger: noopLogger });

        const result = await settle(client.get('https://api.test/x', { adapter: transport.adapter }));

        expect(result.status).toBe('rejected');
        expect(transport.attempts()).toBe(1);
    });

    it('retries POST on 500 when retryNonIdempotentRequests is enabled', async () => {
        const transport = fakeTransport([500, 200]);
        const client = createHttpClient({ logger: noopLogger, retryNonIdempotentRequests: true });

        const result = await settle(client.post('https://api.test/x', {}, { adapter: transport.adapter }));

        expect(result.status).toBe('resolved');
        expect(transport.attempts()).toBe(2);
    });

    it('logs retry attempts against the configured maxRetries', async () => {
        const warn = jest.fn();
        const logger: KeezLogger = { ...noopLogger, warn };
        const transport = fakeTransport([500]);
        const client = createHttpClient({ logger, maxRetries: 1 });

        await settle(client.get('https://api.test/x', { adapter: transport.adapter }));

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('attempt 1/1'));
    });
});
