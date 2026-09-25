// src/domains/formativa/pages/PlanesTrabajoPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import PlanTrabajoTable from '../components/planTrabajo/PlanTrabajoTable';
import PlanTrabajoFormModal from '../components/planTrabajo/PlanTrabajoFormModal';

const PlanesTrabajoPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleNew = () => {
    setSelectedItem(null);
    setIsModalVisible(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Planes de Trabajo</h4>
        <Button label="Nuevo Plan de Trabajo" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <PlanTrabajoTable onEdit={handleEdit} />
      </div>
      <PlanTrabajoFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default PlanesTrabajoPage;