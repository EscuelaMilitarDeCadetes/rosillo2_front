// src/domains/formativa/pages/RegistrosActividadesPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import RegistroActividadesTable from '../components/registroActividades/RegistroActividadesTable';
import RegistroActividadesFormModal from '../components/registroActividades/RegistroActividadesFormModal';

const RegistrosActividadesPage = () => {
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
        <h4 className="m-0">Registros de Actividades</h4>
        <Button label="Nuevo Registro" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <RegistroActividadesTable onEdit={handleEdit} />
      </div>
      <RegistroActividadesFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default RegistrosActividadesPage;