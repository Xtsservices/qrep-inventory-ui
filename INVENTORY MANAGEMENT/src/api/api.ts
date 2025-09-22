import axios from "axios";

// 🌍 Base URL
const BASE_URL = "http://172.16.4.22:9000/api";

// 🔹 Generic API request wrapper (only one!)
const request = async (endpoint: string, method: string = "GET", body?: any) => {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || "API Error");
  }
  return data;
};

// 🔹 Items API
export const itemsApi = {
  getAll: () => request("/items"),
  add: (payload: any) => request("/items", "POST", payload),
  update: (id: string, payload: any) => request(`/items/${id}`, "PUT", payload),
  delete: (id: string, payload: any) => request(`/items/${id}`, "PUT", payload),
};


// 🔹 Stocks API
export const stocksApi = {
  getAll: () => request("/stocks"),
  getByItem: (itemId: string) => request(`/stocks/item/${itemId}`),
  add: (payload: any) => request("/stocks", "POST", payload),
  update: (id: string, payload: any) => request(`/stocks/${id}`, "PUT", payload),
  delete: (id: string) => request(`/stocks/${id}`, "DELETE"),
};

// 🔹 Users API
export const usersApi = {
  getAll: () => request("/users"),
  getById: (id: string) => request(`/users/${id}`),
  add: (payload: any) => request("/users", "POST", payload),
  update: (id: string, payload: any) => request(`/users/${id}`, "PUT", payload),
  delete: (id: string) => request(`/users/${id}`, "PUT", { status: "Inactive" }),
};

// 🔹 Finance API
export const financeApi = {
  getAll: () => request("/billing"),
  getById: (id: string) => request(`/billing/${id}`),
  add: (payload: any) => request("/billing", "POST", payload),
  update: (id: string, payload: any) => request(`/billing/${id}`, "PUT", payload),
  delete: (id: string) => request(`/billing/${id}`, "DELETE"),
};
