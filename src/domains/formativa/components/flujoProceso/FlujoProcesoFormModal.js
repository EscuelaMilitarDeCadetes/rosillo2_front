// src/domains/formativa/components/flujoProceso/FlujoProcesoFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  crearFlujoProceso,
  actualizarFlujoProceso,
} from '../../../../features/flujoProceso/flujoProcesoSlice';
import { fetchModalidadesActivas } from '../../../../features/modalidad/modalidadSlice';

const TIPOS_FLUJO = [
  { label: 'Investigación Formativa', value: 'FORMATIVA' },
  { label: 'Investigación Formal', value: 'FORMAL' },
];

const ESTADO_INICIAL = {
  modalidad: null,
  modalidad_nombre: '',
  nombre: '',
  version: 1,
  tipo: 'FORMATIVA',
  descripcion: '',
  fecha_vigencia_inicio: null,
  fecha_vigencia_fin: null,
};

const aFecha = (valor) => (valor ? new Date(valor) : null);
const aISO = (fecha) => (fecha ? fecha.toISOString().slice(0, 10) : null);

/**
 * Modal de alta/edición para FlujoProceso, un objeto significa edición.
 *
 * modalidad, version y tipo se congelan tras la creación; en edición se 
 * muestran de solo lectura.
 *
 * La modalidad se elige con un Dropdown alimentado por modalidad activas.
 */
const FlujoProcesoFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.flujoProceso);
  const { items: modalidades, loading: cargandoModalidades } = useSelector(
    (state) => state.modalidad
  );
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      if (!esEdicion) {
        dispatch(fetchModalidadesActivas());
      }
      setFormData(
        item
          ? {
              modalidad: item.modalidad ?? null,
              modalidad_nombre: item.modalidad_nombre ?? '',
              nombre: item.nombre ?? '',
              version: item.version ?? 1,
              tipo: item.tipo ?? 'FORMATIVA',
              descripcion: item.descripcion ?? '',
              fecha_vigencia_inicio: aFecha(item.fecha_vigencia_inicio),
              fecha_vigencia_fin: aFecha(item.fecha_vigencia_fin),
            }
          : ESTADO_INICIAL
      );
      setValidationError('');
    }
  }, [visible, item, esEdicion, dispatch]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!esEdicion && !formData.modalidad) {
      setValidationError('La modalidad es obligatoria.');
      return false;
    }
    if (!formData.nombre.trim()) {
      setValidationError('El nombre del flujo es obligatorio.');
      return false;
    }
    if (!esEdicion && (!formData.version || formData.version < 1)) {
      setValidationError('La versión debe ser mayor o igual a 1.');
      return false;
    }
    if (!formData.fecha_vigencia_inicio) {
      setValidationError('La fecha de inicio de vigencia es obligatoria.');
      return false;
    }
    if (
      formData.fecha_vigencia_fin &&
      formData.fecha_vigencia_fin < formData.fecha_vigencia_inicio
    ) {
      setValidationError('La fecha de fin de vigencia no puede ser anterior a la de inicio.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const payloadComun = {
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      fecha_vigencia_inicio: aISO(formData.fecha_vigencia_inicio),
      fecha_vigencia_fin: aISO(formData.fecha_vigencia_fin),
    };
    const accion = esEdicion
      ? actualizarFlujoProceso({ id: item.id, payload: payloadComun })
      : crearFlujoProceso({
          ...payloadComun,
          modalidad: formData.modalidad,
          version: formData.version,
          tipo: formData.tipo,
        });
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
        label={esEdicion ? 'Guardar Cambios' : 'Crear Flujo'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Flujo de Proceso' : 'Nuevo Flujo de Proceso'}
      visible={visible}
      style={{ width: '40vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="modalidad">Modalidad *</label>
            {esEdicion ? (
              <InputText value={formData.modalidad_nombre} disabled />
            ) : (
              <Dropdown
                inputId="modalidad"
                value={formData.modalidad}
                options={modalidades}
                optionLabel="nombre"
                optionValue="id"
                filter
                loading={cargandoModalidades}
                onChange={(e) => handleChange('modalidad', e.value)}
                placeholder="Seleccione la modalidad"
              />
            )}
          </div>
          <div className="field mb-3 col">
            <label htmlFor="version">Versión *</label>
            <InputNumber
              inputId="version"
              value={formData.version}
              onValueChange={(e) => handleChange('version', e.value)}
              min={1}
              useGrouping={false}
              disabled={esEdicion}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="tipo">Tipo *</label>
            <Dropdown
              inputId="tipo"
              value={formData.tipo}
              options={TIPOS_FLUJO}
              onChange={(e) => handleChange('tipo', e.value)}
              disabled={esEdicion}
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="nombre">Nombre *</label>
          <InputText
            id="nombre"
            value={formData.nombre}
            maxLength={150}
            placeholder="Ej: 'Flujo Trabajo de Grado Pregrado'"
            onChange={(e) => handleChange('nombre', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="descripcion">Descripción</label>
          <InputTextarea
            id="descripcion"
            value={formData.descripcion}
            rows={3}
            onChange={(e) => handleChange('descripcion', e.target.value)}
          />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="fecha_vigencia_inicio">Vigencia Desde *</label>
            <Calendar
              inputId="fecha_vigencia_inicio"
              value={formData.fecha_vigencia_inicio}
              onChange={(e) => handleChange('fecha_vigencia_inicio', e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="fecha_vigencia_fin">Vigencia Hasta</label>
            <Calendar
              inputId="fecha_vigencia_fin"
              value={formData.fecha_vigencia_fin}
              onChange={(e) => handleChange('fecha_vigencia_fin', e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default FlujoProcesoFormModal;