import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import db from '../../../lib/db';
import { setSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return new Response('Missing email or password', { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      return new Response('Invalid credentials', { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return new Response('Invalid credentials', { status: 401 });
    }

    setSession(cookies, {
      id: user.id,
      username: user.username,
      email: user.email
    });

    return redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    return new Response('Error logging in', { status: 500 });
  }
};