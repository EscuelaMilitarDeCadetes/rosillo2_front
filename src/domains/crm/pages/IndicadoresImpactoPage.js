// src/domains/crm/pages/IndicadoresImpactoPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import IndicadorImpactoTable from '../components/indicadorImpacto/IndicadorImpactoTable';
import IndicadorImpactoFormModal from '../components/indicadorImpacto/IndicadorImpactoFormModal';

const IndicadoresImpactoPage = () => {
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
        <h4 className="m-0">Indicadores de Impacto</h4>
        <Button label="Nuevo Indicador" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <IndicadorImpactoTable onEdit={handleEdit} />
      </div>
      <IndicadorImpactoFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default IndicadoresImpactoPage;