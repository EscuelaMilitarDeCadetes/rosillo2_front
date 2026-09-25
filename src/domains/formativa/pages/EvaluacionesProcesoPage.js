// src/domains/formativa/pages/EvaluacionesProcesoPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import EvaluacionProcesoTable from '../components/evaluacionProceso/EvaluacionProcesoTable';
import EvaluacionProcesoFormModal from '../components/evaluacionProceso/EvaluacionProcesoFormModal';

const EvaluacionesProcesoPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Evaluaciones de Proceso</h4>
        <Button label="Nueva Evaluación" icon="pi pi-plus" onClick={() => setIsModalVisible(true)} />
      </div>
      <div className="card">
        <EvaluacionProcesoTable />
      </div>
      <EvaluacionProcesoFormModal visible={isModalVisible} onHide={() => setIsModalVisible(false)} />
    </div>
  );
};

export default EvaluacionesProcesoPage;