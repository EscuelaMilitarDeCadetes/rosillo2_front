// src/domains/common/pages/DocumentosPendientesFirmaPage.js
import React from 'react';
import DocumentosPendientesFirmaTable from '../components/documentoFirma/DocumentosPendientesFirmaTable';

const DocumentosPendientesFirmaPage = () => (
  <div className="container-fluid mt-4">
    <div className="card">
      <DocumentosPendientesFirmaTable />
    </div>
  </div>
);

export default DocumentosPendientesFirmaPage;