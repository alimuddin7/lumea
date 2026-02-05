import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const session = event.cookies.get('session');

    if (!session && !event.url.pathname.startsWith('/login') && !event.url.pathname.startsWith('/api/proxy')) {
        throw redirect(303, '/login');
    }

    if (session && event.url.pathname === '/login') {
        throw redirect(303, '/routes');
    }

    const response = await resolve(event);
    return response;
};
