import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = requireAuth(cookies);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const formData = await request.formData();
  const content = formData.get('content')?.toString();
  const postId = formData.get('postId')?.toString();

  if (!content || !postId) return new Response('Missing content', { status: 400 });

  const { error } = await supabase
    .from('comments')
    .insert({ 
      content, 
      post_id: parseInt(postId), 
      user_id: session.id 
    });

  if (error) return new Response(error.message, { status: 500 });

  return redirect(`/post/${postId}`);
};