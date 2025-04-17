// src/app/hooks/useImageUpload.ts
import { useState } from 'react';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 100);

      const formData = new FormData();
      formData.append('file', file);

      console.log('Starting file upload...');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // sending cookies [cookies , auth]
      });

      clearInterval(progressInterval);

      console.log('Upload response status:', response.status);

      // Parse response data
      let data;
      try {
        const text = await response.text();
        console.log('Response preview:', text.substring(0, 150) + (text.length > 150 ? '...' : ''));
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Failed to parse server response');
      }

      if (!response.ok) {
        throw new Error(data?.error || `Upload failed with status: ${response.status}`);
      }

      setProgress(100);
      return data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading, error, progress }; 
}