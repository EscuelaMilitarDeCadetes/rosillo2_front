// src/domains/common/components/tarea/AsignarTareaModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import { crearTarea, limpiarErrorTarea } from '../../../../features/tarea/tareaSlice';

// Crea una tarea para el usuario autenticado. Si se pasan los props de objeto
// (ej. desde un proyecto), la tarea queda vinculada a ese objeto; si no, es
// una tarea personal sin objeto asociado.
const AsignarTareaModal = ({ visible, onHide, onCreada, contentTypeAppLabel, contentTypeModel, objectId, objetoLabel }) => {
  const dispatch = useDispatch();
  const { creando, crearError } = useSelector((state) => state.tarea);
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      dispatch(limpiarErrorTarea());
      setDescripcion('');
      setFechaLimite(null);
      setValidationError('');
    }
  }, [visible, dispatch]);

  const handleSubmit = () => {
    if (!descripcion.trim()) {
      setValidationError('Debe escribir la descripción de la tarea.');
      return;
    }
    setValidationError('');
    dispatch(
      crearTarea({
        descripcion: descripcion.trim(),
        fechaLimite: fechaLimite ? fechaLimite.toISOString().slice(0, 10) : undefined,
        contentTypeAppLabel,
        contentTypeModel,
        objectId,
      })
    ).then((result) => {
      if (crearTarea.fulfilled.match(result)) {
        onCreada?.(result.payload);
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
      <Button label="Crear Tarea" icon="pi pi-check" loading={creando} onClick={handleSubmit} />
    </div>
  );

  return (
    <Dialog header="Nueva Tarea" visible={visible} style={{ width: '28rem' }} footer={footer} onHide={onHide}>
      {(validationError || crearError) && (
        <Message severity="error" className="mb-3 w-full" text={validationError || crearError} />
      )}
      {objetoLabel && (
        <p className="text-muted small mb-3">
          Objeto relacionado: <strong>{objetoLabel}</strong>
        </p>
      )}
      <div className="field mb-3">
        <label htmlFor="descripcionTarea">Descripción</label>
        <InputText id="descripcionTarea" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={255} className="w-100" />
      </div>
      <div className="field mb-0">
        <label htmlFor="fechaLimiteTarea">Fecha Límite (opcional)</label>
        <Calendar inputId="fechaLimiteTarea" value={fechaLimite} onChange={(e) => setFechaLimite(e.value)} dateFormat="dd/mm/yy" showIcon className="w-100" />
      </div>
    </Dialog>
  );
};

export default AsignarTareaModal;