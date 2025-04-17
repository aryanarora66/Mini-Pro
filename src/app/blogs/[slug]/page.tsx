// src/app/blogs/[slug]/page.tsx
import { FaClock, FaTags, FaUser } from 'react-icons/fa';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  coverImage: string;
  publishedAt: string;
  author: string;
  tags?: string[];
}

async function getBlog(slug: string) {
  // Use absolute URL with the current origin - this resolves the URL issue
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                 (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '');
  
  try {
    const res = await fetch(`${baseUrl}/api/blogs/${slug}`, {
      cache: 'no-store',
    });
    
    if (res.status === 404) {
      return null;
    }
    
    if (!res.ok) {
      throw new Error(`Failed to fetch blog: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error(`Error fetching blog with slug ${slug}:`, error);
    return null;
  }
}

export default async function BlogDetail({ params }: { params: { slug: string } }) {
  // Make sure params.slug is a string
  const slug = params.slug;
  if (typeof slug !== 'string') {
    notFound();
  }
  
  const blog: BlogPost | null = await getBlog(slug);
  
  if (!blog) {
    notFound();
  }

  return (
    <div className="bg-white py-24 px-4 sm:px-6 lg:px-8" style={{ paddingTop: '120px' }}>
      <div className="max-w-4xl mx-auto">
        {/* Featured Image */}
        <div className="rounded-2xl overflow-hidden mb-8 h-80 md:h-96">
          <img 
            src={blog.coverImage} 
            alt={blog.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Blog Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              <FaClock className="mr-2" />
              {new Date(blog.publishedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            
            <span className="flex items-center">
              <FaUser className="mr-2" />
              {blog.author || 'Anonymous'}
            </span>
            
            {blog.tags && blog.tags.length > 0 && (
              <span className="flex items-center">
                <FaTags className="mr-2" />
                {blog.tags.join(', ')}
              </span>
            )}
          </div>
        </div>
        
        {/* Blog Content */}
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        
        {/* Back Button */}
        <div className="border-t pt-8">
          <Link 
            href="/blogs" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to all blogs
          </Link>
        </div>
      </div>
    </div>
  );
}