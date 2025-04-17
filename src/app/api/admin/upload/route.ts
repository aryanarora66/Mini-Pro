// src/app/api/admin/upload/route.ts
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { cookies } from 'next/headers';

// Simple auth check without the full auth library
async function isAuthenticated() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  return !!sessionCookie?.value;
}

// Initialize ImageKit directly
function getImageKit() {
  if (!process.env.IMAGEKIT_PRIVATE_KEY || 
      !process.env.IMAGEKIT_PUBLIC_KEY || 
      !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error('ImageKit configuration missing');
  }

  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}

export async function POST(req: Request) {
  try {
    // Simple auth check
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.error('Upload unauthorized: No valid session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize ImageKit
    const imagekit = getImageKit();
    
    // Process form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer/base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    // Generate a unique filename
    const timestamp = Date.now();
    const fileName = `blog-${timestamp}-${file.name.replace(/\s+/g, '-')}`;

    console.log(`Uploading file: ${fileName}`);

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: base64,
      fileName,
      folder: '/blog-images',
    });

    console.log(`Upload successful: ${result.url}`);

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}