import { execFile } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { parseInbox, extractOtp, type SmsMessage } from './sms-parser';

const execFileAsync = promisify(execFile);
const pollIntervalMs = 2_000;


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
        const { stdout, stderr } = await execFileAsync(
            adbPath,
            [
                '-s',
                deviceId,
                'shell',
                'content',
                'query',
                '--uri',
                'content://sms/inbox',
                '--projection',
                'body:date',
            ],
            { timeout: 8_000, maxBuffer: 1_000_000 },
        );

        return parseInbox(stdout, stderr);
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        throw new Error(
            `Could not read SMS from Android device "${deviceId}". Install Android SDK Platform-Tools, set ANDROID_HOME or ADB_PATH, and authorize the device for ADB. Details: ${detail}`,
        );
    }
}


export async function getLatestSmsTimestamp(deviceId: string): Promise<number> {
    const [latest] = await readInbox(deviceId);
    return latest?.receivedAt ?? 0;
}

export async function waitForSmsOtp(deviceId: string, newerThan: number, timeoutMs = 150_000): Promise<string> {
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
    throw new Error(`No matching fresh six-digit OTP was found in the device SMS inbox within ${timeoutMs / 1_000} seconds. Confirm delivery to this device; notification-only messages are not SMS inbox records.`);
}
