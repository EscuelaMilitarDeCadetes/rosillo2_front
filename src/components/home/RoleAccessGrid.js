// src/components/home/RoleAccessGrid.js
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Grilla de accesos rápidos filtrada por rol, reutilizada por
 * FormalHomePage y FormativaHomePage.
 *
 * `secciones`: [{
 *   roles: string[],      // roles de state.auth.roles que ven esta sección
 *                          // (arreglo vacío o ausente = visible para
 *                          // cualquier usuario autenticado del ámbito)
 *   titulo: string,
 *   descripcion?: string,
 *   icono?: string,       // clase de ícono PrimeIcons, ej. 'pi pi-star'
 *   enlaces: [{ to: string, label: string }],
 * }]
 *
 * Solo se muestran las secciones para las que el usuario tiene al menos
 * uno de los roles indicados, de modo que cada persona ve únicamente
 * las funciones que le corresponden y no las de los demás roles.
 */
const RoleAccessGrid = ({ secciones, rolesUsuario }) => {
  const tieneAcceso = (rolesSeccion) =>
    !rolesSeccion ||
    rolesSeccion.length === 0 ||
    rolesSeccion.some((r) => (rolesUsuario || []).includes(r));

  const visibles = secciones.filter((seccion) => tieneAcceso(seccion.roles));

  if (visibles.length === 0) {
    return (
      <p className="text-muted">
        Tu usuario todavía no tiene funciones adicionales asignadas en esta plataforma.
      </p>
    );
  }

  return (
    <div className="row g-4">
      {visibles.map((seccion) => (
        <div className="col-md-6 col-xl-4" key={seccion.titulo}>
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <div className="d-flex align-items-center mb-2">
                {seccion.icono && <i className={`${seccion.icono} fs-4 me-2`} aria-hidden="true" />}
                <h5 className="card-title mb-0">{seccion.titulo}</h5>
              </div>
              {seccion.descripcion && (
                <p className="card-text text-muted small">{seccion.descripcion}</p>
              )}
              <ul className="list-unstyled mt-auto mb-0">
                {seccion.enlaces.map((enlace) => (
                  <li key={enlace.to} className="mb-1">
                    <Link className="text-decoration-none" to={enlace.to}>
                      <i className="pi pi-angle-right me-1" aria-hidden="true" />
                      {enlace.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoleAccessGrid;