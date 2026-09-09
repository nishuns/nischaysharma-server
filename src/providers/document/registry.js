import LocalDocumentProvider from './local/index.js';

const providers = {
    local: LocalDocumentProvider
};

export function DocumentProvider(providerName = 'local') {
    const ProviderClass = providers[providerName];
    if (!ProviderClass) throw new Error(`Document provider '${providerName}' not found`);
    return new ProviderClass();
}
