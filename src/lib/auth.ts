import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import ImageKit from 'imagekit';

// Ensure AUTH_SECRET is set
const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET is not defined in environment variables');
}

const secretKey = new TextEncoder().encode(AUTH_SECRET);

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'editor';
  };
}

// Session management
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = (await cookieStore).get('session')?.value;

    if (!sessionCookie) return null;

    const { payload } = await jwtVerify(sessionCookie, secretKey, {
      algorithms: ['HS256'],
    });

    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.name as string,
        role: payload.role as 'admin' | 'editor',
      },
    };
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function createSession(user: Session['user']) {
  if (!AUTH_SECRET) {
    throw new Error('AUTH_SECRET not configured');
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const sessionToken = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey);

  const cookieStore = cookies();
  
  (await cookieStore).set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });

  (await cookieStore).set('isAuthenticated', 'true', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function destroySession() {
  const cookieStore = cookies();
  (await cookieStore).delete('session');
  (await cookieStore).delete('isAuthenticated');
}

// ImageKit authentication
export async function getImageKitAuth() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  if (!process.env.IMAGEKIT_PRIVATE_KEY || 
      !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 
      !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
    throw new Error('ImageKit configuration missing');
  }

  const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  });

  return imagekit.getAuthenticationParameters();
}