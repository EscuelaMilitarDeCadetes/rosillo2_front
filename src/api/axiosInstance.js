// src/api/axiosInstance.js
import axios from 'axios';

// Puerto del backend Django
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// El backend usa rest_framework_simplejwt.authentication.JWTAuthentication,
// que espera "Authorization: Bearer <access>" (NO "Token <token>").
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Refresh automático cuando el access token expira (401) ---
// ACCESS_TOKEN_LIFETIME es de 30 minutos,
let isRefreshing = false;
let pendingRequests = [];

const resolvePending = (error, token = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingRequests = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    const isAuthEndpoint =
      originalRequest?.url?.includes('usuarios/login/formal/') ||
      originalRequest?.url?.includes('usuarios/login/formativa/') ||
      originalRequest?.url?.includes('usuarios/token/refresh/');

    // --- 401: intentar refrescar el access token UNA sola vez por petición ---
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Ya hay un refresh en curso: encolar esta petición hasta que termine
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = `/login/${localStorage.getItem('sistemaActivo') || 'formal'}`;
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}usuarios/token/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem('accessToken', data.access);
        resolvePending(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        resolvePending(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = `/login/${localStorage.getItem('sistemaActivo') || 'formal'}`;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --- 403: autenticado pero sin permiso para ese recurso ---
    if (status === 403 && !originalRequest?.suppressErrorRedirect) {
      window.location.href = '/forbidden';
    }

    // --- 5xx: error de servidor ---
    if (status >= 500) {
      window.location.href = '/error';
    }

    // --- 429: throttling (incluye el login/min:5 configurado en DRF) ---
    // No redirige: se deja que la pantalla que hizo la petición muestre
    // el mensaje, porque normalmente es útil seguir viendo el formulario.

    return Promise.reject(error);
  }
);

export default axiosInstance;