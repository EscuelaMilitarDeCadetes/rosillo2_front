// src/domains/formativa/components/requisitoModalidad/RequisitoModalidadFormModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  crearRequisitoModalidad,
  actualizarRequisitoModalidad,
  fetchRequisitosPorModalidad,
} from '../../../../features/requisitoModalidad/requisitoModalidadSlice';
import { fetchModalidadesActivas } from '../../../../features/modalidad/modalidadSlice';

const TIPOS_REQUISITO = [
  { label: 'Promedio Académico Mínimo', value: 'PROMEDIO_MINIMO' },
  { label: 'Horas Mínimas Requeridas', value: 'HORAS_MINIMAS' },
  { label: 'Requiere Vínculo con Proyecto Formal', value: 'PROYECTO_FORMAL' },
  { label: 'Requiere Producto CTeI', value: 'PRODUCTO_CTEI' },
  { label: 'Requiere Participación en Evento', value: 'EVENTO_CIENTIFICO' },
  { label: 'Requiere Certificado Externo', value: 'CERTIFICADO_EXTERNO' },
  { label: 'Otro', value: 'OTRO' },
];

const TIPOS_CON_VALOR_NUMERICO = ['PROMEDIO_MINIMO', 'HORAS_MINIMAS'];
const TIPOS_CON_VALOR_BOOLEANO = ['PROYECTO_FORMAL', 'PRODUCTO_CTEI', 'EVENTO_CIENTIFICO', 'CERTIFICADO_EXTERNO'];

const ESTADO_INICIAL = { modalidad: null, tipo: null, descripcion: '', valor_numerico: null, valor_booleano: null };

/**
 * Modal de alta/edición para RequisitoModalidad. `modalidad` es inmutable
 * tras la creación.
 */
const RequisitoModalidadFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error, items: requisitosExistentes } = useSelector((state) => state.requisitoModalidad);
  const { items: modalidades } = useSelector((state) => state.modalidad);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      dispatch(fetchModalidadesActivas());
      setFormData(
        item
          ? {
              modalidad: item.modalidad ?? null,
              tipo: item.tipo ?? null,
              descripcion: item.descripcion ?? '',
              valor_numerico: item.valor_numerico ?? null,
              valor_booleano: item.valor_booleano ?? null,
            }
          : ESTADO_INICIAL
      );
      setValidationError('');
    }
  }, [visible, item, dispatch]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalidadChange = (modalidadId) => {
    setFormData((prev) => ({ ...prev, modalidad: modalidadId, tipo: null }));
    if (modalidadId) {
      dispatch(fetchRequisitosPorModalidad(modalidadId));
    }
  };

  const tiposDisponibles = useMemo(() => {
    if (esEdicion || !formData.modalidad) return TIPOS_REQUISITO;
    const tiposUsados = new Set(
      requisitosExistentes.filter((r) => r.modalidad === formData.modalidad).map((r) => r.tipo)
    );
    return TIPOS_REQUISITO.filter((t) => !tiposUsados.has(t.value));
  }, [esEdicion, formData.modalidad, requisitosExistentes]);

  const requiereNumerico = TIPOS_CON_VALOR_NUMERICO.includes(formData.tipo);
  const requiereBooleano = TIPOS_CON_VALOR_BOOLEANO.includes(formData.tipo);

  const validar = () => {
    if (!esEdicion && !formData.modalidad) {
      setValidationError('La modalidad es obligatoria.');
      return false;
    }
    if (!formData.tipo) {
      setValidationError('El tipo de requisito es obligatorio.');
      return false;
    }
    if (!formData.descripcion.trim()) {
      setValidationError('La descripción del requisito es obligatoria.');
      return false;
    }
    if (requiereNumerico && formData.valor_numerico == null) {
      setValidationError(`El requisito de tipo '${formData.tipo}' requiere un valor numérico.`);
      return false;
    }
    if (requiereBooleano && formData.valor_booleano == null) {
      setValidationError(`El requisito de tipo '${formData.tipo}' requiere un valor sí/no.`);
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const payloadComun = {
      tipo: formData.tipo,
      descripcion: formData.descripcion,
      valor_numerico: requiereNumerico ? formData.valor_numerico : null,
      valor_booleano: requiereBooleano ? formData.valor_booleano : null,
    };
    const accion = esEdicion
      ? actualizarRequisitoModalidad({ id: item.id, payload: payloadComun })
      : crearRequisitoModalidad({ ...payloadComun, modalidad: formData.modalidad });
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
        label={esEdicion ? 'Guardar Cambios' : 'Crear Requisito'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Requisito de Modalidad' : 'Nuevo Requisito de Modalidad'}
      visible={visible}
      style={{ width: '38vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="modalidad">Modalidad *</label>
          {esEdicion ? (
            <span className="p-inputtext p-disabled">{item.modalidad_nombre}</span>
          ) : (
            <Dropdown
              inputId="modalidad"
              value={formData.modalidad}
              options={modalidades}
              optionLabel="nombre"
              optionValue="id"
              filter
              onChange={(e) => handleModalidadChange(e.value)}
              placeholder="Seleccione la modalidad"
            />
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="tipo">Tipo de Requisito *</label>
          <Dropdown
            inputId="tipo"
            value={formData.tipo}
            options={esEdicion ? TIPOS_REQUISITO : tiposDisponibles}
            onChange={(e) => handleChange('tipo', e.value)}
            disabled={!esEdicion && !formData.modalidad}
            placeholder={
              !esEdicion && !formData.modalidad
                ? 'Seleccione primero la modalidad'
                : 'Seleccione'
            }
            emptyMessage="Esta modalidad ya tiene un requisito de cada tipo."
          />
          {!esEdicion && formData.modalidad && tiposDisponibles.length < TIPOS_REQUISITO.length && (
            <small className="text-muted">
              Se ocultan los tipos que ya tienen un requisito registrado para esta modalidad.
            </small>
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="descripcion">Descripción (según el reglamento) *</label>
          <InputTextarea id="descripcion" value={formData.descripcion} rows={3} onChange={(e) => handleChange('descripcion', e.target.value)} />
        </div>
        {requiereNumerico && (
          <div className="field mb-3">
            <label htmlFor="valor_numerico">Valor Numérico *</label>
            <InputNumber
              inputId="valor_numerico"
              value={formData.valor_numerico}
              onValueChange={(e) => handleChange('valor_numerico', e.value)}
              mode="decimal"
              minFractionDigits={1}
            />
          </div>
        )}
        {requiereBooleano && (
          <div className="field mb-3">
            <label htmlFor="valor_booleano">Valor (Sí/No) *</label>
            <Dropdown
              inputId="valor_booleano"
              value={formData.valor_booleano}
              options={[{ label: 'Sí', value: true }, { label: 'No', value: false }]}
              onChange={(e) => handleChange('valor_booleano', e.value)}
              placeholder="Seleccione"
            />
          </div>
        )}
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default RequisitoModalidadFormModal;