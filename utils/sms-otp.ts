import { execFile } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const pollIntervalMs = 2_000;

interface SmsMessage {
    body: string;
    receivedAt: number;
}

async function resolveAdbPath(): Promise<string> {
    const executable = process.platform === 'win32' ? 'adb.exe' : 'adb';
    const configuredPath = process.env.ADB_PATH;
    const sdkRoots = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT];
    if (process.env.LOCALAPPDATA) {
        sdkRoots.push(path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk'));
    }

    const candidates = [
        ...(configuredPath
            ? [path.basename(configuredPath).toLowerCase() === executable.toLowerCase()
                ? configuredPath
                : path.join(configuredPath, executable)]
            : []),
        ...sdkRoots.filter((root): root is string => Boolean(root)).map((root) =>
            path.join(root, 'platform-tools', executable),
        ),
    ];

    for (const candidate of candidates) {
        try {
            await access(candidate);
            return candidate;
        } catch {
            // Try the next configured SDK location.
        }
    }

    // Keep PATH support for installations that expose adb without an SDK variable.
    return 'adb';
}

async function readInbox(deviceId: string): Promise<SmsMessage[]> {
    try {
        const adbPath = await resolveAdbPath();
        const { stdout } = await execFileAsync(
            adbPath,
            ['-s', deviceId, 'shell', 'content', 'query', '--uri', 'content://sms/inbox', '--projection', 'body:date', '--sort', 'date DESC'],
            { timeout: 8_000, maxBuffer: 1_000_000 },
        );

        const messages: SmsMessage[] = [];
        const rowPattern = /Row:\s*\d+\s+body=(.*?),\s*date=(\d+)/g;
        for (const match of stdout.matchAll(rowPattern)) {
            const body = match[1];
            const receivedAt = Number(match[2]);
            if (body !== undefined && Number.isFinite(receivedAt)) {
                messages.push({ body, receivedAt });
            }
        }
        return messages;
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        throw new Error(
            `Could not read SMS from Android device "${deviceId}". Install Android SDK Platform-Tools, set ANDROID_HOME or ADB_PATH, and authorize the device for ADB. Details: ${detail}`,
        );
    }
}

function extractOtp(body: string): string | undefined {
    const patterns = [
        /(?:otp|one[\s-]*time(?:\s+password)?|verification(?:\s+code)?|security code)[^\d]{0,50}(\d{6})/i,
        /(\d{6})[^\d]{0,50}(?:otp|one[\s-]*time(?:\s+password)?|verification(?:\s+code)?|security code)/i,
    ];
    for (const pattern of patterns) {
        const match = body.match(pattern);
        if (match?.[1]) return match[1];
    }
    return undefined;
}

export async function getLatestSmsTimestamp(deviceId: string): Promise<number> {
    const [latest] = await readInbox(deviceId);
    return latest?.receivedAt ?? 0;
}

export async function waitForSmsOtp(deviceId: string, newerThan: number, timeoutMs = 90_000): Promise<string> {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
        const messages = await readInbox(deviceId);
        for (const message of messages) {
            if (message.receivedAt <= newerThan) continue;
            const otp = extractOtp(message.body);
            if (otp) return otp;
        }
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
    throw new Error(`No new six digit OTP SMS arrived on device "${deviceId}" within ${timeoutMs / 1_000} seconds.`);
}
