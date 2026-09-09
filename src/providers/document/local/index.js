import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import BaseDocumentProvider from '../base.js';

const supportedTypes = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
]);

class LocalDocumentProvider extends BaseDocumentProvider {
    supports(mimeType) {
        return supportedTypes.has(mimeType);
    }

    async extractText(file) {
        if (!file?.buffer) throw new Error('A document file is required');
        if (!this.supports(file.mimetype)) throw new Error(`Unsupported document type: ${file.mimetype}`);

        if (file.mimetype === 'application/pdf') {
            // The package root runs a bundled demo under Node ESM, so use its library entry.
            return (await pdfParse(file.buffer)).text;
        }
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return (await mammoth.extractRawText({ buffer: file.buffer })).value;
        }
        return file.buffer.toString('utf8');
    }
}

export default LocalDocumentProvider;
