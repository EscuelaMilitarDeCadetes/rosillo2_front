// src/api/axiosInstance.js
import axios from 'axios';
import { mostrarToastGenerico, extraerMensajeError } from '../utils/notificador';

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

// --- Mensajes visuales (toast) automáticos ---
// Toda petición que crea, edita o elimina (POST/PUT/PATCH/DELETE) muestra un
// toast de éxito o de error. Para omitirlo en una petición puntual, pasar
// { silenciarToast: true } en la configuración de axios.
const METODOS_MUTACION = ['post', 'put', 'patch', 'delete'];
const URLS_SIN_TOAST = [
  'usuarios/login/',          // la pantalla de login muestra su propio error
  'usuarios/token/',          // refresh / verify del JWT
  'usuarios/logout/',
  'marcar-leida/',            // notificaciones: acción silenciosa
  'marcar-todas-leidas/',
];

const esMutacion = (config) => METODOS_MUTACION.includes((config?.method || 'get').toLowerCase());

const debeMostrarToast = (config) =>
  esMutacion(config) &&
  !config?.silenciarToast &&
  !URLS_SIN_TOAST.some((u) => (config?.url || '').includes(u));

const TITULO_EXITO = {
  post: 'Operación exitosa',
  put: 'Cambios guardados',
  patch: 'Cambios guardados',
  delete: 'Registro eliminado',
};

const tituloError = (status) => {
  if (!status) return 'Sin conexión con el servidor';
  if (status === 400) return 'Revisa los datos';
  if (status === 403) return 'Sin permiso';
  if (status === 404) return 'No encontrado';
  if (status === 409) return 'Conflicto';
  if (status === 413) return 'Archivo demasiado grande';
  if (status === 429) return 'Demasiadas solicitudes';
  if (status >= 500) return 'Error del servidor';
  return 'No se pudo completar la operación';
};

const toastExito = (response) => {
  if (!debeMostrarToast(response.config)) return;
  const data = response.data;
  const detalle =
    (data && typeof data === 'object' && !(typeof Blob !== 'undefined' && data instanceof Blob) &&
      ['detail', 'mensaje', 'message'].map((k) => data[k]).find((v) => typeof v === 'string')) ||
    'La operación se realizó correctamente.';
  mostrarToastGenerico({
    severity: 'success',
    summary: TITULO_EXITO[(response.config.method || 'post').toLowerCase()] || 'Operación exitosa',
    detail: detalle,
  });
};

const toastError = (error) => {
  const status = error.response ? error.response.status : null;
  let detalle = extraerMensajeError(error.response?.data, status);
  if (status >= 500) {
    detalle = 'Ocurrió un error interno en el servidor. Si persiste, revisa logs/errors.log del backend.';
  }
  mostrarToastGenerico({ severity: 'error', summary: tituloError(status), detail: detalle, life: 8000 });
};

axiosInstance.interceptors.response.use(
  (response) => {
    toastExito(response);
    return response;
  },
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

    // --- Crear / editar / eliminar: se muestra un toast con el error y se
    // queda en la misma pantalla (no se pierde lo que el usuario escribió).
    if (debeMostrarToast(originalRequest) && status !== 401) {
      toastError(error);
      return Promise.reject(error);
    }

    // --- Consultas (GET) ---
    // 403: autenticado pero sin permiso para ese recurso
    if (status === 403 && !originalRequest?.suppressErrorRedirect) {
      window.location.href = '/forbidden';
    }

    // 5xx: error de servidor
    if (status >= 500 && !esMutacion(originalRequest)) {
      window.location.href = '/error';
    }

    // --- 429: throttling (incluye el login/min:5 configurado en DRF) ---
    // No redirige: se deja que la pantalla que hizo la petición muestre
    // el mensaje, porque normalmente es útil seguir viendo el formulario.

    return Promise.reject(error);
  }
);

export default axiosInstance;