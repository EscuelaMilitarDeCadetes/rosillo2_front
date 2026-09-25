// src/domains/formativa/components/certificacionExterna/ValidarHorasModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { validarHorasCertificacion } from '../../../../features/certificacionExterna/certificacionExternaSlice';

const HORAS_MINIMAS_CUMPLIMIENTO = 120;

const ValidarHorasModal = ({ visible, onHide, certificacion }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.certificacionExterna);
  const [horasValidadas, setHorasValidadas] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible && certificacion) {
      setHorasValidadas(certificacion.horas_certificadas);
      setValidationError('');
    }
  }, [visible, certificacion]);

  const handleConfirm = () => {
    if (horasValidadas == null || horasValidadas < 0) {
      setValidationError('Las horas validadas no pueden ser negativas.');
      return;
    }
    dispatch(validarHorasCertificacion({ id: certificacion.id, horasValidadas })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Validar"
        icon="pi pi-check"
        onClick={handleConfirm}
        loading={transicionandoId === certificacion?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Validar horas — ${certificacion?.nombre_programa ?? ''}`}
      visible={visible}
      style={{ width: '28vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <p className="text-sm text-color-secondary">
          Certificadas por la institución: <strong>{certificacion?.horas_certificadas}</strong> h.
          Cumple el mínimo (&ge; {HORAS_MINIMAS_CUMPLIMIENTO} h) automáticamente al validar.
        </p>
        <div className="field mb-3">
          <label htmlFor="horas_validadas">Horas Validadas *</label>
          <InputNumber
            inputId="horas_validadas"
            value={horasValidadas}
            onValueChange={(e) => setHorasValidadas(e.value)}
            min={0}
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

export default ValidarHorasModal;