// lib/simple-auth.ts
import { cookies } from 'next/headers';

// Use this as a simpler alternative to check authentication
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  
  // First try to get the session cookie
  const sessionCookie = cookieStore.get('session')?.value;
  if (sessionCookie) return true;
  
  // If that fails, check the simpler isAuthenticated cookie
  const isAuthCookie = cookieStore.get('isAuthenticated')?.value === 'true';
  return isAuthCookie;
}