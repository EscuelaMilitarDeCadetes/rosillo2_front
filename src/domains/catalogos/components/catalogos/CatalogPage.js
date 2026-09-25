// src/domains/catalogos/components/catalogos/CatalogPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import CatalogTable from './CatalogTable';
import CatalogFormModal from './CatalogFormModal';

/**
 * Página genérica de administración para un catálogo de catalogosConfig.js.
 * Cada catálogo concreto (RolPlataformaPage, GradoEstudiosPage, ...) es solo
 * una instancia de este componente con su `config` correspondiente.
 */
const CatalogPage = ({ config }) => {
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
        <h4 className="m-0">{config.titulo}</h4>
        <Button label={`Nuevo ${config.tituloSingular}`} icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <CatalogTable config={config} onEdit={handleEdit} />
      </div>
      <CatalogFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        config={config}
        item={selectedItem}
      />
    </div>
  );
};

export default CatalogPage;