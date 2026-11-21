import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';

const host = process.env.APPIUM_HOST ?? '127.0.0.1';
const port = Number(process.env.APPIUM_PORT ?? 4723);
const statusUrl = `http://${host}:${port}/status`;
const startupTimeoutMs = 30_000;

async function isAppiumReady() {
    try {
        const response = await fetch(statusUrl, { signal: AbortSignal.timeout(1_000) });
        return response.ok;
    } catch {
        return false;
    }
}

function stopAppium(server: ChildProcess) {
    return new Promise<void>((resolve) => {
        if (server.exitCode !== null || server.signalCode !== null) {
            resolve();
            return;
        }

        const forceStop = setTimeout(() => server.kill('SIGKILL'), 5_000);
        forceStop.unref();
        server.once('exit', () => {
            clearTimeout(forceStop);
            resolve();
        });
        server.kill();
    });
}

export default async function globalSetup() {
    if (await isAppiumReady()) {
        console.log(`Using existing Appium server at ${statusUrl}`);
        return;
    }

    const appiumCli = path.resolve(process.cwd(), 'node_modules', 'appium', 'index.js');
    let output = '';
    const server = spawn(process.execPath, [appiumCli, '--address', host, '--port', String(port)], {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
    });

    const captureOutput = (chunk: Buffer) => {
        output = `${output}${chunk.toString()}`.slice(-4_000);
    };
    server.stdout?.on('data', captureOutput);
    server.stderr?.on('data', captureOutput);

    const startedAt = Date.now();
    while (Date.now() - startedAt < startupTimeoutMs) {
        if (await isAppiumReady()) {
            console.log(`Started Appium server at ${statusUrl}`);
            return async () => stopAppium(server);
        }

        if (server.exitCode !== null || server.signalCode !== null) {
            break;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    await stopAppium(server);
    throw new Error(
        `Could not start Appium at ${statusUrl}. Check that Appium and its UiAutomator2 driver are installed.\n${output}`
    );
}
