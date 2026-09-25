// src/domains/formativa/components/registroHoras/AjustarHorasRequeridasModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { ajustarHorasRequeridas } from '../../../../features/registroHoras/registroHorasSlice';

const AjustarHorasRequeridasModal = ({ visible, onHide, registro }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.registroHoras);
  const [horasRequeridas, setHorasRequeridas] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible && registro) {
      setHorasRequeridas(registro.horas_requeridas);
      setValidationError('');
    }
  }, [visible, registro]);

  const handleConfirm = () => {
    if (!horasRequeridas || horasRequeridas <= 0) {
      setValidationError('Las horas requeridas deben ser mayores a cero.');
      return;
    }
    if (horasRequeridas < registro.horas_acumuladas) {
      setValidationError('No pueden quedar por debajo de las horas ya acumuladas y validadas.');
      return;
    }
    dispatch(ajustarHorasRequeridas({ id: registro.id, horasRequeridas })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Ajustar"
        icon="pi pi-check"
        onClick={handleConfirm}
        loading={transicionandoId === registro?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Ajustar horas requeridas — ${registro?.proceso_titulo ?? ''}`}
      visible={visible}
      style={{ width: '28vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <p className="text-sm text-color-secondary">
          Acumuladas actualmente: <strong>{registro?.horas_acumuladas}</strong> h.
        </p>
        <div className="field mb-3">
          <label htmlFor="horas_requeridas">Nuevas Horas Requeridas *</label>
          <InputNumber
            inputId="horas_requeridas"
            value={horasRequeridas}
            onValueChange={(e) => setHorasRequeridas(e.value)}
            min={1}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default AjustarHorasRequeridasModal;