import { DocumentProvider } from '../providers/document/registry.js';

const provider = DocumentProvider(process.env.DOCUMENT_PROVIDER || 'local');

export function supportsDocument(mimeType) {
    return provider.supports(mimeType);
}

export async function extractDocumentText(file, { maxCharacters = 50000 } = {}) {
    if (!file?.buffer) throw new Error('A document file is required');
    if (!provider.supports(file.mimetype)) throw new Error(`Unsupported document type: ${file.mimetype}`);

    const rawText = await provider.extractText(file);
    const normalized = String(rawText || '')
        .replace(/\0/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{4,}/g, '\n\n\n')
        .trim();

    if (normalized.length < 20) throw new Error('The document does not contain enough readable text');
    return normalized.slice(0, maxCharacters);
}
