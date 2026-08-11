import { create } from 'zustand';
import { CartItem, Product, ViewName, Customization } from '../types';
import { checkout as apiCheckout, getProducts as apiGetProducts, getRewards as apiGetRewards } from '../services/apiService';

interface AppState {
  currentView: ViewName;
  cart: CartItem[];
  userPoints: number;
  selectedProduct: Product | null;
  isMenuOpen: boolean;
  products: Product[];
  isCheckingOut: boolean;

  // Actions
  setView: (view: ViewName) => void;
  addToCart: (product: Product, customization: Customization, price: number) => void;
  removeFromCart: (cartId: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  clearCart: () => void;
  addPoints: (amount: number) => void;
  toggleMenu: () => void;
  fetchProducts: () => Promise<void>;
  checkoutCart: () => Promise<{ orderId: number; pointsEarned: number } | null>;
  syncRewards: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'ONBOARDING',
  cart: [],
  userPoints: 1450, // Mock initial points, synced with backend when available
  selectedProduct: null,
  isMenuOpen: false,
  products: [],
  isCheckingOut: false,

  setView: (view) => set({ currentView: view }),

  addToCart: (product, customization, price) => set((state) => {
    const newItem: CartItem = {
      ...product,
      cartId: Math.random().toString(36).substr(2, 9),
      customization,
      quantity: 1,
      totalPrice: price,
    };
    return { cart: [...state.cart, newItem] };
  }),

  removeFromCart: (cartId) => set((state) => ({
    cart: state.cart.filter((item) => item.cartId !== cartId)
  })),

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  clearCart: () => set({ cart: [] }),

  addPoints: (amount) => set((state) => ({ userPoints: state.userPoints + amount })),

  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),

  fetchProducts: async () => {
    try {
      const products = await apiGetProducts();
      set({ products });
    } catch (err) {
      console.error('Failed to fetch products from backend:', err);
    }
  },

  checkoutCart: async () => {
    const { cart } = get();
    if (cart.length === 0) return null;
    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    set({ isCheckingOut: true });
    try {
      const result = await apiCheckout(cart, total);
      set((state) => ({ cart: [], userPoints: state.userPoints + result.pointsEarned, isCheckingOut: false }));
      return { orderId: result.orderId, pointsEarned: result.pointsEarned };
    } catch (err) {
      console.error('Checkout failed:', err);
      set({ isCheckingOut: false });
      return null;
    }
  },

  syncRewards: async () => {
    try {
      const rewards = await apiGetRewards('guest');
      set({ userPoints: rewards.points });
    } catch (err) {
      console.error('Failed to sync rewards from backend:', err);
    }
  },
}));
