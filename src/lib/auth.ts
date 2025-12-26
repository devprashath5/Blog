import type { AstroCookies } from 'astro';

export function getSession(cookies: AstroCookies) {
  const sessionCookie = cookies.get('session');
  if (!sessionCookie || !sessionCookie.value) return null;
  
  try {
    const session = JSON.parse(sessionCookie.value);
    return session;
  } catch (error) {
    console.error('Session parse error:', error);
    return null;
  }
}

export function setSession(cookies: AstroCookies, user: { id: any; username: string; email: string }) {
  const session = {
    id: Number(user.id),
    username: user.username,
    email: user.email,
    created_at: new Date().toISOString()
  };
  
  const sessionString = JSON.stringify(session);
  
  cookies.set('session', sessionString, {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  });
  
  console.log('Session set for user:', user.username);
}

export function clearSession(cookies: AstroCookies) {
  cookies.delete('session', { path: '/' });
  console.log('Session cleared');
}

export function requireAuth(cookies: AstroCookies) {
  const session = getSession(cookies);
  if (!session) {
    return null;
  }
  return session;
}