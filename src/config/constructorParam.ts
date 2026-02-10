import { KeezLogger } from '@/helpers/keezLogger';

export interface KeezConstructor {
    readonly applicationId: string;
    readonly clientEid: string;
    readonly secret: string;
    readonly live: boolean;
    readonly logger?: KeezLogger;
    /** Maximum number of retries for transient failures (429, 5xx). Defaults to 3. Set to 0 to disable. */
    readonly maxRetries?: number;
}
