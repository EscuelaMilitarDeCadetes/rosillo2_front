// src/domains/formativa/components/postulacionProceso/RechazarPostulacionModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { rechazarPostulacionDirecto } from '../../../../features/postulacionProceso/postulacionProcesoSlice';

const RechazarPostulacionModal = ({ visible, onHide, postulacion }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.postulacionProceso);
  const [observacion, setObservacion] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setObservacion('');
      setValidationError('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (!observacion.trim()) {
      setValidationError('Debe indicar el motivo del rechazo.');
      return;
    }
    dispatch(rechazarPostulacionDirecto({ id: postulacion.id, observacionCoordinacion: observacion })).then(
      (result) => {
        if (result.meta.requestStatus === 'fulfilled') onHide();
      }
    );
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Rechazar"
        icon="pi pi-times-circle"
        className="p-button-danger"
        onClick={handleConfirm}
        loading={transicionandoId === postulacion?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Rechazar postulación — ${postulacion?.estudiante_nombre_completo ?? ''}`}
      visible={visible}
      style={{ width: '30vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="observacion">Motivo del Rechazo *</label>
          <InputTextarea id="observacion" value={observacion} rows={4} onChange={(e) => setObservacion(e.target.value)} />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default RechazarPostulacionModal;