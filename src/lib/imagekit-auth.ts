// lib/imagekit.ts
import ImageKit from "imagekit";
// import ImageKit from "imagekitio-next";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
});

export async function uploadToImageKit(file: File): Promise<string> {
  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  const base64File = await fileToBase64(file);

  try {
    // Generate unique filename with timestamp old
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `blog-${timestamp}.${fileExtension}`;

    const response = await imagekit.upload({
      file: base64File.split(',')[1], // Extract base64 content after the comma
      fileName,
      folder: "/blog-images",
      useUniqueFileName: false, // We're generating our own unique name
    });

    if (!response.url) {
      throw new Error('Upload failed - no URL returned');
    }

    return response.url;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Failed to upload image');
  }
}

// For client-side usage (without exposing private key)
export function getImageKitClient() {
  return new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
    privateKey: '', // Provide an empty string or a placeholder since privateKey is not used client-side
  });
}