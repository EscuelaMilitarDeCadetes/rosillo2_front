// src/domains/formativa/components/transicionFlujo/TransicionFlujoFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import {
  crearTransicionFlujo,
  actualizarTransicionFlujo,
} from '../../../../features/transicionFlujo/transicionFlujoSlice';

const ESTADO_INICIAL = {
  etapa_origen: null,
  etapa_destino: null,
  nombre: '',
  condicion: '',
  accion_automatica: '',
  orden: 0,
};

/**
 * Modal de alta/edición para TransicionFlujo. `item` = null significa
 * creación; un objeto significa edición (PUT). No existe un selector de
 * EtapaFlujo en el proyecto, así que etapa_origen/etapa_destino se capturan
 * por ID (igual que en ReglaFlujo).
 */
const TransicionFlujoFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.transicionFlujo);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      setFormData(
        item
          ? {
              etapa_origen: item.etapa_origen ?? null,
              etapa_destino: item.etapa_destino ?? null,
              nombre: item.nombre ?? '',
              condicion: item.condicion ?? '',
              accion_automatica: item.accion_automatica ?? '',
              orden: item.orden ?? 0,
            }
          : ESTADO_INICIAL
      );
      setValidationError('');
    }
  }, [visible, item]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!formData.etapa_origen || !formData.etapa_destino) {
      setValidationError('Las etapas de origen y destino son obligatorias.');
      return false;
    }
    if (!formData.nombre.trim()) {
      setValidationError('El nombre descriptivo de la transición es obligatorio.');
      return false;
    }
    if (formData.orden == null || formData.orden < 0) {
      setValidationError('El orden debe ser un entero no negativo.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const payload = {
      etapa_origen: formData.etapa_origen,
      etapa_destino: formData.etapa_destino,
      nombre: formData.nombre,
      condicion: formData.condicion || null,
      accion_automatica: formData.accion_automatica || null,
      orden: formData.orden,
    };
    const accion = esEdicion
      ? actualizarTransicionFlujo({ id: item.id, payload })
      : crearTransicionFlujo(payload);
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
        label={esEdicion ? 'Guardar Cambios' : 'Crear Transición'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Transición de Flujo' : 'Nueva Transición de Flujo'}
      visible={visible}
      style={{ width: '40vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="etapa_origen">ID Etapa Origen *</label>
            <InputNumber inputId="etapa_origen" value={formData.etapa_origen} onValueChange={(e) => handleChange('etapa_origen', e.value)} useGrouping={false} />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="etapa_destino">ID Etapa Destino *</label>
            <InputNumber inputId="etapa_destino" value={formData.etapa_destino} onValueChange={(e) => handleChange('etapa_destino', e.value)} useGrouping={false} />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="orden">Orden de Evaluación *</label>
            <InputNumber inputId="orden" value={formData.orden} onValueChange={(e) => handleChange('orden', e.value)} min={0} useGrouping={false} />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="nombre">Nombre Descriptivo *</label>
          <InputText id="nombre" value={formData.nombre} maxLength={100} placeholder="Ej: 'Aprobación de propuesta'" onChange={(e) => handleChange('nombre', e.target.value)} />
        </div>
        <div className="field mb-3">
          <label htmlFor="condicion">Condición (opcional)</label>
          <InputTextarea
            id="condicion"
            value={formData.condicion}
            rows={2}
            placeholder="Ej: 'ReglaFlujo.id=1 AND ProcesoFormativo.nota >= 3.5'"
            onChange={(e) => handleChange('condicion', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="accion_automatica">Acción Automática (opcional)</label>
          <InputText
            id="accion_automatica"
            value={formData.accion_automatica}
            maxLength={100}
            placeholder="Ej: 'ENVIAR_EMAIL', 'CAMBIAR_ESTADO_PROYECTO_FORMAL'"
            onChange={(e) => handleChange('accion_automatica', e.target.value)}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default TransicionFlujoFormModal;