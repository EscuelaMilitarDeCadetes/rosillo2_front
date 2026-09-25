// src/domains/formativa/components/reglaFlujo/ReglaFlujoFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { crearReglaFlujo, actualizarReglaFlujo } from '../../../../features/reglaFlujo/reglaFlujoSlice';

const TIPOS_REGLA = [
  { label: 'Nota Mínima de Aprobación', value: 'NOTA_MINIMA' },
  { label: 'Porcentaje Máximo de Antiplagio', value: 'PORCENTAJE_ANTIPLAGIO_MAX' },
  { label: 'Horas Mínimas Cumplidas', value: 'HORAS_MINIMAS' },
  { label: 'Promedio Académico Mínimo', value: 'PROMEDIO_MINIMO' },
  { label: 'Producto CTeI Requerido', value: 'PRODUCTO_CTEI_REQUERIDO' },
  { label: 'Participación en Evento Científico', value: 'EVENTO_CIENTIFICO_REQUERIDO' },
  { label: 'Tiempo Máximo para Etapa', value: 'TIEMPO_MAXIMO_ETAPA' },
  { label: 'Otro', value: 'OTRO' },
];

const OPERADORES = [
  { label: '>', value: 'GT' },
  { label: '<', value: 'LT' },
  { label: '=', value: 'EQ' },
  { label: '>=', value: 'GTE' },
  { label: '<=', value: 'LTE' },
  { label: '!=', value: 'NE' },
];

const ESTADO_INICIAL = {
  etapa_origen: null,
  etapa_destino: null,
  nombre: '',
  operador: null,
  tipo_regla: null,
  valor_minimo: null,
  valor_maximo: null,
  mensaje_error: '',
  accion_resultado: '',
  descripcion: '',
  fecha_inicio: null,
  fecha_fin: null,
  bloqueante: false,
  prioridad: 1,
};

const aFecha = (valor) => (valor ? new Date(valor) : null);
const aISO = (fecha) => (fecha ? fecha.toISOString().slice(0, 10) : null);

/**
 * Modal de alta/edición para ReglaFlujo. `item` = null significa creación;
 * un objeto significa edición (PUT). No existe un selector de EtapaFlujo en
 * el proyecto, así que etapa_origen/etapa_destino se capturan por ID.
 */
const ReglaFlujoFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.reglaFlujo);
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
              operador: item.operador ?? null,
              tipo_regla: item.tipo_regla ?? null,
              valor_minimo: item.valor_minimo ?? null,
              valor_maximo: item.valor_maximo ?? null,
              mensaje_error: item.mensaje_error ?? '',
              accion_resultado: item.accion_resultado ?? '',
              descripcion: item.descripcion ?? '',
              fecha_inicio: aFecha(item.fecha_inicio),
              fecha_fin: aFecha(item.fecha_fin),
              bloqueante: item.bloqueante ?? false,
              prioridad: item.prioridad ?? 1,
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
      setValidationError('El nombre de la regla es obligatorio.');
      return false;
    }
    if (!formData.operador) {
      setValidationError('El operador de comparación es obligatorio.');
      return false;
    }
    if (!formData.tipo_regla) {
      setValidationError('El tipo de regla es obligatorio.');
      return false;
    }
    if (formData.valor_minimo == null || formData.valor_maximo == null) {
      setValidationError('El valor mínimo y el valor máximo son obligatorios.');
      return false;
    }
    if (formData.valor_maximo < formData.valor_minimo) {
      setValidationError('El valor máximo no puede ser menor que el valor mínimo.');
      return false;
    }
    if (!formData.mensaje_error.trim()) {
      setValidationError('El mensaje de error a mostrar es obligatorio.');
      return false;
    }
    if (!formData.accion_resultado.trim()) {
      setValidationError('La acción resultado es obligatoria.');
      return false;
    }
    if (!formData.descripcion.trim()) {
      setValidationError('La descripción de la regla es obligatoria.');
      return false;
    }
    if (!formData.fecha_inicio) {
      setValidationError('La fecha de inicio de vigencia es obligatoria.');
      return false;
    }
    if (formData.fecha_fin && formData.fecha_fin < formData.fecha_inicio) {
      setValidationError('La fecha de fin de vigencia no puede ser anterior a la de inicio.');
      return false;
    }
    if (!formData.prioridad || formData.prioridad < 1) {
      setValidationError('La prioridad debe ser un entero mayor o igual a 1.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const payload = {
      ...formData,
      fecha_inicio: aISO(formData.fecha_inicio),
      fecha_fin: aISO(formData.fecha_fin),
    };
    const accion = esEdicion
      ? actualizarReglaFlujo({ id: item.id, payload })
      : crearReglaFlujo(payload);
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
        label={esEdicion ? 'Guardar Cambios' : 'Crear Regla'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Regla de Flujo' : 'Nueva Regla de Flujo'}
      visible={visible}
      style={{ width: '50vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="etapa_origen">ID Etapa Origen *</label>
            <InputNumber
              inputId="etapa_origen"
              value={formData.etapa_origen}
              onValueChange={(e) => handleChange('etapa_origen', e.value)}
              useGrouping={false}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="etapa_destino">ID Etapa Destino *</label>
            <InputNumber
              inputId="etapa_destino"
              value={formData.etapa_destino}
              onValueChange={(e) => handleChange('etapa_destino', e.value)}
              useGrouping={false}
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="nombre">Nombre *</label>
          <InputText
            id="nombre"
            value={formData.nombre}
            maxLength={150}
            onChange={(e) => handleChange('nombre', e.target.value)}
          />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="tipo_regla">Tipo de Regla *</label>
            <Dropdown
              inputId="tipo_regla"
              value={formData.tipo_regla}
              options={TIPOS_REGLA}
              onChange={(e) => handleChange('tipo_regla', e.value)}
              placeholder="Seleccione"
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="operador">Operador *</label>
            <Dropdown
              inputId="operador"
              value={formData.operador}
              options={OPERADORES}
              onChange={(e) => handleChange('operador', e.value)}
              placeholder="Seleccione"
            />
          </div>
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="valor_minimo">Valor Mínimo *</label>
            <InputNumber
              inputId="valor_minimo"
              value={formData.valor_minimo}
              onValueChange={(e) => handleChange('valor_minimo', e.value)}
              mode="decimal"
              minFractionDigits={1}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="valor_maximo">Valor Máximo *</label>
            <InputNumber
              inputId="valor_maximo"
              value={formData.valor_maximo}
              onValueChange={(e) => handleChange('valor_maximo', e.value)}
              mode="decimal"
              minFractionDigits={1}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="prioridad">Prioridad *</label>
            <InputNumber
              inputId="prioridad"
              value={formData.prioridad}
              onValueChange={(e) => handleChange('prioridad', e.value)}
              min={1}
              useGrouping={false}
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="mensaje_error">Mensaje de Error *</label>
          <InputText
            id="mensaje_error"
            value={formData.mensaje_error}
            maxLength={200}
            placeholder="Mensaje mostrado al usuario si la regla no se cumple"
            onChange={(e) => handleChange('mensaje_error', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="accion_resultado">Acción Resultado *</label>
          <InputText
            id="accion_resultado"
            value={formData.accion_resultado}
            maxLength={50}
            placeholder="Ej: 'BLOQUEAR_AVANCE', 'NOTIFICAR_COORDINADOR'"
            onChange={(e) => handleChange('accion_resultado', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="descripcion">Descripción *</label>
          <InputTextarea
            id="descripcion"
            value={formData.descripcion}
            rows={2}
            onChange={(e) => handleChange('descripcion', e.target.value)}
          />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="fecha_inicio">Vigencia Desde *</label>
            <Calendar
              inputId="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={(e) => handleChange('fecha_inicio', e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="fecha_fin">Vigencia Hasta</label>
            <Calendar
              inputId="fecha_fin"
              value={formData.fecha_fin}
              onChange={(e) => handleChange('fecha_fin', e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
          <div className="field mb-3 col-fixed flex align-items-end" style={{ width: '10rem' }}>
            <div className="flex align-items-center gap-2">
              <Checkbox
                inputId="bloqueante"
                checked={formData.bloqueante}
                onChange={(e) => handleChange('bloqueante', e.checked)}
              />
              <label htmlFor="bloqueante">Bloqueante</label>
            </div>
          </div>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default ReglaFlujoFormModal;