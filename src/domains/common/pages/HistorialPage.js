// src/domains/common/pages/HistorialPage.js
import React from 'react';
import HistorialTable from '../components/historial/HistorialTable';

const HistorialPage = () => (
  <div className="container-fluid mt-4">
    <div className="card">
      <HistorialTable />
    </div>
  </div>
);

export default HistorialPage;