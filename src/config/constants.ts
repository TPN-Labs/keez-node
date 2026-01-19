// Time unit conversions
export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const MILLISECONDS_IN_SECOND = 1000;

// Derived time constants
export const SECONDS_IN_HOUR = MINUTES_IN_HOUR * SECONDS_IN_MINUTE; // 3600
export const MILLISECONDS_IN_MINUTE = SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND; // 60000

// HTTP request timeouts
export const HTTP_REQUEST_TIMEOUT_MS = 30 * MILLISECONDS_IN_SECOND; // 30 seconds
export const DOWNLOAD_REQUEST_TIMEOUT_MS = 60 * MILLISECONDS_IN_SECOND; // 60 seconds

// Token expiry buffer (refresh token before it actually expires)
export const TOKEN_EXPIRY_BUFFER_MS = 5 * MILLISECONDS_IN_MINUTE; // 5 minutes

// Date formatting constants
export const DATE_PAD_LENGTH = 2;
export const MONTH_INDEX_OFFSET = 1; // JavaScript months are 0-indexed
export const DECIMAL_RADIX = 10;

// Invoice defaults
export const DEFAULT_VAT_AMOUNT = 0;
export const DEFAULT_INVOICE_QUANTITY = 1;
