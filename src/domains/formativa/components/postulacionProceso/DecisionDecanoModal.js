// src/domains/formativa/components/postulacionProceso/DecisionDecanoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  confirmarAprobacionDecano,
  denegarPorDecano,
} from '../../../../features/postulacionProceso/postulacionProcesoSlice';
import { fetchFlujosActivos } from '../../../../features/flujoProceso/flujoProcesoSlice';

const ESTADO_INICIAL = {
  flujo_version: null,
  titulo: '',
  observacion: '',
  fecha_inicio: null,
  fecha_fin: null,
  observacion_decano: '',
};
const aISO = (fecha) => (fecha ? fecha.toISOString().slice(0, 10) : null);

/**
 * Vista del Decano confirmando o denegando una solicitud abierta por
 * Facultad.
 */
const DecisionDecanoModal = ({ visible, onHide, aprobacion }) => {
  const dispatch = useDispatch();
  const { transicionandoAprobacionId, error } = useSelector((state) => state.postulacionProceso);
  const { items: flujos } = useSelector((state) => state.flujoProceso);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      dispatch(fetchFlujosActivos());
      setFormData(ESTADO_INICIAL);
      setValidationError('');
    }
  }, [visible, dispatch]);

  const handleChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleConfirmar = () => {
    if (!formData.flujo_version || !formData.titulo.trim() ||
        !formData.observacion.trim() || !formData.fecha_inicio || !formData.fecha_fin) {
      setValidationError('Todos los campos (excepto observación del Decano) son obligatorios.');
      return;
    }
    dispatch(
      confirmarAprobacionDecano({
        aprobacionId: aprobacion.id,
        flujoVersionId: formData.flujo_version,
        titulo: formData.titulo,
        observacion: formData.observacion,
        fechaInicio: aISO(formData.fecha_inicio),
        fechaFin: aISO(formData.fecha_fin),
        observacionDecano: formData.observacion_decano || null,
      })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') onHide();
    });
  };

  const handleDenegar = () => {
    if (!formData.observacion_decano.trim()) {
      setValidationError('La observación es obligatoria para denegar.');
      return;
    }
    dispatch(
      denegarPorDecano({ aprobacionId: aprobacion.id, observacion: formData.observacion_decano })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') onHide();
    });
  };

  const enTransicion = transicionandoAprobacionId === aprobacion?.id;

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Denegar" icon="pi pi-times-circle" className="p-button-danger" onClick={handleDenegar} loading={enTransicion} />
      <Button label="Confirmar Aprobación" icon="pi pi-check" onClick={handleConfirmar} loading={enTransicion} autoFocus />
    </div>
  );
  return (
    <Dialog header="Decisión del Decano sobre Postulación" visible={visible} style={{ width: '42vw' }} footer={footer} onHide={onHide}>
      <div className="p-fluid">
        <Message
          severity="info"
          className="mb-3 w-full"
          text={
            aprobacion
              ? `Resolviendo la solicitud de postulación #${aprobacion.id_documento} ` +
                `(recibida el ${new Date(aprobacion.fecha_revision).toLocaleString('es-CO')}).`
              : 'Selecciona una solicitud desde la bandeja de pendientes.'
          }
        />
        <div className="field mb-3">
          <label htmlFor="observacion_decano">Observación del Decano</label>
          <InputTextarea id="observacion_decano" value={formData.observacion_decano} rows={2} onChange={(e) => handleChange('observacion_decano', e.target.value)} />
        </div>
        <Message
          severity="info"
          className="mb-3 w-full"
          text="Los siguientes campos solo se usan si vas a CONFIRMAR (generan el proceso formativo)."
        />
        <div className="field mb-3">
          <label htmlFor="flujo_version">Versión de Flujo</label>
          <Dropdown inputId="flujo_version" value={formData.flujo_version} options={flujos} optionLabel="nombre" optionValue="id" filter onChange={(e) => handleChange('flujo_version', e.value)} placeholder="Seleccione" />
        </div>
        <div className="field mb-3">
          <label htmlFor="titulo">Título del Proceso</label>
          <InputText id="titulo" value={formData.titulo} maxLength={500} onChange={(e) => handleChange('titulo', e.target.value)} />
        </div>
        <div className="field mb-3">
          <label htmlFor="observacion">Tema / Área del Proyecto</label>
          <InputTextarea id="observacion" value={formData.observacion} rows={2} onChange={(e) => handleChange('observacion', e.target.value)} />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="fecha_inicio">Fecha Inicio</label>
            <Calendar inputId="fecha_inicio" value={formData.fecha_inicio} onChange={(e) => handleChange('fecha_inicio', e.value)} dateFormat="yy-mm-dd" showIcon />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="fecha_fin">Fecha Fin</label>
            <Calendar inputId="fecha_fin" value={formData.fecha_fin} onChange={(e) => handleChange('fecha_fin', e.value)} dateFormat="yy-mm-dd" showIcon />
          </div>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};
export default DecisionDecanoModal;