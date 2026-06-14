export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const endpoints = {
  // Auth
  login: '/auth/login',
  sendOtp: '/auth/send-otp',
  verifyOtp: '/auth/verify-otp',
  
  // Products
  searchProducts: '/products/search',
  getProduct: (id: string) => `/products/${id}`,
  getProductHistory: (id: string) => `/products/${id}/history`,
  
  // Cart
  createCart: '/cart',
  getCart: (id: string) => `/cart/${id}`,
  updateCart: (id: string) => `/cart/${id}`,
  compareCart: (id: string) => `/cart/${id}/compare`,
  
  // Alerts
  getAlerts: '/alerts',
  createAlert: '/alerts',
  updateAlert: (id: string) => `/alerts/${id}`,
  deleteAlert: (id: string) => `/alerts/${id}`,
  
  // Coupons
  getCoupons: '/coupons',
  validateCoupon: '/coupons/validate',
  
  // AI Recommendations
  getRecommendation: '/ai/recommend',
  
  // User
  getUser: '/user/profile',
  getSavings: '/user/savings',
};
