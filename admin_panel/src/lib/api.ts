const API_BASE = 'https://doctorluci.com/api';

export const api = {
  getToken: () => localStorage.getItem('admin_token'),
  setToken: (t: string) => localStorage.setItem('admin_token', t),
  logout: () => localStorage.removeItem('admin_token'),
  
  async request(path: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.logout();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'API Error');
    }

    // Return empty for 204 No Content
    if (response.status === 204) return null;
    return response.json();
  }
};
