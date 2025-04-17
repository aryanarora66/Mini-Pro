// src/app/admin/login/route.ts
import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    // Parse JSON body and handle potential parsing errors
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return NextResponse.json(
        { error: 'Invalid request body - expected JSON' },
        { status: 400 }
      );
    }
    
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // In a real application, you would fetch the user from your database
    // For this example, we'll use environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not configured');
      return NextResponse.json(
        { error: 'Admin credentials not configured properly' },
        { status: 500 }
      );
    }

    // Log what we're checking (for debugging)
    console.log(`Checking login for email: ${email}`);
    console.log(`Admin email from env: ${adminEmail}`);

    // Check if credentials match
    if (email !== adminEmail) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    let isPasswordValid = false;
    
    // Check if the admin password is already hashed (starts with $2a$)
    if (adminPassword.startsWith('$2a$')) {
      isPasswordValid = await bcrypt.compare(password, adminPassword);
    } else {
      // For development convenience - direct comparison
      // In production, you should ALWAYS use hashed passwords
      isPasswordValid = password === adminPassword;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create a session
    try {
      await createSession({
        id: 'admin',
        email: adminEmail,
        name: adminName,
        role: 'admin'
      });
    } catch (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Create a response with the success message
    const response = NextResponse.json({ success: true });
    
    // We're not setting cookies here anymore since createSession handles that

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}