// src/domains/formativa/components/eventoEvaluativo/ReprogramarEventoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import { reprogramarEventoEvaluativo } from '../../../../features/eventoEvaluativo/eventoEvaluativoSlice';

const ReprogramarEventoModal = ({ visible, onHide, evento }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.eventoEvaluativo);
  const [fecha, setFecha] = useState(null);
  const [lugar, setLugar] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible && evento) {
      setFecha(evento.fecha_sustentacion ? new Date(evento.fecha_sustentacion) : null);
      setLugar(evento.lugar || '');
      setValidationError('');
    }
  }, [visible, evento]);

  const handleConfirm = () => {
    if (!fecha || !lugar.trim()) {
      setValidationError('La fecha y el lugar son obligatorios.');
      return;
    }
    dispatch(
      reprogramarEventoEvaluativo({
        id: evento.id,
        fechaSustentacion: fecha.toISOString(),
        lugar,
      })
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
        label="Reprogramar"
        icon="pi pi-calendar"
        onClick={handleConfirm}
        loading={transicionandoId === evento?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Reprogramar sustentación #${evento?.numero ?? ''}`}
      visible={visible}
      style={{ width: '30vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="fecha_sustentacion">Nueva Fecha y Hora *</label>
          <Calendar
            inputId="fecha_sustentacion"
            value={fecha}
            onChange={(e) => setFecha(e.value)}
            showTime
            hourFormat="24"
            dateFormat="yy-mm-dd"
            showIcon
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="lugar">Nuevo Lugar *</label>
          <InputText id="lugar" value={lugar} maxLength={255} onChange={(e) => setLugar(e.target.value)} />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default ReprogramarEventoModal;