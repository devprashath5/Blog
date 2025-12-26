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

    if (!postId) {
      return new Response('Missing post ID', { status: 400 });
    }

    const post = db.prepare('SELECT * FROM posts WHERE id = ? AND author_id = ?').get(postId, session.id);

    if (!post) {
      return new Response('Post not found or unauthorized', { status: 404 });
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);

    return redirect('/dashboard');
  } catch (error) {
    console.error('Delete post error:', error);
    return new Response('Error deleting post', { status: 500 });
  }
};