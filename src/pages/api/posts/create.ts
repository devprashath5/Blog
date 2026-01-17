import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  // 1. Check Auth
  // requireAuth should return the session object stored in your cookies
  const session = requireAuth(cookies);

  // If session is missing or id is not a valid string, reject
  if (!session || !session.id) {
    console.error("Auth Failure: No session or ID found in cookies");
    return new Response('Unauthorized: Please log in again', { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const content = formData.get('content')?.toString();

    // Basic Validation
    if (!title || !content) {
      return new Response('Missing title or content', { status: 400 });
    }

    // 2. Insert into Supabase
    // Note: author_id MUST be the UUID string from the session
    const { error } = await supabase
      .from('posts')
      .insert({ 
        title, 
        content, 
        author_id: session.id 
      });

    if (error) {
       console.error("Supabase Database Error:", error.message);
       // If this still says "invalid input syntax for uuid", 
       // it means session.id is a number (e.g. "2") instead of a UUID string.
       return new Response(`Database Error: ${error.message}`, { status: 500 });
    }

    // 3. Success! Redirect to the index or dashboard
    return redirect('/');
  } catch (err) {
    console.error("Critical Server Error:", err);
    return new Response('Internal Server Error', { status: 500 });
  }
};