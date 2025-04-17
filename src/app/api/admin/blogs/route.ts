// src/app/api/admin/blogs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Blog from '@/models/Blog';
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Using req.url to demonstrate usage of the request parameter
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const publishedOnly = searchParams.get('published') === 'true';
    
    const query = publishedOnly ? { published: true } : {};
    
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .select('_id title slug excerpt published publishedAt createdAt');

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }
    
    const blog = new Blog({
      ...body,
      author: session.user.id,
      publishedAt: body.published ? new Date() : null,
    });

    await blog.save();
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}