import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = requireAuth(cookies);
  if (!session) return new Response('Unauthorized', { status: 401 });

  try {
    const formData = await request.formData();
    const postId = formData.get('postId')?.toString();
    const title = formData.get('title')?.toString();
    const content = formData.get('content')?.toString();

    const { error } = await supabase
      .from('posts')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', postId)
      .eq('author_id', session.id);

    if (error) throw error;
    return redirect('/dashboard');
  } catch (error) {
    return new Response('Error updating post', { status: 500 });
  }
};