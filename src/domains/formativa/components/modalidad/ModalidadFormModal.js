// src/domains/formativa/components/modalidad/ModalidadFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { crearModalidad, actualizarModalidad } from '../../../../features/modalidad/modalidadSlice';

// requiere_tutor / requiere_antiplagio / requiere_sustentacion / permite_homologacion /
// requiere_producto_final son BooleanField(null=True): tres estados posibles.
const OPCIONES_TRIESTADO = [
  { label: 'Sin definir', value: null },
  { label: 'Sí', value: true },
  { label: 'No', value: false },
];

const ESTADO_INICIAL = {
  nombre: '',
  codigo: '',
  descripcion: '',
  requiere_evaluadores: false,
  requiere_tutor: null,
  requiere_antiplagio: null,
  requiere_sustentacion: null,
  cantidad_maxima_estudiantes: null,
  cantidad_minima_evaluadores: null,
  permite_homologacion: null,
  requiere_producto_final: null,
};

const ModalidadFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.modalidad);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      setFormData(
        item
          ? {
              nombre: item.nombre ?? '',
              codigo: item.codigo ?? '',
              descripcion: item.descripcion ?? '',
              requiere_evaluadores: item.requiere_evaluadores ?? false,
              requiere_tutor: item.requiere_tutor ?? null,
              requiere_antiplagio: item.requiere_antiplagio ?? null,
              requiere_sustentacion: item.requiere_sustentacion ?? null,
              cantidad_maxima_estudiantes: item.cantidad_maxima_estudiantes ?? null,
              cantidad_minima_evaluadores: item.cantidad_minima_evaluadores ?? null,
              permite_homologacion: item.permite_homologacion ?? null,
              requiere_producto_final: item.requiere_producto_final ?? null,
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
    if (!formData.nombre.trim()) {
      setValidationError('El nombre de la modalidad es obligatorio.');
      return false;
    }
    if (!formData.codigo.trim()) {
      setValidationError('El código de la modalidad es obligatorio.');
      return false;
    }
    if (formData.cantidad_maxima_estudiantes != null && formData.cantidad_maxima_estudiantes < 1) {
      setValidationError('La cantidad máxima de estudiantes debe ser al menos 1.');
      return false;
    }
    if (formData.cantidad_minima_evaluadores != null && formData.cantidad_minima_evaluadores < 1) {
      setValidationError('La cantidad mínima de evaluadores debe ser al menos 1.');
      return false;
    }
    if (formData.requiere_evaluadores && !formData.cantidad_minima_evaluadores) {
      setValidationError('Debe indicar la cantidad mínima de evaluadores para esta modalidad.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const payload = { ...formData, descripcion: formData.descripcion || null };
    const accion = esEdicion
      ? actualizarModalidad({ id: item.id, payload })
      : crearModalidad(payload);
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
        label={esEdicion ? 'Guardar Cambios' : 'Crear Modalidad'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Modalidad' : 'Nueva Modalidad'}
      visible={visible}
      style={{ width: '45vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="nombre">Nombre *</label>
            <InputText
              id="nombre"
              value={formData.nombre}
              maxLength={150}
              placeholder="Ej: 'Trabajo de Grado Pregrado'"
              onChange={(e) => handleChange('nombre', e.target.value)}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="codigo">Código *</label>
            <InputText
              id="codigo"
              value={formData.codigo}
              maxLength={100}
              onChange={(e) => handleChange('codigo', e.target.value)}
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="descripcion">Descripción</label>
          <InputTextarea
            id="descripcion"
            value={formData.descripcion}
            rows={2}
            onChange={(e) => handleChange('descripcion', e.target.value)}
          />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="cantidad_maxima_estudiantes">Cant. Máxima Estudiantes</label>
            <InputNumber
              inputId="cantidad_maxima_estudiantes"
              value={formData.cantidad_maxima_estudiantes}
              onValueChange={(e) => handleChange('cantidad_maxima_estudiantes', e.value)}
              min={1}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="cantidad_minima_evaluadores">
              Cant. Mínima Evaluadores {formData.requiere_evaluadores && '*'}
            </label>
            <InputNumber
              inputId="cantidad_minima_evaluadores"
              value={formData.cantidad_minima_evaluadores}
              onValueChange={(e) => handleChange('cantidad_minima_evaluadores', e.value)}
              min={1}
              useGrouping={false}
            />
          </div>
          <div className="field mb-3 col-fixed flex align-items-end" style={{ width: '13rem' }}>
            <div className="flex align-items-center gap-2">
              <Checkbox
                inputId="requiere_evaluadores"
                checked={formData.requiere_evaluadores}
                onChange={(e) => handleChange('requiere_evaluadores', e.checked)}
              />
              <label htmlFor="requiere_evaluadores">Requiere evaluadores</label>
            </div>
          </div>
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="requiere_tutor">Requiere Tutor</label>
            <Dropdown
              inputId="requiere_tutor"
              value={formData.requiere_tutor}
              options={OPCIONES_TRIESTADO}
              onChange={(e) => handleChange('requiere_tutor', e.value)}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="requiere_antiplagio">Requiere Antiplagio</label>
            <Dropdown
              inputId="requiere_antiplagio"
              value={formData.requiere_antiplagio}
              options={OPCIONES_TRIESTADO}
              onChange={(e) => handleChange('requiere_antiplagio', e.value)}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="requiere_sustentacion">Requiere Sustentación</label>
            <Dropdown
              inputId="requiere_sustentacion"
              value={formData.requiere_sustentacion}
              options={OPCIONES_TRIESTADO}
              onChange={(e) => handleChange('requiere_sustentacion', e.value)}
            />
          </div>
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="permite_homologacion">Permite Homologación</label>
            <Dropdown
              inputId="permite_homologacion"
              value={formData.permite_homologacion}
              options={OPCIONES_TRIESTADO}
              onChange={(e) => handleChange('permite_homologacion', e.value)}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="requiere_producto_final">Requiere Producto Final</label>
            <Dropdown
              inputId="requiere_producto_final"
              value={formData.requiere_producto_final}
              options={OPCIONES_TRIESTADO}
              onChange={(e) => handleChange('requiere_producto_final', e.value)}
            />
          </div>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default ModalidadFormModal;