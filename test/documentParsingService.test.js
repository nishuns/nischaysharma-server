import test from 'node:test';
import assert from 'node:assert/strict';
import { extractDocumentText, supportsDocument } from '../src/services/documentParsingService.js';
import { renderSlidesPdf } from '../src/services/socialPostService.js';

test('document provider advertises supported resume formats', () => {
    assert.equal(supportsDocument('application/pdf'), true);
    assert.equal(supportsDocument('application/vnd.openxmlformats-officedocument.wordprocessingml.document'), true);
    assert.equal(supportsDocument('text/plain'), true);
    assert.equal(supportsDocument('image/png'), false);
});

test('document parsing service normalizes plain text', async () => {
    const parsed = await extractDocumentText({
        mimetype: 'text/plain',
        buffer: Buffer.from('Nischay Sharma   \nSoftware engineer and product builder with extensive experience.')
    });

    assert.equal(parsed, 'Nischay Sharma\nSoftware engineer and product builder with extensive experience.');
});

test('document parsing service rejects unsupported files', async () => {
    await assert.rejects(
        extractDocumentText({ mimetype: 'image/png', buffer: Buffer.from('not a resume document') }),
        /Unsupported document type/
    );
});

test('local document provider extracts text from a PDF buffer', async () => {
    const pdf = renderSlidesPdf([
        { headline: 'Professional experience', body: 'Software engineering and product delivery.' },
        { headline: 'Education', body: 'Computer Science.' }
    ]);
    const parsed = await extractDocumentText({ mimetype: 'application/pdf', buffer: pdf });

    assert.match(parsed, /Professional experience/);
    assert.match(parsed, /Computer Science/);
});
