import { get } from 'svelte/store';
import { config } from '../stores/config';

export async function apiFetch(path: string, options: RequestInit = {}) {
    const $config = get(config);

    if (!$config.baseUrl || !$config.apiKey) {
        throw new Error('APISIX configuration missing');
    }

    const fetchOptions = { ...options };
    if (fetchOptions.body && typeof fetchOptions.body === 'object' && !(fetchOptions.body instanceof Blob)) {
        fetchOptions.body = JSON.stringify(fetchOptions.body);
    }

    const response = await fetch(`/api/proxy/${path}`, {
        ...fetchOptions,
        headers: {
            ...fetchOptions.headers,
            'x-apisix-url': $config.baseUrl,
            'x-apisix-key': $config.apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error_msg || errorData.message || errorData.error || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return response.json();
}

export async function checkConnection() {
    try {
        // Try to fetch routes as a health check
        await apiFetch('routes');
        return true;
    } catch (err) {
        console.error('Connection check failed:', err);
        return false;
    }
}
