"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FaArrowLeft, FaSpinner, FaExclamationTriangle, FaCheck, FaCalendarAlt, FaNewspaper, FaImage } from 'react-icons/fa';
import { useImageUpload } from '@/app/hooks/useImageUpload';

// Lazy load the rich text editor
const RichTextEditor = dynamic(
  () => import('@/components/RichTextEditor'),
  { ssr: false, loading: () => <div className="border rounded-md p-4 bg-gray-50">Loading editor...</div> }
);

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string;
  published: boolean;
  publishedAt?: string;
  createdAt?: string;
}

export default function EditBlog({ params }: { params: { id: string } }) {
  const router = useRouter();
  const blogId = params.id;

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    tags: '',
    published: false
  });
  
  const [originalData, setOriginalData] = useState<BlogFormData | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { uploadImage, isUploading, progress } = useImageUpload();

  // Check if form has changes
  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/blogs/${blogId}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        if (response.status === 404) {
          throw new Error('Blog post not found');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blog = await response.json();
      const formattedBlog = {
        ...blog,
        tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      };

      setFormData(formattedBlog);
      setOriginalData(formattedBlog);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
  }, [blogId, router, setError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
    
    if (validationErrors.content) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.content;
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({
          ...prev,
          coverImage: 'Please select an image file'
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({
          ...prev,
          coverImage: 'Image size must be less than 5MB'
        }));
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.coverImage;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.slug.trim()) errors.slug = 'Slug is required';
    if (!formData.content.trim()) errors.content = 'Content is required';
    if (!formData.excerpt.trim()) errors.excerpt = 'Excerpt is required';
    if (!imageFile && !formData.coverImage) errors.coverImage = 'Cover image is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let coverImageUrl = formData.coverImage;
      if (imageFile) {
        try {
          const url = await uploadImage(imageFile);
          coverImageUrl = url;
        } catch (uploadError) {
          throw new Error('Failed to upload image: ' + (uploadError instanceof Error ? uploadError.message : 'Unknown error'));
        }
      }

      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      const updateData = {
        ...formData,
        coverImage: coverImageUrl,
        tags
      };

      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update blog (${response.status})`);
      }

      const updatedBlog = await response.json();
      setSuccess('Blog post updated successfully!');
      
      setFormData({
        ...updatedBlog,
        tags: Array.isArray(updatedBlog.tags) ? updatedBlog.tags.join(', ') : ''
      });
      
      // Update original data after successful save
      setOriginalData({
        ...updatedBlog,
        tags: Array.isArray(updatedBlog.tags) ? updatedBlog.tags.join(', ') : ''
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700">Loading blog data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/admin/blogs')}
              className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Back to blogs"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FaNewspaper className="mr-3 text-blue-600" />
              Edit Blog Post
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCheck className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Meta info */}
          {formData.createdAt && (
            <div className="px-6 py-3 bg-gray-50 border-b">
              <div className="flex flex-wrap items-center text-sm text-gray-500">
                <div className="mr-6 flex items-center">
                  <FaCalendarAlt className="mr-1" />
                  Created: {new Date(formData.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                
                {formData.publishedAt && (
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    Published: {new Date(formData.publishedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    validationErrors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    validationErrors.slug ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.slug && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.slug}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  URL: /blogs/{formData.slug}
                </p>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image *
              </label>
              
              {(formData.coverImage || imagePreview) && (
                <div className="mb-3 relative">
                  <Image 
                    src={imagePreview || formData.coverImage}
                    alt="Cover" 
                    width={800}
                    height={400}
                    className="h-40 w-full object-cover rounded"
                    priority={false}
                  />
                </div>
              )}
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50">
                <div className="space-y-1 text-center">
                  <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus:outline-none">
                      <span>{formData.coverImage ? 'Replace image' : 'Upload a file'}</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={handleImageChange}
                        disabled={isSubmitting || isUploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
              
              {isUploading && (
                <div className="mt-2">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div 
                        style={{ width: `${progress}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">{progress}% Uploaded</p>
                  </div>
                </div>
              )}
              
              {validationErrors.coverImage && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.coverImage}</p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                Excerpt *
              </label>
              <p className="mt-1 text-xs text-gray-500">
                A brief summary of your blog post
              </p>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                value={formData.excerpt}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  validationErrors.excerpt ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.excerpt && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.excerpt}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., technology, web development, nextjs"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate tags with commas
              </p>
            </div>

            {/* Content / Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                className={validationErrors.content ? 'border-red-300' : ''}
              />
              {validationErrors.content && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.content}</p>
              )}
            </div>

            {/* Published Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                Published
              </label>
              <p className="ml-2 text-xs text-gray-500">
                {formData.published 
                  ? "This blog post is visible to the public" 
                  : "This blog post is saved as a draft and not visible to the public"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-5 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin/blogs')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading || !hasChanges()}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}