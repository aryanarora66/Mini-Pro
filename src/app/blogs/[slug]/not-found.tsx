// src/app/blogs/[slug]/not-found.tsx
import Link from 'next/link';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4" style={{ paddingTop: '80px' }}>
      <div className="text-center">
        <div className="inline-block p-4 bg-yellow-100 rounded-full mb-6">
          <FaExclamationTriangle className="h-12 w-12 text-yellow-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          We couldn&apos;t find the blog post your&apos;e looking for. It may have been removed or the URL might be incorrect.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/blogs" 
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" />
            Back to All Blogs
          </Link>
          
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}