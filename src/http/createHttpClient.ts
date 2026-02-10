import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { HTTP_REQUEST_TIMEOUT_MS } from '@/config/constants';
import { KeezLogger } from '@/helpers/keezLogger';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

interface RetryableConfig extends InternalAxiosRequestConfig {
    retryCount?: number;
}

export interface CreateHttpClientOptions {
    timeout?: number;
    logger: KeezLogger;
    maxRetries?: number;
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
        const isRetryableStatus =
            error.response && RETRYABLE_STATUS_CODES.includes(error.response.status);

        const maxRetries = options.maxRetries ?? MAX_RETRIES;
        if ((!isNetworkError && !isRetryableStatus) || config.retryCount >= maxRetries) {
            throw error;
        }

        config.retryCount += 1;
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, config.retryCount - 1);

        options.logger.warn(
            `Retrying request ${config.method?.toUpperCase()} ${config.url} (attempt ${config.retryCount}/${MAX_RETRIES}) after ${delay}ms`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
        return instance.request(config);
    });

    return instance;
}
