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
    const title = formData.get('title')?.toString();
    const content = formData.get('content')?.toString();

    if (!title || !content) {
      return new Response('Missing title or content', { status: 400 });
    }

    db.prepare(
      'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)'
    ).run(title, content, session.id);

    return redirect('/dashboard');
  } catch (error) {
    console.error('Create post error:', error);
    return new Response('Error creating post', { status: 500 });
  }
};