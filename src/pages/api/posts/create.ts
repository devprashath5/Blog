import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  // 1. Check Auth
  const session = requireAuth(cookies);
  if (!session || !session.id) {
    return new Response('Unauthorized: No session found', { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const content = formData.get('content')?.toString();

    if (!title || !content) {
      return new Response('Missing title or content', { status: 400 });
    }

    // 2. Insert into Supabase
    const { error } = await supabase
      .from('posts')
      .insert({ 
        title, 
        content, 
        author_id: session.id // Ensure this matches your DB type (int vs text)
      });

    if (error) {
       console.error("Supabase Database Error:", error.message);
       return new Response(`DB Error: ${error.message}`, { status: 500 });
    }

    return redirect('/dashboard');
  } catch (err) {
    console.error("Critical Server Error:", err);
    return new Response('Internal Server Error', { status: 500 });
  }
};