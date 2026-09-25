// src/domains/formativa/components/homologacion/AprobarHomologacionModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { aprobarHomologacion } from '../../../../features/homologacion/homologacionSlice';

const AprobarHomologacionModal = ({ visible, onHide, homologacion }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.homologacion);
  const [creditosReconocidos, setCreditosReconocidos] = useState(null);
  const [actaHomologacionId, setActaHomologacionId] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setCreditosReconocidos(null);
      setActaHomologacionId(null);
      setValidationError('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (!creditosReconocidos || creditosReconocidos <= 0) {
      setValidationError('Los créditos reconocidos deben ser mayores a 0.');
      return;
    }
    dispatch(
      aprobarHomologacion({ id: homologacion.id, creditosReconocidos, actaHomologacionId })
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
        label="Aprobar"
        icon="pi pi-check"
        onClick={handleConfirm}
        loading={transicionandoId === homologacion?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Aprobar homologación — ${homologacion?.proceso_titulo ?? ''}`}
      visible={visible}
      style={{ width: '28vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="creditos_reconocidos">Créditos Reconocidos *</label>
          <InputNumber
            inputId="creditos_reconocidos"
            value={creditosReconocidos}
            onValueChange={(e) => setCreditosReconocidos(e.value)}
            min={0.1}
            mode="decimal"
            minFractionDigits={1}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="acta_homologacion">ID Acta de Homologación (opcional)</label>
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

export default AprobarHomologacionModal;