export interface SmsMessage {
    body: string;
    receivedAt: number;
}

export function parseInbox(stdout: string, stderr = ''): SmsMessage[] {
    // Only the preamble is diagnostic output; SMS bodies can contain any words.
    const firstRow = stdout.search(/^Row:\s*\d+\s+body=/m);
    const diagnostic = firstRow < 0 ? stdout : stdout.slice(0, firstRow);
    if (/usage:|\[ERROR\]|SecurityException|Permission Denial|Error while accessing/i.test(diagnostic + stderr)) {
        throw new Error('Android rejected the inbox query. Check SMS provider access and ADB authorization.');
    }
    if (firstRow < 0) {
        if (/^\s*No result found\.?\s*$/i.test(stdout)) return [];
        throw new Error('Unrecognized Android inbox response; no SMS rows were parsed.');
    }
    const messages: SmsMessage[] = [];
    for (const row of stdout.slice(firstRow).split(/(?=^Row:\s*\d+\s+body=)/m)) {
        const match = row.match(/^Row:\s*\d+\s+body=([\s\S]*),\s*date=(\d+)\s*$/);
        if (!match || match[1] === undefined) throw new Error('Malformed SMS row returned by Android.');
        messages.push({ body: match[1], receivedAt: Number(match[2]) });
    }
    return messages.sort((a, b) => b.receivedAt - a.receivedAt);
}

export function extractOtp(body: string): string | undefined {
    // No sender, brand or wording dependency. Skip ambiguous six-digit numbers.
    const codes = [...body.matchAll(/(?<!\d)\d{6}(?!\d)/g)].map(match => match[0]);
    const unique = [...new Set(codes)];
    return unique.length === 1 ? unique[0] : undefined;
}
