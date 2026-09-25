import React from 'react';
import ErrorPageLayout from './ErrorPageLayout';

/**
 * Se monta en la ruta comodín "*" (ver App.js). Atrapa cualquier URL
 * que no coincida con ninguna ruta definida: typos, enlaces viejos del
 * Thymeleaf, o rutas de un dominio que todavía no existe.
 */
const NotFoundPage = () => (
  <ErrorPageLayout
    code="404"
    icon="pi-search"
    title="Página no encontrada"
    message="La página que buscas no existe o fue movida. Revisa la dirección o vuelve al inicio."
  />
);

export default NotFoundPage;