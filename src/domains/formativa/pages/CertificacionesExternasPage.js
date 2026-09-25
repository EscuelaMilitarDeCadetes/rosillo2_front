// src/domains/formativa/pages/CertificacionesExternasPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import CertificacionExternaTable from '../components/certificacionExterna/CertificacionExternaTable';
import CertificacionExternaFormModal from '../components/certificacionExterna/CertificacionExternaFormModal';

const CertificacionesExternasPage = () => {
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
        <h4 className="m-0">Certificaciones Externas</h4>
        <Button label="Nueva Certificación" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <CertificacionExternaTable onEdit={handleEdit} />
      </div>
      <CertificacionExternaFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default CertificacionesExternasPage;