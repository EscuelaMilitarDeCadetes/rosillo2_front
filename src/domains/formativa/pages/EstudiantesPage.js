// src/domains/formativa/pages/EstudiantesPage.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import EstudianteTable from '../components/estudiante/EstudianteTable';
import EstudianteFormModal from '../components/estudiante/EstudianteFormModal';

const EstudiantesPage = () => {
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
        <h4 className="m-0">Estudiantes</h4>
        {puedeCrear && <Button label="Nuevo Estudiante" icon="pi pi-plus" onClick={handleNew} />}
      </div>
      <div className="card">
        <EstudianteTable onEdit={handleEdit} />
      </div>
      <EstudianteFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default EstudiantesPage;