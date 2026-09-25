// src/domains/formativa/pages/ActividadesFormativasPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import ActividadFormativaTable from '../components/actividadFormativa/ActividadFormativaTable';
import ActividadFormativaFormModal from '../components/actividadFormativa/ActividadFormativaFormModal';

const ActividadesFormativasPage = () => {
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
        <h4 className="m-0">Actividades Formativas</h4>
        <Button label="Nueva Actividad" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <ActividadFormativaTable onEdit={handleEdit} />
      </div>
      <ActividadFormativaFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default ActividadesFormativasPage;