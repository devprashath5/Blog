import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import db from '../../../lib/db';
import { setSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const username = formData.get('username')?.toString();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!username || !email || !password) {
      return new Response('Missing required fields', { status: 400 });
    }

    if (password.length < 6) {
      return new Response('Password must be at least 6 characters', { status: 400 });
    }

    if (username.length < 3) {
      return new Response('Username must be at least 3 characters', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
      
      if (existingUser) {
        return new Response('Username or email already exists', { status: 400 });
      }

      const result = db.prepare(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
      ).run(username, email, hashedPassword);

      const userId = result.lastInsertRowid;

      const user = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(userId);

      if (!user) {
        return new Response('Error creating account', { status: 500 });
      }

      setSession(cookies, {
        id: user.id,
        username: user.username,
        email: user.email
      });

      return redirect('/dashboard');
    } catch (error: any) {
      console.error('Database error:', error);
      if (error.message && error.message.includes('UNIQUE')) {
        return new Response('Username or email already exists', { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Signup error:', error);
    return new Response('Error creating account. Please try again.', { status: 500 });
  }
};