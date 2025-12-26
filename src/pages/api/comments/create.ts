import type { APIRoute } from 'astro';
import db from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = requireAuth(cookies);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const formData = await request.formData();
    const postId = formData.get('postId')?.toString();
    const content = formData.get('content')?.toString();

    if (!postId || !content) {
      return new Response('Missing required fields', { status: 400 });
    }

    db.prepare(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)'
    ).run(postId, session.id, content);

    return redirect(`/post/${postId}`);
  } catch (error) {
    console.error('Create comment error:', error);
    return new Response('Error creating comment', { status: 500 });
  }
};