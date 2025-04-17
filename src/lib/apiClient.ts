// lib/apiClient.ts

// Define or import the IBlog interface
interface IBlog {
  id: string;
  title: string;
  content: string;
  [key: string]: any;
}

class ApiClient {
    private baseUrl: string;
  
    constructor() {
      this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
    }
  
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      });
  
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Request failed');
      }
  
      return response.json();
    }
  
    // Blog endpoints
    async getBlog(id: string) {
      return this.request<IBlog>(`/admin/blogs/${id}`);
    }
  
    async createBlog(data: { title: string; content: string; [key: string]: any }) {
      return this.request<IBlog>('/admin/blogs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  
    async updateBlog(id: string, data: Partial<{ title?: string; content?: string; [key: string]: any }>) {
      return this.request<IBlog>(`/admin/blogs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  
    async uploadImage(file: File): Promise<{ url: string }> {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${this.baseUrl}/admin/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Image upload failed');
      }
  
      return response.json();
    }
  }
  
  export const apiClient = new ApiClient();