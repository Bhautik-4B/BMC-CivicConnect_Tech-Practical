import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach token if stored in local storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bmc_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale token if unauthorized and not already on auth/login page
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      const isPublicMaster = error.config?.url?.includes('/admin/wards') || error.config?.url?.includes('/admin/categories') || error.config?.url?.includes('/admin/departments');
      if (!isAuthEndpoint && !isPublicMaster) {
        localStorage.removeItem('bmc_access_token');
        localStorage.removeItem('bmc_user');
      }
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

