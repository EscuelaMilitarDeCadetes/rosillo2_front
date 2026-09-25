// src/domains/institucional/pages/GerentesPage.js
import React from 'react';
import GerenteTable from '../components/gerentes/GerenteTable';

const GerentesPage = () => (
  <div className="container-fluid mt-4">
    <div className="card p-3">
      <GerenteTable />
    </div>
  </div>
);

export default GerentesPage;