// src/domains/formativa/components/postulacionProceso/AprobarPostulacionModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { aprobarPostulacionDirecto } from '../../../../features/postulacionProceso/postulacionProcesoSlice';
import { fetchFlujosActivos } from '../../../../features/flujoProceso/flujoProcesoSlice';

const ESTADO_INICIAL = { flujo_version: null, titulo: '', observacion: '', fecha_inicio: null, fecha_fin: null };
const aISO = (fecha) => (fecha ? fecha.toISOString().slice(0, 10) : null);


const AprobarPostulacionModal = ({ visible, onHide, postulacion }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.postulacionProceso);
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

  const handleConfirm = () => {
    if (!formData.flujo_version || !formData.titulo.trim() || !formData.observacion.trim() ||
        !formData.fecha_inicio || !formData.fecha_fin) {
      setValidationError('Todos los campos son obligatorios para generar el proceso formativo.');
      return;
    }
    dispatch(
      aprobarPostulacionDirecto({
        id: postulacion.id,
        flujoVersionId: formData.flujo_version,
        titulo: formData.titulo,
        observacion: formData.observacion,
        fechaInicio: aISO(formData.fecha_inicio),
        fechaFin: aISO(formData.fecha_fin),
      })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') onHide();
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Aprobar y Crear Proceso"
        icon="pi pi-check"
        onClick={handleConfirm}
        loading={transicionandoId === postulacion?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Aprobar postulación — ${postulacion?.estudiante_nombre_completo ?? ''}`}
      visible={visible}
      style={{ width: '40vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="flujo_version">Versión de Flujo *</label>
          <Dropdown
            inputId="flujo_version"
            value={formData.flujo_version}
            options={flujos}
            optionLabel="nombre"
            optionValue="id"
            filter
            onChange={(e) => handleChange('flujo_version', e.value)}
            placeholder="Seleccione la versión de flujo"
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="titulo">Título del Proceso *</label>
          <InputText id="titulo" value={formData.titulo} maxLength={500} onChange={(e) => handleChange('titulo', e.target.value)} />
        </div>
        <div className="field mb-3">
          <label htmlFor="observacion">Tema / Área del Proyecto *</label>
          <InputTextarea id="observacion" value={formData.observacion} rows={3} onChange={(e) => handleChange('observacion', e.target.value)} />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="fecha_inicio">Fecha Inicio *</label>
            <Calendar inputId="fecha_inicio" value={formData.fecha_inicio} onChange={(e) => handleChange('fecha_inicio', e.value)} dateFormat="yy-mm-dd" showIcon />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="fecha_fin">Fecha Fin *</label>
            <Calendar inputId="fecha_fin" value={formData.fecha_fin} onChange={(e) => handleChange('fecha_fin', e.value)} dateFormat="yy-mm-dd" showIcon />
          </div>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default AprobarPostulacionModal;