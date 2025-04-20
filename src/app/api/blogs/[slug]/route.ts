// src/app/api/blogs/[slug]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try{
    await connectDB();
    const resolvedPromise = await params; 
    try {
      // Find the blog post by slug
      const blog = await Blog.findOne({ 
        slug: resolvedPromise.slug,
        published: true 
      }).lean();
      
      if (!blog) {
        return NextResponse.json(
          { error: 'Blog not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(blog);
    } catch (error) {
      console.error(`Failed to fetch blog with slug ${resolvedPromise.slug}:`, error);
      return NextResponse.json(
        { error: 'Failed to fetch blog' },
        { status: 500 }
      );
    }
  }
  catch(err){
    console.log(err);
  }
}