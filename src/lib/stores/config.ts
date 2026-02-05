import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Config {
    baseUrl: string;
    apiKey: string;
}

const DEFAULT_CONFIG: Config = {
    baseUrl: 'http://12.12.12.5:19180/apisix/admin',
    apiKey: 'iBIESRYmMCCajlvVSyepbWNEMvdotMEP'
};

const storedConfig = browser ? localStorage.getItem('apisix_config') : null;
const initialConfig: Config = storedConfig ? JSON.parse(storedConfig) : DEFAULT_CONFIG;

export const config = writable<Config>(initialConfig);

if (browser) {
    config.subscribe((value) => {
        localStorage.setItem('apisix_config', JSON.stringify(value));
    });
}

export const connectionStatus = writable<'connected' | 'disconnected' | 'checking'>('checking');
