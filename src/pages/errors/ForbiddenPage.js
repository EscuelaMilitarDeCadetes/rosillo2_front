import React from 'react';
import ErrorPageLayout from './ErrorPageLayout';

/**
 * Destino de axiosInstance.js cuando el backend responde 403: el usuario
 * está autenticado pero sus roles no le permiten ese recurso (clases
 * EsAsesor / EsCInterno / EsSupervisor / etc. del backend), o cayó aquí
 * desde PrivateRoute por no tener alguno de los allowedRoles de la ruta.
 * También es el destino recomendado para el lockout de django-axes tras
 * demasiados intentos fallidos de login (ver backend/config/axes_handlers.py).
 */
const ForbiddenPage = () => (
  <ErrorPageLayout
    code="403"
    icon="pi-lock"
    title="Acceso denegado"
    message="No tienes permiso para ver este contenido. Si crees que esto es un error, contacta al administrador del sistema."
  />
);

export default ForbiddenPage;