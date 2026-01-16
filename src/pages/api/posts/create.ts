import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = requireAuth(cookies);
  if (!session) return new Response('Unauthorized', { status: 401 });

  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const content = formData.get('content')?.toString();

    // The error often happens here if author_id is missing or invalid
    const { error } = await supabase
      .from('posts')
      .insert({ 
        title, 
        content, 
        author_id: session.id 
      });

    if (error) {
       console.error("Supabase Error:", error.message);
       return new Response('Error creating post', { status: 500 });
    }

    return redirect('/dashboard');
  } catch (err) {
    return new Response('Server Error', { status: 500 });
  }
};