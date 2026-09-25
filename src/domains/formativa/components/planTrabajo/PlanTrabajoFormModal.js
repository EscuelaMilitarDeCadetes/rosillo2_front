// src/domains/formativa/components/planTrabajo/PlanTrabajoFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  crearPlanTrabajo,
  actualizarPlanTrabajo,
} from '../../../../features/planTrabajo/planTrabajoSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';

const ESTADO_INICIAL = {
  proceso: null,
  descripcion_general: '',
  objetivo_general: '',
  actividades_planeadas: '',
  fecha_inicio_planeada: null,
  fecha_fin_planeada: null,
  observaciones: '',
};

const aFecha = (valor) => (valor ? new Date(valor) : null);
const aISO = (fecha) => (fecha ? fecha.toISOString().slice(0, 10) : null);

/**
 * Modal de alta/edición para PlanTrabajo. `item` = null significa creación;
 * un objeto significa edición (PUT). Solo editable si el plan está en
 * BORRADOR o RECHAZADO (ver PlanTrabajoValidator.ESTADOS_EDITABLES) — el
 * componente que abre este modal (PlanTrabajoTable) ya filtra esa condición
 * antes de mostrar el botón de editar. `proceso` es un OneToOneField, así
 * que en edición se muestra de solo lectura (no cambia tras la creación).
 */
const PlanTrabajoFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.planTrabajo);
  const { items: procesos } = useSelector((state) => state.procesosInvFormativa);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      dispatch(fetchProcesosActivos());
      setFormData(
        item
          ? {
              proceso: item.proceso ?? null,
              descripcion_general: item.descripcion_general ?? '',
              objetivo_general: item.objetivo_general ?? '',
              actividades_planeadas: item.actividades_planeadas ?? '',
              fecha_inicio_planeada: aFecha(item.fecha_inicio_planeada),
              fecha_fin_planeada: aFecha(item.fecha_fin_planeada),
              observaciones: item.observaciones ?? '',
            }
          : ESTADO_INICIAL
      );
      setValidationError('');
    }
  }, [visible, item, dispatch]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!esEdicion && !formData.proceso) {
      setValidationError('El proceso formativo es obligatorio.');
      return false;
    }
    if (!formData.descripcion_general.trim()) {
      setValidationError('La descripción general es obligatoria.');
      return false;
    }
    if (!formData.objetivo_general.trim()) {
      setValidationError('El objetivo general es obligatorio.');
      return false;
    }
    if (!formData.actividades_planeadas.trim()) {
      setValidationError('Las actividades planeadas son obligatorias.');
      return false;
    }
    if (!formData.fecha_inicio_planeada || !formData.fecha_fin_planeada) {
      setValidationError('Las fechas de inicio y fin planeadas son obligatorias.');
      return false;
    }
    if (formData.fecha_fin_planeada < formData.fecha_inicio_planeada) {
      setValidationError('La fecha de fin planeada no puede ser anterior a la de inicio.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const payloadComun = {
      descripcion_general: formData.descripcion_general,
      objetivo_general: formData.objetivo_general,
      actividades_planeadas: formData.actividades_planeadas,
      fecha_inicio_planeada: aISO(formData.fecha_inicio_planeada),
      fecha_fin_planeada: aISO(formData.fecha_fin_planeada),
      observaciones: formData.observaciones || null,
    };
    const accion = esEdicion
      ? actualizarPlanTrabajo({ id: item.id, payload: payloadComun })
      : crearPlanTrabajo({ ...payloadComun, proceso: formData.proceso });
    dispatch(accion).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label={esEdicion ? 'Guardar Cambios' : 'Crear Plan'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Plan de Trabajo' : 'Nuevo Plan de Trabajo'}
      visible={visible}
      style={{ width: '50vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="proceso">Proceso Formativo *</label>
          {esEdicion ? (
            <span className="p-inputtext p-disabled">{item.proceso_titulo}</span>
          ) : (
            <Dropdown
              inputId="proceso"
              value={formData.proceso}
              options={procesos}
              optionLabel="titulo"
              optionValue="id"
              filter
              onChange={(e) => handleChange('proceso', e.value)}
              placeholder="Seleccione el proceso formativo"
            />
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="descripcion_general">Descripción General *</label>
          <InputTextarea
            id="descripcion_general"
            value={formData.descripcion_general}
            rows={3}
            onChange={(e) => handleChange('descripcion_general', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="objetivo_general">Objetivo General *</label>
          <InputTextarea
            id="objetivo_general"
            value={formData.objetivo_general}
            rows={3}
            onChange={(e) => handleChange('objetivo_general', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="actividades_planeadas">Actividades Planeadas *</label>
          <InputTextarea
            id="actividades_planeadas"
            value={formData.actividades_planeadas}
            rows={4}
            placeholder="Lista de actividades con cronograma estimado"
            onChange={(e) => handleChange('actividades_planeadas', e.target.value)}
          />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="fecha_inicio_planeada">Fecha Inicio Planeada *</label>
            <Calendar
              inputId="fecha_inicio_planeada"
              value={formData.fecha_inicio_planeada}
              onChange={(e) => handleChange('fecha_inicio_planeada', e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="fecha_fin_planeada">Fecha Fin Planeada *</label>
            <Calendar
              inputId="fecha_fin_planeada"
              value={formData.fecha_fin_planeada}
              onChange={(e) => handleChange('fecha_fin_planeada', e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="observaciones">Observaciones</label>
          <InputTextarea
            id="observaciones"
            value={formData.observaciones}
            rows={2}
            onChange={(e) => handleChange('observaciones', e.target.value)}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default PlanTrabajoFormModal;