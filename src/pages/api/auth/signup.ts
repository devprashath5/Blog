import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const username = formData.get('username')?.toString();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!username || !email || !password) {
    return new Response('Missing fields', { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Insert the user. 
  // The 'id' will be generated automatically as a UUID by the DB.
  const { data, error } = await supabase
    .from('users')
    .insert({ username, email, password: hashedPassword })
    .select('id') // Explicitly select the new UUID back
    .single();

  if (error) {
    console.error("Signup Error:", error.message);
    return new Response(error.message, { status: 400 });
  }

  // LOGGING: This should now look like: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  console.log("New User Created with UUID:", data.id);

  return redirect('/login');
};