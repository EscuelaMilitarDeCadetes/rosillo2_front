// src/components/common/ConfirmationModal.js
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const ConfirmationModal = ({ visible, onHide, onConfirm, header, loading, children }) => {
  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Confirmar" icon="pi pi-check" onClick={onConfirm} loading={loading} autoFocus />
    </div>
  );

  return (
    <Dialog header={header} visible={visible} style={{ width: '450px' }} modal footer={footer} onHide={onHide}>
      <div className="d-flex align-items-center">
        <i className="pi pi-exclamation-triangle me-3" style={{ fontSize: '2rem' }} />
        <div>
          {children}
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmationModal;
