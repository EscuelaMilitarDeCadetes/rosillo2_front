// src/domains/common/pages/PlantillasDocumentoPage.js
import React from 'react';
import { useSelector } from 'react-redux';
import PlantillasDocumentoTable from '../components/plantillaDocumento/PlantillasDocumentoTable';

// create/update/desactivar están restringidos a EsSoporte y EsCInterno en el backend;
// list/retrieve/por-tipo-documento son IsAuthenticated. La página queda
// accesible a cualquier autenticado, pero los controles de edición solo se
// habilitan para SOPORTE.
const PlantillasDocumentoPage = () => {
  const { roles } = useSelector((state) => state.auth);
  const puedeEditar = roles?.includes('SOPORTE') || roles?.includes('CINTERNO');

  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <PlantillasDocumentoTable puedeEditar={puedeEditar} />
      </div>
    </div>
  );
};

export default PlantillasDocumentoPage;