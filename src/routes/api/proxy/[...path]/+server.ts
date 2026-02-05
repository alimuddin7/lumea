import { error, json } from '@sveltejs/kit';
import type { RequestHandler, RequestEvent } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, request, url }: RequestEvent) => {
    const path = params.path;
    const adminUrl = request.headers.get('x-apisix-url');
    const apiKey = request.headers.get('x-apisix-key');

    if (!adminUrl || !apiKey) {
        return json({ error: 'Missing APISIX configuration' }, { status: 400 });
    }

    const targetUrl = `${adminUrl}/${path}${url.search}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            }
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: text || 'Empty response' };
        }
        return json(data, { status: response.status });
    } catch (err: any) {
        console.error('Proxy error:', err);
        return json({ error: err.message }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ params, request }: RequestEvent) => {
    const path = params.path;
    const adminUrl = request.headers.get('x-apisix-url');
    const apiKey = request.headers.get('x-apisix-key');

    if (!adminUrl || !apiKey) {
        return json({ error: 'Missing APISIX configuration' }, { status: 400 });
    }

    const body = await request.json();
    const targetUrl = `${adminUrl}/${path}`;

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: text || 'Empty response' };
        }
        return json(data, { status: response.status });
    } catch (err: any) {
        return json({ error: err.message }, { status: 500 });
    }
};

export const PUT: RequestHandler = async ({ params, request }: RequestEvent) => {
    const path = params.path;
    const adminUrl = request.headers.get('x-apisix-url');
    const apiKey = request.headers.get('x-apisix-key');

    if (!adminUrl || !apiKey) {
        return json({ error: 'Missing APISIX configuration' }, { status: 400 });
    }

    const body = await request.json();
    const targetUrl = `${adminUrl}/${path}`;

    try {
        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: text || 'Empty response' };
        }
        return json(data, { status: response.status });
    } catch (err: any) {
        return json({ error: err.message }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ params, request }: RequestEvent) => {
    const path = params.path;
    const adminUrl = request.headers.get('x-apisix-url');
    const apiKey = request.headers.get('x-apisix-key');

    if (!adminUrl || !apiKey) {
        return json({ error: 'Missing APISIX configuration' }, { status: 400 });
    }

    const targetUrl = `${adminUrl}/${path}`;

    try {
        const response = await fetch(targetUrl, {
            method: 'DELETE',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            }
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: text || 'Empty response' };
        }
        return json(data, { status: response.status });
    } catch (err: any) {
        return json({ error: err.message }, { status: 500 });
    }
};
