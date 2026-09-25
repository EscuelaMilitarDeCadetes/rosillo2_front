// src/domains/formativa/components/eventoEvaluativo/RegistrarResultadoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { registrarResultadoEvento } from '../../../../features/eventoEvaluativo/eventoEvaluativoSlice';

// El acta es opcional aquí: el backend permite registrar el resultado sin
// acta y cargarla después con CargarActaModal (cargar-acta exige que el
// resultado YA no sea PENDIENTE, orden inverso a esta acción).
const RegistrarResultadoModal = ({ visible, onHide, evento }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.eventoEvaluativo);
  const [resultado, setResultado] = useState('');
  const [actaSustentacionId, setActaSustentacionId] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setResultado('');
      setActaSustentacionId(null);
      setValidationError('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (!resultado.trim()) {
      setValidationError('El resultado es obligatorio.');
      return;
    }
    dispatch(
      registrarResultadoEvento({ id: evento.id, resultado, actaSustentacionId })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Registrar Resultado"
        icon="pi pi-check"
        onClick={handleConfirm}
        loading={transicionandoId === evento?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Registrar resultado — sustentación #${evento?.numero ?? ''}`}
      visible={visible}
      style={{ width: '30vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="resultado">Resultado *</label>
          <InputText
            id="resultado"
            value={resultado}
            maxLength={100}
            placeholder="Ej: APROBADO, APLAZADO"
            onChange={(e) => setResultado(e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="acta_sustentacion">ID Acta de Sustentación (opcional)</label>
          <InputNumber
            inputId="acta_sustentacion"
            value={actaSustentacionId}
            onValueChange={(e) => setActaSustentacionId(e.value)}
            useGrouping={false}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default RegistrarResultadoModal;