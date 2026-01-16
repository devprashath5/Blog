import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const username = formData.get('username')?.toString();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!username || !email || !password) return new Response('Missing fields', { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('users')
    .insert({ username, email, password: hashedPassword });

  if (error) return new Response(error.message, { status: 400 });
  return redirect('/login');
};