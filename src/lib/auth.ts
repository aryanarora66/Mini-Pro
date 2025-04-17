// lib/auth.ts
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import ImageKit from 'imagekit';

// Make sure AUTH_SECRET is set
const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
  console.error('AUTH_SECRET is not defined in environment variables');
}

const secretKey = new TextEncoder().encode(AUTH_SECRET || 'fallback-secret-for-dev-only');

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
    // Properly await cookies() - this is the key change
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return null;
    }

    try {
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
    } catch (jwtError) {
      console.error('Session verification failed:', jwtError);
      return null;
    }
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function createSession(user: Session['user']) {
  try {
    if (!AUTH_SECRET) {
      throw new Error('AUTH_SECRET is not configured');
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

    // Log session creation (for debugging)
    console.log(`Creating session for user: ${user.email}, expires: ${expiresAt.toISOString()}`);

    // Properly await cookies() before using set()
    const cookieStore = await cookies();
    
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });
    
    // Also set a non-HTTP only cookie for client-side authentication check
    cookieStore.set('isAuthenticated', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });
    
    return true;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

export async function destroySession() {
  try {
    // Properly await cookies() before using delete()
    const cookieStore = await cookies();
    
    cookieStore.delete('session');
    cookieStore.delete('isAuthenticated');
    return true;
  } catch (error) {
    console.error('Error destroying session:', error);
    throw error;
  }
}

// ImageKit authentication
export async function getImageKitClient(): Promise<ImageKit> {
  try {
    const session = await getSession();
    
    if (!session) {
      throw new Error('Unauthorized: No valid session');
    }

    if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      throw new Error('ImageKit configuration missing');
    }

    return new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (error) {
    console.error('Error getting ImageKit client:', error);
    throw error;
  }
}

export async function generateImageKitAuth() {
  try {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    const imagekit = await getImageKitClient();
    return imagekit.getAuthenticationParameters();
  } catch (error) {
    console.error('Error generating ImageKit auth:', error);
    throw error;
  }
}