import type { AstroCookies } from 'astro';

export function getSession(cookies: AstroCookies) {
  const session = cookies.get('session');
  if (!session) return null;
  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export function requireAuth(cookies: AstroCookies) {
  const session = getSession(cookies);
  if (!session) return null;
  return session;
}