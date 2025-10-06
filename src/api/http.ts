// src/api/http.ts
import axios, { type InternalAxiosRequestConfig } from 'axios';

function normalizeBaseUrl(raw?: string) {
  let url = raw ?? 'https://localhost:7095';
  url = url.replace(/\/+$/, '');
  if (!/\/api$/i.test(url)) url = `${url}/api`;
  return url;
}

const http = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const url = (config.url ?? '').toLowerCase();
  const isAuthRoute = url.includes('/user/login') || url.includes('/user/register');

  // Limpia Authorization en auth routes
  if (isAuthRoute) {
    if (config.headers) {
      delete (config.headers as any).Authorization;
      delete (config.headers as any).authorization;
    }
  } else {
    // Adjunta bearer
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }

  // Log útil en dev
  if (import.meta.env.DEV) {
    console.log('[HTTP REQ]', { url: (config.baseURL ?? '') + (config.url ?? ''), data: config.data, headers: config.headers });
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (import.meta.env.DEV) {
      console.error('[HTTP ERROR]', {
        url: err?.config?.baseURL + err?.config?.url,
        status: err?.response?.status,
        data: err?.response?.data,
      });
    }
    return Promise.reject(err);
  }
);

export default http;
