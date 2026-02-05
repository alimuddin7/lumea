import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import fs from 'node:fs';
import path from 'node:path';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');

        try {
            const usersPath = path.join(process.cwd(), 'data/users.json');
            console.log('Resolved usersPath:', usersPath);

            if (!fs.existsSync(usersPath)) {
                console.error('User database file missing at:', usersPath);
                return fail(500, { error: 'System error: user database unavailable' });
            }

            let users;
            try {
                users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
            } catch (err) {
                console.error('Error parsing users.json:', err);
                return fail(500, { error: 'System error: database corruption' });
            }

            console.log('Login attempt for user:', username);
            const user = users.find((u: any) => u.username === username && u.password === password);

            if (user) {
                console.log('Login successful for:', username);
                cookies.set('session', 'true', {
                    path: '/',
                    httpOnly: true,
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 24 // 1 day
                });
                throw redirect(303, '/routes');
            }

            console.log('Login failed: Invalid credentials for', username);
            return fail(400, { error: 'Invalid username or password' });
        } catch (err) {
            if (err instanceof Response) throw err; // Handle redirect
            console.error('Login action error:', err);
            return fail(500, { error: 'Server error during login' });
        }
    }
};
