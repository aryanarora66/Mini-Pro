// src/app/blogs/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { FaClock, FaTags } from 'react-icons/fa';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  tags?: string[];
}

async function getBlogs() {
  // Use absolute URL with the current origin - this resolves the URL issue
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                 (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '');
  
  try {
    const res = await fetch(`${baseUrl}/api/blogs`, {
      cache: 'no-store', // Don't cache this request
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch blogs: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export default async function BlogList() {
  const blogs: Blog[] = await getBlogs();

  return (
    <div className="bg-white py-24 px-4 sm:px-6 lg:px-8" style={{ paddingTop: '120px' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Blog</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Insights, strategies, and resources for startup founders and entrepreneurs.
          </p>
        </div>
        
        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <Link 
                key={blog._id} 
                href={`/blogs/${blog.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-56 overflow-hidden">
                  <Image 
                    src={blog.coverImage} 
                    width={500}
                    height={500}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <FaClock className="mr-1" />
                      {new Date(blog.publishedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    
                    {blog.tags && blog.tags.length > 0 && (
                      <span className="flex items-center">
                        <FaTags className="mr-1" />
                        {blog.tags.slice(0, 2).join(', ')}
                        {blog.tags.length > 2 && '...'}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  <div className="text-blue-600 font-medium">
                    Read more →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}