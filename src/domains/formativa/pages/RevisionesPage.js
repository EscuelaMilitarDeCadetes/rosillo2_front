// src/domains/formativa/pages/RevisionesPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import RevisionTable from '../components/revision/RevisionTable';
import RevisionFormModal from '../components/revision/RevisionFormModal';

const RevisionesPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Revisiones</h4>
        <Button label="Nueva Revisión" icon="pi pi-plus" onClick={() => setIsModalVisible(true)} />
      </div>
      <div className="card">
        <RevisionTable />
      </div>
      <RevisionFormModal visible={isModalVisible} onHide={() => setIsModalVisible(false)} />
    </div>
  );
};

export default RevisionesPage;