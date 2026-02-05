import yaml from 'js-yaml';

export interface APISIXConfig {
    routes?: any[];
    upstreams?: any[];
    services?: any[];
    consumers?: any[];
    ssls?: any[];
    global_rules?: any[];
}

export function exportConfig(data: APISIXConfig, format: 'json' | 'yaml' = 'json'): string {
    if (format === 'yaml') {
        return yaml.dump(data);
    }
    return JSON.stringify(data, null, 2);
}

export function parseConfig(content: string, format: 'json' | 'yaml'): APISIXConfig {
    if (format === 'yaml') {
        return yaml.load(content) as APISIXConfig;
    }
    return JSON.parse(content);
}

export function generateDiff(oldConfig: APISIXConfig, newConfig: APISIXConfig) {
    // Basic diff logic - in a real app, use a proper diff library
    // For now, we'll just show what's being added/updated/deleted at a high level
    const summary = {
        added: 0,
        updated: 0,
        deleted: 0,
        details: [] as string[]
    };

    const keys: (keyof APISIXConfig)[] = ['routes', 'upstreams', 'services', 'consumers', 'ssls'];

    keys.forEach(key => {
        const oldItems = oldConfig[key] || [];
        const newItems = newConfig[key] || [];

        newItems.forEach((newItem: any) => {
            const oldItem = oldItems.find((o: any) => o.id === newItem.id || o.username === newItem.username);
            if (!oldItem) {
                summary.added++;
                summary.details.push(`[ADD] ${key}: ${newItem.id || newItem.username || 'Unnamed'}`);
            } else if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
                summary.updated++;
                summary.details.push(`[UPDATE] ${key}: ${newItem.id || newItem.username || 'Unnamed'}`);
            }
        });

        oldItems.forEach((oldItem: any) => {
            const newItem = newItems.find((n: any) => n.id === oldItem.id || n.username === oldItem.username);
            if (!newItem) {
                summary.deleted++;
                summary.details.push(`[DELETE] ${key}: ${oldItem.id || oldItem.username || 'Unnamed'}`);
            }
        });
    });

    return summary;
}
