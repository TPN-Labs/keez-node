import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { HTTP_REQUEST_TIMEOUT_MS } from '@/config/constants';
import { KeezLogger } from '@/helpers/keezLogger';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];
// Non-idempotent requests (POST, PATCH) are only retried on 429: a
// rate-limited request was never processed, while after a 5xx or a network
// error the server may already have applied it (e.g. created the invoice).
const IDEMPOTENT_METHODS = ['get', 'head', 'options', 'put', 'delete'];
const RATE_LIMIT_STATUS = 429;

interface RetryableConfig extends InternalAxiosRequestConfig {
    retryCount?: number;
}

export interface CreateHttpClientOptions {
    timeout?: number;
    logger: KeezLogger;
    maxRetries?: number;
    /**
     * Also retry POST/PATCH on 5xx and network errors. Off by default:
     * such a request may have been applied by the server even though the
     * client saw a failure, so retrying can duplicate side effects.
     */
    retryNonIdempotentRequests?: boolean;
}

export function createHttpClient(options: CreateHttpClientOptions): AxiosInstance {
    const instance = axios.create({
        timeout: options.timeout ?? HTTP_REQUEST_TIMEOUT_MS,
    });

    // Response interceptor: retry on transient failures
    instance.interceptors.response.use(undefined, async (error: AxiosError) => {
        const config = error.config as RetryableConfig | undefined;
        if (!config) throw error;

        config.retryCount = config.retryCount ?? 0;

        const isNetworkError = !error.response;
        const status = error.response?.status;
        const isRetryableStatus = status !== undefined && RETRYABLE_STATUS_CODES.includes(status);

        const method = (config.method ?? 'get').toLowerCase();
        const isRetryableMethod =
            (options.retryNonIdempotentRequests ?? false) ||
            IDEMPOTENT_METHODS.includes(method) ||
            status === RATE_LIMIT_STATUS;

        const maxRetries = options.maxRetries ?? MAX_RETRIES;
        if (!isRetryableMethod || (!isNetworkError && !isRetryableStatus) || config.retryCount >= maxRetries) {
            throw error;
        }

        config.retryCount += 1;
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, config.retryCount - 1);

        options.logger.warn(
            `Retrying request ${config.method?.toUpperCase()} ${config.url} (attempt ${config.retryCount}/${maxRetries}) after ${delay}ms`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
        return instance.request(config);
    });

    return instance;
}
