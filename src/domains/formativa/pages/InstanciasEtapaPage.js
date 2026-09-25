// src/domains/formativa/pages/InstanciasEtapaPage.js
import React from 'react';
import InstanciaEtapaTable from '../components/instanciaEtapa/InstanciaEtapaTable';

// Sin botón "Nueva Instancia": no existe endpoint de creación (ver nota).
const InstanciasEtapaPage = () => (
  <div className="container-fluid mt-4">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="m-0">Instancias de Etapa</h4>
    </div>
    <div className="card">
      <InstanciaEtapaTable />
    </div>
  </div>
);

export default InstanciasEtapaPage;