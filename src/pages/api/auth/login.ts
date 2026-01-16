import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) return new Response('Missing fields', { status: 400 });

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return new Response('Invalid email or password', { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return new Response('Invalid email or password', { status: 401 });
  }

  // Set session cookie
  cookies.set('session', JSON.stringify({ id: user.id, username: user.username }), {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  return redirect('/dashboard');
};