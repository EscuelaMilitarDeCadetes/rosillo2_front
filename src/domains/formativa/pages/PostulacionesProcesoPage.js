// src/domains/formativa/pages/PostulacionesProcesoPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import PostulacionProcesoTable from '../components/postulacionProceso/PostulacionProcesoTable';
import PostulacionProcesoFormModal from '../components/postulacionProceso/PostulacionProcesoFormModal';
import DecisionDecanoModal from '../components/postulacionProceso/DecisionDecanoModal';
import AprobacionesPendientesTable from '../../common/components/aprobacion/AprobacionesPendientesTable';

const PostulacionesProcesoPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isBandejaVisible, setIsBandejaVisible] = useState(false);
  const [aprobacionSeleccionada, setAprobacionSeleccionada] = useState(null);

  const handleNew = () => {
    setSelectedItem(null);
    setIsModalVisible(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleSeleccionarAprobacion = (aprobacion) => {
    setIsBandejaVisible(false);
    setAprobacionSeleccionada(aprobacion);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Postulaciones a Procesos de Grado</h4>
        <div className="flex gap-2">
          <Button
            label="Decisión del Decano"
            icon="pi pi-briefcase"
            className="p-button-outlined"
            onClick={() => setIsBandejaVisible(true)}
          />
          <Button label="Nueva Postulación" icon="pi pi-plus" onClick={handleNew} />
        </div>
      </div>
      <div className="card">
        <PostulacionProcesoTable onEdit={handleEdit} />
      </div>
      <PostulacionProcesoFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
      {/* Paso 1: bandeja navegable de Aprobaciones pendientes del Decano,
          acotada a las que corresponden a postulaciones -- reemplaza el
          antiguo InputNumber donde el Decano escribía el ID a mano. */}
      <Dialog
        header="Postulaciones pendientes de tu decisión"
        visible={isBandejaVisible}
        style={{ width: '50vw' }}
        onHide={() => setIsBandejaVisible(false)}
      >
        <AprobacionesPendientesTable
          filtroTipoDocumento="APROBACION_POSTULACION"
          onSeleccionar={handleSeleccionarAprobacion}
        />
      </Dialog>
      {/* Paso 2: con la Aprobacion ya elegida, se abre el modal de decisión. */}
      <DecisionDecanoModal
        visible={Boolean(aprobacionSeleccionada)}
        onHide={() => setAprobacionSeleccionada(null)}
        aprobacion={aprobacionSeleccionada}
      />
    </div>
  );
};

export default PostulacionesProcesoPage;