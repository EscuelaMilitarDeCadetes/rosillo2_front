// src/domains/formativa/pages/BancoIdeasPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import BancoIdeasTable from '../components/bancoIdeas/BancoIdeasTable';
import BancoIdeaFormModal from '../components/bancoIdeas/BancoIdeaFormModal';

const BancoIdeasPage = () => {
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
        <h4 className="m-0">Banco de Ideas</h4>
        <Button label="Nueva Idea" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <BancoIdeasTable onEdit={handleEdit} />
      </div>
      <BancoIdeaFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default BancoIdeasPage;