import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';

/**
 * Layout compartido por NotFoundPage, ForbiddenPage y ServerErrorPage.
 * El botón "volver" es consciente de la sesión: si hay usuario
 * autenticado, vuelve al home de SU dominio (/formal o /formativa,
 * según sistemaActivo de authSlice); si no, vuelve a la portada "/".
 */
const ErrorPageLayout = ({ code, icon, title, message, children }) => {
  const { isAuthenticated, sistemaActivo } = useSelector((state) => state.auth);
  const volverA = isAuthenticated ? `/${sistemaActivo || 'formal'}` : '/';

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: '60vh' }}>
      <i className={`pi ${icon}`} style={{ fontSize: '4rem', color: '#162749' }}></i>
      <h1 className="fw-bold mt-4" style={{ fontSize: '3rem' }}>{code}</h1>
      <h2 className="mb-3">{title}</h2>
      <p className="text-muted mb-4" style={{ maxWidth: '32rem' }}>{message}</p>
      {children}
      <Link to={volverA} className="mt-2">
        <Button label="Volver al inicio" icon="pi pi-home" className="p-button-outlined" />
      </Link>
    </div>
  );
};

export default ErrorPageLayout;