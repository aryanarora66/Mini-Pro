// src/app/api/admin/blogs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb"
import Blog from '@/models/Blog';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest, // [id] -> dynamic , promise 
  { params }: { params: Promise<{ id: string }> } // id -> blog , // ssr , params -> promise , async (resolve , reject , pending)
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const resolvedParams = await params; 
    
    // Properly handle the id parameter
    const blogId = resolvedParams.id;
    
    // Remove author restriction to simplify debugging
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // static (hardcode )
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const resolvedPromise = await params; // 'await' has no effect on the type of this expression.ts(80007)
    
    // Properly handle the id parameter
    const blogId = resolvedPromise.id;
    const body = await request.json();
    
    // Remove author restriction to simplify debugging
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      body,
      { new: true }
    );

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const resolvedParams = await params;
    // Properly handle the id parameter
    const blogId = resolvedParams.id;
    
    // Remove author restriction to simplify debugging
    const blog = await Blog.findByIdAndDelete(blogId);
    
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}