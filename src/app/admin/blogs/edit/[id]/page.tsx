"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import slugify from "slugify";
import { useImageUpload } from "@/app/hooks/useImageUpload";
import Image from "next/image";
import { FaSpinner, FaCheck, FaExclamationTriangle } from "react-icons/fa";

// Lazy load rich text editor
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="p-4 border rounded bg-gray-100">Loading editor...</div>,
});

export default function EditBlog() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    coverImage: "",
    tags: "",
    published: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { uploadImage } = useImageUpload();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/admin/blogs/${id}`);
        const data = await res.json();
        setFormData({
          ...data,
          tags: data.tags?.join(", ") || "",
        });
        setImagePreview(data.coverImage || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load blog data");
      }
    };

    if (id) fetchBlog();
  }, [id]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (name === "title") {
        const newSlug = slugify(value, { lower: true, strict: true });
        setFormData((prev) => ({ ...prev, slug: newSlug }));
      }

      if (validationErrors[name]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));

    if (validationErrors.content) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.content;
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setValidationErrors((prev) => ({ ...prev, coverImage: "Please select a valid image" }));
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.slug.trim()) errors.slug = "Slug is required";
    if (!formData.content.trim()) errors.content = "Content is required";
    if (!formData.excerpt.trim()) errors.excerpt = "Excerpt is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let coverImageUrl = formData.coverImage;

      if (imageFile) {
        coverImageUrl = await uploadImage(imageFile);
      }

      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          coverImage: coverImageUrl,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Update failed");
      }

      setSuccess("Blog updated successfully!");
      setTimeout(() => router.push("/admin/blogs"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4 flex items-center">
            <FaCheck className="mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                validationErrors.title ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2`}
            />
            {validationErrors.title && <p className="text-sm text-red-500">{validationErrors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Excerpt</label>
            <textarea
              name="excerpt"
              rows={3}
              value={formData.excerpt}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                validationErrors.excerpt ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2`}
            />
            {validationErrors.excerpt && <p className="text-sm text-red-500">{validationErrors.excerpt}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Content</label>
            <RichTextEditor value={formData.content} onChange={handleContentChange} />
            {validationErrors.content && <p className="text-sm text-red-500 mt-1">{validationErrors.content}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Cover Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Cover"
                width={600}
                height={300}
                className="mt-2 rounded shadow"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            <label className="text-sm">Publish</label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Updating...
              </>
            ) : (
              "Update Blog"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}