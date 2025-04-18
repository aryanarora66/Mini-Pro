// src/app/admin/blogs/create/page.tsx
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import slugify from 'slugify';
import { FaSpinner, FaExclamationTriangle, FaCheck, FaImage, FaNewspaper } from 'react-icons/fa';
import { useImageUpload } from '@/app/hooks/useImageUpload';
import Image from 'next/image'; // <--- Added Import

// Lazy load the rich text editor
const RichTextEditor = dynamic(
  () => import("@/components/RichTextEditor"),
  { ssr: false, loading: () => <div className="border rounded-md p-4 bg-gray-50">Loading editor...</div> }
);

export default function CreateBlog() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '', // This might hold the final URL after upload
    tags: '',
    published: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // This holds the data: URL for preview
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { uploadImage, isUploading, progress } = useImageUpload();

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title) {
      const generatedSlug = slugify(formData.title, { lower: true, strict: true });
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));

    // Clear validation error
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image file
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({
          ...prev,
          coverImage: 'Please select an image file'
        }));
        setImageFile(null); // Clear invalid file
        setImagePreview(null); // Clear preview
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setValidationErrors(prev => ({
          ...prev,
          coverImage: 'Image size must be less than 5MB'
        }));
        setImageFile(null); // Clear invalid file
        setImagePreview(null); // Clear preview
        return;
      }

      setImageFile(file);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.coverImage;
        return newErrors;
      });

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.slug.trim()) errors.slug = 'Slug is required';
    if (!formData.content.trim()) errors.content = 'Content is required';
    if (!formData.excerpt.trim()) errors.excerpt = 'Excerpt is required';
    // Require either an existing image URL or a new file selected
    if (!imageFile && !formData.coverImage) errors.coverImage = 'Cover image is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Upload image if a new one was selected
      let coverImageUrl = formData.coverImage; // Keep existing if no new file
      if (imageFile) {
        try {
          const url = await uploadImage(imageFile);
          coverImageUrl = url;
        } catch (uploadError) {
          throw new Error('Failed to upload image: ' + (uploadError instanceof Error ? uploadError.message : 'Unknown error'));
        }
      }

      // Ensure we have a final cover image URL before submitting
      if (!coverImageUrl) {
           throw new Error('Cover image is missing after potential upload attempt.');
      }

      // Create blog with all data
      const response = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          coverImage: coverImageUrl, // Use the final URL
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create blog post');
      }

      setSuccess('Blog post created successfully!');

      // Redirect after a brief delay to show success message
      setTimeout(() => {
        router.push('/admin/blogs');
      }, 1500);
    } catch (err) {
      console.error('Blog creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create blog');
      window.scrollTo(0, 0); // Scroll to top to show error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaNewspaper className="mr-3 text-blue-600" />
            Create New Blog Post
          </h1>
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
                  placeholder="Enter blog title"
                  disabled={isSubmitting}
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
                  placeholder="your-blog-post-url"
                  disabled={isSubmitting}
                  readOnly // Slug is auto-generated, make read-only or disable direct input
                />
                {validationErrors.slug && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.slug}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  This will be used in the URL: /blogs/{formData.slug || 'your-blog-post-url'}
                </p>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cover Image *
              </label>

              <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md
                               hover:bg-gray-50 transition-colors duration-200
                               ${validationErrors.coverImage ? 'border-red-300' : 'border-gray-300'}`}>
                {/* Check if there's a preview OR an existing image URL */}
                {imagePreview || formData.coverImage ? (
                  <div className="space-y-3 text-center w-full"> {/* Ensure this container takes width */}
                    {/* Parent Div for Next/Image */}
                    <div className="relative h-40 w-full max-w-md mx-auto overflow-hidden rounded">
                      <Image // <<< Using Next/Image Component
                        src={imagePreview || formData.coverImage} // Source can be preview (data URL) or final URL
                        alt="Cover preview"
                        layout="fill"                            // Fill the container
                        objectFit="cover"                       // Cover the area, maintain aspect ratio
                        unoptimized={imagePreview?.startsWith('data:')} // Don't optimize data URLs
                      />
                    </div>
                    <div className="flex items-center justify-center text-sm">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Change image</span>
                        <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} disabled={isSubmitting || isUploading} />
                      </label>
                       <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); setFormData(prev => ({...prev, coverImage: ''})) }} className="ml-3 text-sm text-red-600 hover:text-red-800" disabled={isSubmitting || isUploading}>
                           Remove
                       </button>
                    </div>
                  </div>
                ) : (
                  // Placeholder when no image is selected or available
                  <div className="space-y-1 text-center">
                    <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} disabled={isSubmitting || isUploading} />
                      </label>
                      {/* <p className="pl-1">or drag and drop</p>  // Drag and drop needs extra implementation */}
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, WEBP up to 5MB
                    </p>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 text-center">{progress}% Uploaded</p>
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
                A brief summary of the blog post (will be shown in listings)
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
                placeholder="Write a brief summary of your blog post..."
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
               <div className={validationErrors.content ? 'border border-red-300 rounded-md' : ''}>
                 <RichTextEditor
                   value={formData.content}
                   onChange={handleContentChange}
                  // className is applied inside the component usually, wrapping helps highlight error
                 />
               </div>
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
                disabled={isSubmitting}
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                Publish immediately
              </label>
              <p className="ml-2 text-xs text-gray-500">
                (Uncheck to save as draft)
              </p>
            </div>


            {/* Action Buttons */}
            <div className="flex justify-end pt-5 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()} // Go back instead of fixed route?
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Creating...
                  </>
                ) : (
                  'Create Blog Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}