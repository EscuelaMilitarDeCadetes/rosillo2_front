// src/domains/formativa/pages/TutoresPage.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import TutorTable from '../components/tutor/TutorTable';
import TutorFormModal from '../components/tutor/TutorFormModal';

const TutoresPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  // El alta es sólo de FACULTAD y DECANO (ROLES_ALTA_ESTUDIANTE_TUTOR en el
  // backend); SOPORTE puede consultar y editar, pero no crear.
  const { roles } = useSelector((state) => state.auth);
  const puedeCrear = ['FACULTAD', 'DECANO'].some((r) => roles?.includes(r));
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
        <h4 className="m-0">Tutores</h4>
        {puedeCrear && <Button label="Nuevo Tutor" icon="pi pi-plus" onClick={handleNew} />}
      </div>
      <div className="card">
        <TutorTable onEdit={handleEdit} />
      </div>
      <TutorFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default TutoresPage;