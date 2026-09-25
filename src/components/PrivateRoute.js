// src/components/PrivateRoute.js
import React from 'react';
import { useSelector } from 'react-redux';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const RUTA_CAMBIAR_PASSWORD = '/cambiar-password';

/**
 * allowedRoles se pasa como prop en la definición de cada <Route>,
 * no se adivina desde la URL. Si allowedRoles no se especifica, la ruta
 * solo exige estar autenticado.
 *
 * requiredAmbito ('formal' | 'formativa', opcional) refleja en el
 * frontend la misma separación que TieneAmbitoFormal/TieneAmbitoFormativa
 * aplican en el backend. Si no se especifica, la ruta no exige ningún ámbito
 * en particular, así que no rompe ninguna ruta existente que no pase la prop. 
 */
const PrivateRoute = ({ allowedRoles = [], requiredAmbito = null }) => {
  const { isAuthenticated, roles, debeCambiarPassword, sistemaActivo, sessionChecked } =
    useSelector((state) => state.auth);
  const location = useLocation();

  if (!sessionChecked) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const tieneAcceso =
    allowedRoles.length === 0 || allowedRoles.some((rol) => roles.includes(rol));

  if (!tieneAcceso) {
    return <Navigate to="/forbidden" replace />;
  }

  const tieneAmbitoCorrecto = !requiredAmbito || sistemaActivo === requiredAmbito;

  if (!tieneAmbitoCorrecto) {
    return <Navigate to="/forbidden" replace />;
  }

  // Fuerza el cambio de la contraseña temporal antes de permitir cualquier otra
  // pantalla protegida. Se compara contra location.pathname para no
  // generar un loop de redirección dentro de /cambiar-password mismo.
  if (debeCambiarPassword && location.pathname !== RUTA_CAMBIAR_PASSWORD) {
    return <Navigate to={RUTA_CAMBIAR_PASSWORD} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;