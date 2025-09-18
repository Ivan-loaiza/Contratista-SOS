import axios from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

const API = axios.create({
  baseURL: 'http://localhost:3000/api/User', // 👈 Ya apunta a /api/User
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token si existe
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>('/register', userData);
  return response.data;
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>('/login', credentials);
  return response.data;
};
