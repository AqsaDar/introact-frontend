import axios from 'axios';

// Base Axios instance
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/',
  // timeout: 30000,
  withCredentials: false,
});

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

// Helper to process failed requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Helper to get current tokens
function getTokens() {
  try {
    return {
      access: localStorage.getItem('access'),
      refresh: localStorage.getItem('refresh')
    };
  } catch (_) {
    return { token: null, refreshToken: null };
  }
}

// Helper to set tokens
function setTokens(access, refresh) {
  try {
    if (access) {
      localStorage.setItem('access', access);
    } else {
      localStorage.removeItem('access');
    }
    
    if (refresh) {
      localStorage.setItem('refresh', refresh);
    } else {
      localStorage.removeItem('refresh');
    }
  } catch (_) {}
}

// Request interceptor: attach Authorization header if token exists
http.interceptors.request.use(
  (config) => {
    const { access } = getTokens();
    if (access) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh on 401
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      try {
        // Call refresh API
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || '/api'}user/token/refresh/`,
          { refresh: localStorage.getItem('refresh') }
        );

        const { access, refresh } = response.data;
        
        // Update tokens
        setTokens(access, refresh);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Process queued requests
        processQueue(null, access);
        
        // Retry the original request
        return http(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize other errors
    const normalized = {
      status: error?.response?.status || 0,
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Unexpected error occurred',
      data: error?.response?.data,
      headers: error?.response?.headers,
      url: error?.config?.url,
      method: error?.config?.method,
    };
    return Promise.reject(normalized);
  }
);

// Generic wrappers
export async function getRequest(url, { params, headers, signal } = {}) {
  const response = await http.get(url, { params, headers, signal });
  return response;
}

export async function postRequest(url, body = {}, { params, headers, signal } = {}) {
  const response = await http.post(url, body, { params, headers, signal });
  return response;
}

export async function putRequest(url, body = {}, { params, headers, signal } = {}) {
  const response = await http.put(url, body, { params, headers, signal });
  return response.data;
}

export async function deleteRequest(url, { params, headers, signal } = {}) {
  const response = await http.delete(url, { params, headers, signal });
  return response;
}

// Token management helpers
export function setAuthToken(token, refreshToken = null) {
  setTokens(token, refreshToken);
}

export function clearTokens() {
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  } catch (_) {}
}

export function createAbortController() {
  return new AbortController();
}

// File upload helper
export async function uploadFile(url, file, company, extraData = {}, { headers, onUploadProgress, signal } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (company) {
    formData.append('company', company);
  }
  Object.entries(extraData || {}).forEach(([key, value]) => formData.append(key, value));

  const response = await http.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data', ...(headers || {}) },
    onUploadProgress,
    signal,
  });
  return response;
}

export default http;
