class BaseDocumentProvider {
    supports(_mimeType) {
        return false;
    }

    async extractText(_file) {
        throw new Error('extractText method is not implemented');
    }
}

export default BaseDocumentProvider;
