import { NextResponse } from "next/server";
import { getImageKitAuth } from '@/lib/auth'; // Assuming this returns ImageKit authentication parameters

export async function GET() {
  try {
    const authParams = await getImageKitAuth();
    // Assuming getImageKitAuth returns an object compatible with NextResponse.json
    return NextResponse.json(authParams);
  } catch (error: unknown) { // <--- Changed from 'any' to 'unknown'
    console.error("ImageKit auth error:", error);

    let errorMessage = 'Failed to authenticate with ImageKit'; // Default error message
    let statusCode = 500; // Default status code

    // Check if the error is an instance of Error to safely access message
    if (error instanceof Error) {
        errorMessage = error.message; // Now it's safe to access .message

        // Check for specific error message after confirming it's an Error
        if (error.message === 'Unauthorized') {
            errorMessage = 'Authentication required';
            statusCode = 401;
        }
    } else if (typeof error === 'string') {
        // Handle cases where a string might have been thrown
        errorMessage = error;
         if (error === 'Unauthorized') { // Check if the string itself is 'Unauthorized'
            errorMessage = 'Authentication required';
            statusCode = 401;
        }
    }
    // You could add more checks here for other potential error types if needed

    // Return the JSON response with the determined message and status code
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

// Keep force-dynamic if needed for authentication routes that should not be cached
export const dynamic = 'force-dynamic';