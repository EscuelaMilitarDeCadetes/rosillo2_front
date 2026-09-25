// src/domains/formativa/components/segundaInstancia/DecisionDecanoActivacionModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import {
  confirmarActivacionDecano,
  denegarActivacionDecano,
} from '../../../../features/segundaInstancia/segundaInstanciaSlice';


const DecisionDecanoActivacionModal = ({ visible, onHide, aprobacion }) => {
  const dispatch = useDispatch();
  const { transicionandoAprobacionId, error } = useSelector((state) => state.segundaInstancia);
  const [observacion, setObservacion] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setObservacion('');
      setValidationError('');
    }
  }, [visible]);

  const enTransicion = transicionandoAprobacionId === aprobacion?.id;

  const handleConfirmar = () => {
    dispatch(
      confirmarActivacionDecano({ aprobacionId: aprobacion.id, observacionDecano: observacion || null })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') onHide();
    });
  };

  const handleDenegar = () => {
    if (!observacion.trim()) {
      setValidationError('La observación es obligatoria para denegar la activación.');
      return;
    }
    dispatch(denegarActivacionDecano({ aprobacionId: aprobacion.id, observacion })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') onHide();
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Denegar" icon="pi pi-times-circle" className="p-button-danger" onClick={handleDenegar} loading={enTransicion} />
      <Button label="Confirmar Activación" icon="pi pi-check" onClick={handleConfirmar} loading={enTransicion} autoFocus />
    </div>
  );

  return (
    <Dialog header="Decisión del Decano — Activación de Segunda Instancia" visible={visible} style={{ width: '35vw' }} footer={footer} onHide={onHide}>
      <div className="p-fluid">
        <Message
          severity="info"
          className="mb-3 w-full"
          text={
            aprobacion
              ? `Resolviendo la activación de la segunda instancia #${aprobacion.id_documento} ` +
                `(recibida el ${new Date(aprobacion.fecha_revision).toLocaleString('es-CO')}).`
              : 'Selecciona una solicitud desde la bandeja de pendientes.'
          }
        />
        <div className="field mb-3">
          <label htmlFor="observacion">Observación {`(obligatoria solo para denegar)`}</label>
          <InputTextarea id="observacion" value={observacion} rows={3} onChange={(e) => setObservacion(e.target.value)} />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default DecisionDecanoActivacionModal;