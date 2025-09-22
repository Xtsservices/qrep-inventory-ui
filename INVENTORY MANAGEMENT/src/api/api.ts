// api.ts
import axios, { AxiosInstance, AxiosResponse } from "axios";


// 🌍 Base URL
const BASE_URL = "http://172.16.4.22:9000/api";


// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Axios instance with token
const axiosWithToken: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to each request
axiosWithToken.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }
  return config;
});

// Generic request handler
const handleRequest = async <T>(axiosCall: Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    const res = await axiosCall;
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message || "API Error";
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    throw new Error(msg);
  }
};

// ------------------------ VENDORS ------------------------
export const vendorsApi = {
  getAll: () => handleRequest(axiosWithToken.get("/vendors")),
  getById: (id: string) => handleRequest(axiosWithToken.get(`/vendors/${id}`)),
  add: (payload: any) => handleRequest(axiosWithToken.post("/vendors", payload)),
  update: (id: string, payload: any) => handleRequest(axiosWithToken.put(`/vendors/${id}`, payload)),
  delete: (id: string) => handleRequest(axiosWithToken.delete(`/vendors/${id}`)),
};

// ------------------------ ITEMS ------------------------
export const itemsApi = {
  getAll: () => handleRequest(axiosWithToken.get("/items")),
  add: (payload: any) => handleRequest(axiosWithToken.post("/items", payload)),
  update: (id: string, payload: any) => handleRequest(axiosWithToken.put(`/items/${id}`, payload)),
  delete: (id: string) => handleRequest(axiosWithToken.delete(`/items/${id}`)),
};

// ------------------------ ORDERS ------------------------
export const ordersApi = {
  getAll: () => handleRequest(axiosWithToken.get("/orders")),
  getById: (id: string) => handleRequest(axiosWithToken.get(`/orders/${id}`)),
  create: (payload: any) => handleRequest(axiosWithToken.post("/orders", payload)),
  update: (id: string, payload: any) => handleRequest(axiosWithToken.put(`/orders/${id}`, payload)),
  delete: (id: string) => handleRequest(axiosWithToken.delete(`/orders/${id}`)),
};

// ------------------------ STOCKS ------------------------
export const stocksApi = {
  getAll: () => handleRequest(axiosWithToken.get("/stocks")),
  getByItem: (itemId: string) => handleRequest(axiosWithToken.get(`/stocks/item/${itemId}`)),
  add: (payload: any) => handleRequest(axiosWithToken.post("/stocks", payload)),
  update: (id: string, payload: any) => handleRequest(axiosWithToken.put(`/stocks/${id}`, payload)),
  delete: (id: string) => handleRequest(axiosWithToken.delete(`/stocks/${id}`)),
};

// ------------------------ USERS ------------------------
export const usersApi = {
  getAll: () => handleRequest(axiosWithToken.get("/users")),
  getById: (id: string) => handleRequest(axiosWithToken.get(`/users/${id}`)),
  add: (payload: any) => handleRequest(axiosWithToken.post("/users", payload)),
  update: (id: string, payload: any) => handleRequest(axiosWithToken.put(`/users/${id}`, payload)),
  delete: (id: string) => handleRequest(axiosWithToken.put(`/users/${id}`, { status: "Inactive" })),
};

// ------------------------ FINANCE / BILLINGS ------------------------
export const financeApi = {
  getAll: () => handleRequest(axiosWithToken.get("/billing")),
  getById: (id: string) => handleRequest(axiosWithToken.get(`/billing/${id}`)),
  add: (payload: any) => handleRequest(axiosWithToken.post("/billing", payload)),
  update: (id: string, payload: any) => handleRequest(axiosWithToken.put(`/billing/${id}`, payload)),
  delete: (id: string) => handleRequest(axiosWithToken.delete(`/billing/${id}`)),
};



// ------------------------ INVENTORY REQUESTS ------------------------
export const inventoryRequestsApi = {
  getAll: () => handleRequest(axiosWithToken.get("/inventory-requests")),
  getById: (id: string) => handleRequest(axiosWithToken.get(`/inventory-requests/${id}`)),
  add: (payload: any) => handleRequest(axiosWithToken.post("/inventory-requests", payload)),
  update: (id: string, payload: any) => handleRequest(axiosWithToken.put(`/inventory-requests/${id}`, payload)),
  // delete: (id: string) => handleRequest(axiosWithToken.delete(`/inventory-requests/${id}`)), // optional
};


// ------------------------ AUTH (without token) ------------------------
export const authApi = {
  verifyOtp: (payload: any) => handleRequest(axios.post(`${API_BASE_URL}/auth/verifyOtp`, payload, {
    headers: { "Content-Type": "application/json" },
  })),

};
