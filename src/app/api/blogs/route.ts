// src/app/api/blogs/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Blog from '@/models/Blog';

export async function GET() {
  try {
    await connectDB();
    
    // Fetch only published blogs and sort by publishedAt in descending order
    const blogs = await Blog.find({ published: true })
      .sort({ publishedAt: -1 })
      .select('title slug excerpt coverImage publishedAt tags')
      .lean();
    
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}