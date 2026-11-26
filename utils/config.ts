import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const dataPath = path.resolve(process.cwd(), process.env.AMDS_TEST_DATA_FILE ?? 'test-data/local.json');
const defaultFixedOtp = '123456';
const dataText = existsSync(dataPath) ? readFileSync(dataPath, 'utf8').replace(/^\uFEFF/, '') : '{}';
const data: unknown = JSON.parse(dataText);
if (!data || typeof data !== 'object' || Array.isArray(data) || Object.values(data).some(value => typeof value !== 'string')) {
    throw new Error('Test data must be a JSON object with string values.');
}
if (process.env.AMDS_TEST_DATA_FILE && !existsSync(dataPath)) throw new Error('AMDS_TEST_DATA_FILE does not exist.');

export function setting(name: string): string | undefined {
    return (process.env[name] ?? (data as Record<string, string>)[name])?.trim();
}

export function requiredEnv(name: string): string {
    const value = setting(name);
    if (!value) throw new Error(`${name} is missing from environment or test-data/local.json.`);
    return value;
}

export function getDeviceId(): string {
    return requiredEnv('AMDS_DEVICE_ID');
}

// Opt-in, exact account matching. No match means normal OTP retrieval.
export function fixedOtpFor(channel: 'mobile' | 'email', account: string): string | undefined {
    const configured = setting(channel === 'mobile' ? 'AMDS_FIXED_OTP_MOBILE' : 'AMDS_FIXED_OTP_EMAIL');
    const accountMatches = channel === 'email'
        ? configured?.toLowerCase() === account.trim().toLowerCase()
        : configured === account.trim();
    if (!configured || !accountMatches) return undefined;
    return setting('AMDS_FIXED_OTP') || defaultFixedOtp;
}
