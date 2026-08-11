import { Product, CartItem } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const getProducts = (): Promise<Product[]> => request('/api/products');

export const getProduct = (id: string): Promise<Product> => request(`/api/products/${id}`);

export interface CheckoutResponse {
  orderId: number;
  status: string;
  pointsEarned: number;
}

export const checkout = (items: CartItem[], total: number): Promise<CheckoutResponse> =>
  request('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ items, total }),
  });

export const getOrders = () => request('/api/orders');

export interface RewardsResponse {
  user_id: string;
  points: number;
}

export const getRewards = (userId: string = 'guest'): Promise<RewardsResponse> =>
  request(`/api/rewards?userId=${encodeURIComponent(userId)}`);

export const askBarista = (message: string): Promise<{ reply: string }> =>
  request('/api/barista', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
