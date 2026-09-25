import React from 'react';
import ErrorPageLayout from './ErrorPageLayout';

/**
 * Destino de axiosInstance.js cuando el backend responde 5xx: un error
 * inesperado del servidor (no un 404/403 traducidos por
 * config.exceptions.custom_exception_handler, sino algo realmente roto).
 */
const ServerErrorPage = () => (
  <ErrorPageLayout
    code="500"
    icon="pi-exclamation-triangle"
    title="Algo salió mal"
    message="Ocurrió un error inesperado en el servidor. Ya quedó registrado; intenta de nuevo en unos minutos."
  />
);

export default ServerErrorPage;