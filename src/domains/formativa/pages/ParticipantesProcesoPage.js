// src/domains/formativa/pages/ParticipantesProcesoPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import ParticipanteProcesoTable from '../components/participanteProceso/ParticipanteProcesoTable';
import ParticipanteProcesoFormModal from '../components/participanteProceso/ParticipanteProcesoFormModal';

const ParticipantesProcesoPage = () => {
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
        <h4 className="m-0">Participantes de Proceso</h4>
        <Button label="Nuevo Participante" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <ParticipanteProcesoTable onEdit={handleEdit} />
      </div>
      <ParticipanteProcesoFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default ParticipantesProcesoPage;