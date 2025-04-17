import { NextResponse } from "next/server";
import { getImageKitAuth } from '@/lib/auth';

export async function GET() {
  try {
    const authParams = await getImageKitAuth();
    return NextResponse.json(authParams);
  } catch (error: any) {
    console.error("ImageKit auth error:", error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to authenticate with ImageKit' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; // Recommended for auth routes