import { KeezLogger } from '@/helpers/keezLogger';

export interface KeezConstructor {
    readonly applicationId: string;
    readonly clientEid: string;
    readonly secret: string;
    readonly live: boolean;
    readonly logger?: KeezLogger;
    /** Maximum number of retries for transient failures (429, 5xx). Defaults to 3. Set to 0 to disable. */
    readonly maxRetries?: number;
    /**
     * Also retry POST/PATCH requests on 5xx and network errors. Defaults to false
     * because such a request may already have been applied by the server (e.g. an
     * invoice created) even though the client saw a failure, so retrying can
     * duplicate side effects. Regardless of this flag, POST/PATCH are retried on
     * 429, since a rate-limited request was never processed.
     */
    readonly retryNonIdempotentRequests?: boolean;
}
