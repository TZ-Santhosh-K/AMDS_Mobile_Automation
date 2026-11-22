const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const source = stripTypeScriptTypes(readFileSync('utils/sms-parser.ts', 'utf8'));
const parser = import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('SMS diagnostic words and multiline bodies are data, not command errors', async () => {
    const { parseInbox } = await parser;
    const rows = parseInbox('Row: 0 body=Data usage: 50%\n[ERROR] quoted text, date=100\nRow: 1 body=123456, date=200\n');
    assert.equal(rows.length, 2);
    assert.equal(rows[0].receivedAt, 200);
    assert.match(rows[1].body, /usage:/);
});

test('actual diagnostics and malformed responses fail; empty inbox is valid', async () => {
    const { parseInbox } = await parser;
    for (const text of ['usage: adb shell content', 'SecurityException: denied', '', 'Row: 0 body=bad']) {
        assert.throws(() => parseInbox(text));
    }
    assert.deepEqual(parseInbox('No result found.\n'), []);
});

test('six-digit extraction is template independent and rejects ambiguity', async () => {
    const { extractOtp } = await parser;
    assert.equal(extractOtp('123456'), '123456');
    assert.equal(extractOtp('உங்கள் குறியீடு: 012345'), '012345');
    assert.equal(extractOtp('Code 123456 repeated 123456'), '123456');
    assert.equal(extractOtp('123456 and 654321'), undefined);
    assert.equal(extractOtp('1234567'), undefined);
});
