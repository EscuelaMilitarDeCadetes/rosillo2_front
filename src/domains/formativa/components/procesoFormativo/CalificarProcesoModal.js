// src/domains/formativa/components/procesoFormativo/CalificarProcesoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { calificarProcesoFormativo } from '../../../../features/procesoFormativo/procesoFormativoSlice';

const CalificarProcesoModal = ({ visible, onHide, proceso }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.procesoFormativo);
  const [aprobado, setAprobado] = useState(true);
  const [notaFinal, setNotaFinal] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setAprobado(true);
      setNotaFinal(null);
      setValidationError('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (notaFinal == null || notaFinal < 0 || notaFinal > 5) {
      setValidationError('La nota final debe estar entre 0.0 y 5.0.');
      return;
    }
    if (aprobado && notaFinal < 3.5) {
      setValidationError('No se puede marcar como aprobado con una nota inferior a 3.5.');
      return;
    }
    dispatch(calificarProcesoFormativo({ id: proceso.id, aprobado, notaFinal })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Calificar"
        icon="pi pi-check"
        onClick={handleConfirm}
        loading={transicionandoId === proceso?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Calificar proceso — ${proceso?.titulo ?? ''}`}
      visible={visible}
      style={{ width: '30vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <Message
          severity="warn"
          className="mb-3 w-full"
          text="Solo se puede calificar una vez. Si el resultado es incorrecto, deberás usar 'Activar segunda instancia' (si el proceso lo permite)."
        />
        <div className="field mb-3 flex align-items-center gap-2">
          <Checkbox inputId="aprobado" checked={aprobado} onChange={(e) => setAprobado(e.checked)} />
          <label htmlFor="aprobado">Proceso aprobado</label>
        </div>
        <div className="field mb-3">
          <label htmlFor="nota_final">Nota Final *</label>
          <InputNumber
            inputId="nota_final"
            value={notaFinal}
            onValueChange={(e) => setNotaFinal(e.value)}
            min={0}
            max={5}
            mode="decimal"
            minFractionDigits={1}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default CalificarProcesoModal;