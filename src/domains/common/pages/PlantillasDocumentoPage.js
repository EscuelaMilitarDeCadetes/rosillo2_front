// src/domains/common/pages/PlantillasDocumentoPage.js
import React from 'react';
import { useSelector } from 'react-redux';
import PlantillasDocumentoTable from '../components/plantillaDocumento/PlantillasDocumentoTable';

// create/update/desactivar están restringidos a EsSoporte y EsCInterno en el backend;
// list/retrieve/por-tipo-documento son IsAuthenticated. La página queda
// accesible a cualquier autenticado, pero los controles de edición solo se
// habilitan para SOPORTE.
const PlantillasDocumentoPage = () => {
  const { roles, sistemaActivo } = useSelector((state) => state.auth);
  // Igual que PlantillaDocumentoViewSet: SOPORTE y CINTERNO siempre;
  // FACULTAD sólo cuando inició sesión por Investigación Formativa.
  const puedeEditar =
    roles?.includes('SOPORTE') ||
    roles?.includes('CINTERNO') ||
    (roles?.includes('FACULTAD') && sistemaActivo === 'formativa');

  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <PlantillasDocumentoTable puedeEditar={puedeEditar} />
      </div>
    </div>
  );
};

export default PlantillasDocumentoPage;