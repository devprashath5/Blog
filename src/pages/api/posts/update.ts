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
    const title = formData.get('title')?.toString();
    const content = formData.get('content')?.toString();

    if (!postId || !title || !content) {
      return new Response('Missing required fields', { status: 400 });
    }

    const post = db.prepare('SELECT * FROM posts WHERE id = ? AND author_id = ?').get(postId, session.id);

    if (!post) {
      return new Response('Post not found or unauthorized', { status: 404 });
    }

    db.prepare(
      'UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(title, content, postId);

    return redirect('/dashboard');
  } catch (error) {
    console.error('Update post error:', error);
    return new Response('Error updating post', { status: 500 });
  }
};