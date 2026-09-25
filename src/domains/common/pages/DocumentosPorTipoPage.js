// src/domains/common/pages/DocumentosPorTipoPage.js
import React from 'react';
import DocumentosPorTipoPanel from '../components/documentoFirma/DocumentosPorTipoPanel';

const DocumentosPorTipoPage = () => (
  <div className="container-fluid mt-4">
    <div className="card">
      <h5 className="mb-3">Documentos por Tipo</h5>
      <DocumentosPorTipoPanel />
    </div>
  </div>
);

export default DocumentosPorTipoPage;