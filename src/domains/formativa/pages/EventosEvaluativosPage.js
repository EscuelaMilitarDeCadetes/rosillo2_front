// src/domains/formativa/pages/EventosEvaluativosPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import EventoEvaluativoTable from '../components/eventoEvaluativo/EventoEvaluativoTable';
import EventoEvaluativoFormModal from '../components/eventoEvaluativo/EventoEvaluativoFormModal';

const EventosEvaluativosPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Sustentaciones</h4>
        <Button label="Nueva Sustentación" icon="pi pi-plus" onClick={() => setIsModalVisible(true)} />
      </div>
      <div className="card">
        <EventoEvaluativoTable />
      </div>
      <EventoEvaluativoFormModal visible={isModalVisible} onHide={() => setIsModalVisible(false)} />
    </div>
  );
};

export default EventosEvaluativosPage;