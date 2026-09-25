// src/domains/common/pages/ReportesInstitucionalesPage.js
import React from 'react';
import ReportesInstitucionalesPanel from '../components/reportesInstitucionales/ReportesInstitucionalesPanel';

const ReportesInstitucionalesPage = () => (
  <div className="container-fluid mt-4">
    <div className="card p-3">
      <h5 className="mb-3">Reportes Institucionales</h5>
      <ReportesInstitucionalesPanel />
    </div>
  </div>
);

export default ReportesInstitucionalesPage;