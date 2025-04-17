"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Pencil, 
  Trash2, 
  FileText, 
  Loader, 
  AlertTriangle,
  Plus
} from 'lucide-react';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
}

export default function BlogManagement() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch blogs from API
        const response = await fetch('/api/admin/blogs');
        
        if (!response.ok) {
          if (response.status === 401) {
            // Redirect to login if unauthorized
            router.push('/admin/login');
            return;
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(id);
      
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete blog');
      }
      
      // Remove deleted blog from state
      setBlogs(blogs.filter(blog => blog._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete blog post. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  // For demo purposes, if no blogs are fetched, we'll use mock data
  useEffect(() => {
    if (!loading && blogs.length === 0 && !error) {
      // Mock data for demonstration
      const mockBlogs: Blog[] = [
        {
          _id: '1',
          title: 'Getting Started with Next.js',
          slug: 'getting-started-nextjs',
          published: true,
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Mastering TypeScript',
          slug: 'mastering-typescript',
          published: false,
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
      setBlogs(mockBlogs);
    }
  }, [loading, blogs.length, error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-3 text-blue-600 stroke-2" />
              Blog Management
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {blogs.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
              <p className="text-gray-500">No blog posts found. Create your first post!</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogs.map((blog) => (
                    <tr key={blog._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                        <div className="text-sm text-gray-500">/blogs/{blog.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          blog.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {blog.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/blogs/edit/${blog._id}`}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center mr-4 transition-transform hover:scale-105"
                        >
                          <Pencil className="mr-1 h-4 w-4" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          disabled={isDeleting === blog._id}
                          className="text-red-600 hover:text-red-900 inline-flex items-center disabled:opacity-50 transition-transform hover:scale-105"
                        >
                          {isDeleting === blog._id ? (
                            <>
                              <Loader className="animate-spin mr-1 h-4 w-4" /> Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-1 h-4 w-4" /> Delete
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
        
        <Link 
          href="/admin/blogs/create"
          className="fixed bottom-2 right-10 inline-flex items-center px-4 py-3 rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:shadow-xl group animate-bounce-slow"
          style={{
            animation: 'float 3s ease-in-out infinite',
            zIndex: 10,
          }}
        >
          <Plus className="mr-2 group-hover:rotate-90 transition-transform duration-300" size={20} />
          <span>Create New Blog</span>
        </Link>
      </div>
      
      {/* Add custom animation keyframes */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          50% {
            transform: translateY(-10px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
          100% {
            transform: translateY(0px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
        }
        .animate-bounce-slow {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}