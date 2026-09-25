// src/domains/formativa/components/homologacion/CargarActaHomologacionModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { cargarActaHomologacion } from '../../../../features/homologacion/homologacionSlice';

const CargarActaHomologacionModal = ({ visible, onHide, homologacion }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.homologacion);
  const [actaHomologacionId, setActaHomologacionId] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setActaHomologacionId(null);
      setValidationError('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (!actaHomologacionId) {
      setValidationError('Debe indicar el ID del acta de homologación.');
      return;
    }
    dispatch(cargarActaHomologacion({ id: homologacion.id, actaHomologacionId })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Cargar Acta"
        icon="pi pi-file-check"
        onClick={handleConfirm}
        loading={transicionandoId === homologacion?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Cargar acta — ${homologacion?.proceso_titulo ?? ''}`}
      visible={visible}
      style={{ width: '28vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="acta_homologacion">ID Acta de Homologación *</label>
          <InputNumber
            inputId="acta_homologacion"
            value={actaHomologacionId}
            onValueChange={(e) => setActaHomologacionId(e.value)}
            useGrouping={false}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default CargarActaHomologacionModal;