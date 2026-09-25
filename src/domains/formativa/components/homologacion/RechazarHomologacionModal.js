// src/domains/formativa/components/homologacion/RechazarHomologacionModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { rechazarHomologacion } from '../../../../features/homologacion/homologacionSlice';

const RechazarHomologacionModal = ({ visible, onHide, homologacion }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.homologacion);
  const [observaciones, setObservaciones] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setObservaciones('');
      setValidationError('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (!observaciones.trim()) {
      setValidationError('Debe indicar el motivo del rechazo.');
      return;
    }
    dispatch(rechazarHomologacion({ id: homologacion.id, observaciones })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Rechazar"
        icon="pi pi-times-circle"
        className="p-button-danger"
        onClick={handleConfirm}
        loading={transicionandoId === homologacion?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Rechazar homologación — ${homologacion?.proceso_titulo ?? ''}`}
      visible={visible}
      style={{ width: '30vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="observaciones">Motivo del Rechazo *</label>
          <InputTextarea
            id="observaciones"
            value={observaciones}
            rows={4}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default RechazarHomologacionModal;