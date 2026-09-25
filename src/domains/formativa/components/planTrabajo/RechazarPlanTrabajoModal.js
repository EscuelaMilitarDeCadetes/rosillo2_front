// src/domains/formativa/components/planTrabajo/RechazarPlanTrabajoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { rechazarPlanTrabajo } from '../../../../features/planTrabajo/planTrabajoSlice';

const RechazarPlanTrabajoModal = ({ visible, onHide, plan }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.planTrabajo);
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
      setValidationError('Debe indicar la razón del rechazo.');
      return;
    }
    dispatch(rechazarPlanTrabajo({ id: plan.id, observaciones })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Rechazar Plan"
        icon="pi pi-times-circle"
        className="p-button-danger"
        onClick={handleConfirm}
        loading={transicionandoId === plan?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Rechazar plan de trabajo — ${plan?.proceso_titulo ?? ''}`}
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

export default RechazarPlanTrabajoModal;