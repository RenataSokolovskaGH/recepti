export interface KnownSessionSchema {
    id: number;
    userId: number;
    clientIp: string;
    clientUserAgent: string | null;
    createdAt: string;
    lastUsedAt: string;
    os: string;
    browser: string;
    version: string;
    platform: string;
}
