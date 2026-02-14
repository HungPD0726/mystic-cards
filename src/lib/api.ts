const API_BASE_URL = 'http://localhost:5000/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const token = this.getToken();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.errors?.[0]?.msg || 'Something went wrong');
    }

    return data;
  }

  // Auth endpoints
  async register(email: string, username: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: { email, username, password },
    });
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Reading endpoints
  async getReadings(page = 1, limit = 10) {
    return this.request<{
      readings: any[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/readings?page=${page}&limit=${limit}`);
  }

  async createReading(data: {
    spreadType: string;
    spreadName: string;
    drawnCards: any[];
    notes?: string;
  }) {
    return this.request<{ reading: any }>('/readings', {
      method: 'POST',
      body: data,
    });
  }

  async getReading(id: number) {
    return this.request<{ reading: any }>(`/readings/${id}`);
  }

  async deleteReading(id: number) {
    return this.request<{ message: string }>(`/readings/${id}`, {
      method: 'DELETE',
    });
  }

  // Card endpoints
  async getCards(group?: string, search?: string) {
    const params = new URLSearchParams();
    if (group) params.append('group', group);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ cards: any[] }>(`/cards${query}`);
  }

  async getCardBySlug(slug: string) {
    return this.request<{ card: any }>(`/cards/${slug}`);
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; message: string }>('/health');
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
