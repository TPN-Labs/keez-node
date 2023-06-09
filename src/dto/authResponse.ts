export interface AuthResponse {
    readonly access_token: string;
    readonly expires_in: number;
    readonly expires_at: number;
    readonly token_type: string;
    readonly scope: string;
}
