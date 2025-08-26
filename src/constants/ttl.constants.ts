export const TTL = {
    "30s": 1000 * 30,
    '1m': 1000 * 60,
    '5m': 1000 * 60 * 5,
    '1h': 1000 * 60 * 60,
    '1d': 1000 * 60 * 60 * 24,
} as const;
export type TTLKey = keyof typeof TTL;
