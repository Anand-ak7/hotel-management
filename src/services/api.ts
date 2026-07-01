import axios from "axios";
import { storage } from "../utils/storage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clearToken();
      storage.clearAdmin();
    }
    return Promise.reject(error);
  },
);

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    return Array.isArray(message)
      ? message.join(", ")
      : message || error.message;
  }
  return "Something went wrong";
};
