import axios from 'axios';

let globalAccessToken: string | null = null;
export const setGlobalAccessToken = (token: string | null) => {
  globalAccessToken = token;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, 
});

api.interceptors.request.use((config) => {
  if (globalAccessToken) {
    config.headers.Authorization = `Bearer ${globalAccessToken}`;
  }
  return config;
});
