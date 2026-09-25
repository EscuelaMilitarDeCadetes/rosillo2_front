// src/domains/formativa/components/certificacionExterna/CertificacionExternaFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  crearCertificacionExterna,
  actualizarCertificacionExterna,
} from '../../../../features/certificacionExterna/certificacionExternaSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';

const TIPOS_CERTIFICACION = [
  { label: 'Minor', value: 'MINOR' },
  { label: 'Diplomado de Profundización', value: 'DIPLOMADO' },
  { label: 'Cátedra Internacional', value: 'CATEDRA_INTERNACIONAL' },
  { label: 'Otro', value: 'OTRO' },
];

const ESTADO_INICIAL = {
  proceso: null,
  tipo: null,
  nombre_programa: '',
  institucion: '',
  horas_certificadas: null,
  fecha_inicio: null,
  fecha_fin: null,
  certificado_asistencia: null,
};

const aFecha = (valor) => (valor ? new Date(valor) : null);
const aISO = (fecha) => (fecha ? fecha.toISOString().slice(0, 10) : null);

/**
 * Modal de alta/edición para CertificacionExterna. `item` = null significa
 * creación; un objeto significa edición (PUT). Una certificación con
 * fecha_validacion ya asignada no es editable (validar_actualizacion) — la
 * tabla ya filtra esa condición antes de abrir el modal en modo edición.
 * `proceso` es inmutable tras la creación.
 */
const CertificacionExternaFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.certificacionExterna);
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
              tipo: item.tipo ?? null,
              nombre_programa: item.nombre_programa ?? '',
              institucion: item.institucion ?? '',
              horas_certificadas: item.horas_certificadas ?? null,
              fecha_inicio: aFecha(item.fecha_inicio),
              fecha_fin: aFecha(item.fecha_fin),
              certificado_asistencia: null,
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
    if (!formData.tipo) {
      setValidationError('El tipo de certificación es obligatorio.');
      return false;
    }
    if (!formData.nombre_programa.trim()) {
      setValidationError('El nombre del programa es obligatorio.');
      return false;
    }
    if (!formData.institucion.trim()) {
      setValidationError('La institución certificadora es obligatoria.');
      return false;
    }
    if (!formData.horas_certificadas || formData.horas_certificadas <= 0) {
      setValidationError('Las horas certificadas deben ser mayores a 0.');
      return false;
    }
    if (!formData.fecha_inicio || !formData.fecha_fin) {
      setValidationError('Las fechas de inicio y fin son obligatorias.');
      return false;
    }
    if (formData.fecha_fin < formData.fecha_inicio) {
      setValidationError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const payloadComun = {
      tipo: formData.tipo,
      nombre_programa: formData.nombre_programa,
      institucion: formData.institucion,
      horas_certificadas: formData.horas_certificadas,
      fecha_inicio: aISO(formData.fecha_inicio),
      fecha_fin: aISO(formData.fecha_fin),
    };
    const accion = esEdicion
      ? actualizarCertificacionExterna({ id: item.id, payload: payloadComun })
      : crearCertificacionExterna({
          ...payloadComun,
          proceso: formData.proceso,
          certificado_asistencia: formData.certificado_asistencia,
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
        label={esEdicion ? 'Guardar Cambios' : 'Registrar'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Certificación Externa' : 'Nueva Certificación Externa'}
      visible={visible}
      style={{ width: '45vw' }}
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
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="tipo">Tipo *</label>
            <Dropdown
              inputId="tipo"
              value={formData.tipo}
              options={TIPOS_CERTIFICACION}
              onChange={(e) => handleChange('tipo', e.value)}
              placeholder="Seleccione"
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="horas_certificadas">Horas Certificadas *</label>
            <InputNumber
              inputId="horas_certificadas"
              value={formData.horas_certificadas}
              onValueChange={(e) => handleChange('horas_certificadas', e.value)}
              min={1}
              mode="decimal"
              minFractionDigits={1}
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="nombre_programa">Nombre del Programa *</label>
          <InputText
            id="nombre_programa"
            value={formData.nombre_programa}
            maxLength={255}
            onChange={(e) => handleChange('nombre_programa', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="institucion">Institución Certificadora *</label>
          <InputText
            id="institucion"
            value={formData.institucion}
            maxLength={200}
            onChange={(e) => handleChange('institucion', e.target.value)}
          />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="fecha_inicio">Fecha Inicio *</label>
            <Calendar
              inputId="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={(e) => handleChange('fecha_inicio', e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="fecha_fin">Fecha Fin *</label>
            <Calendar
              inputId="fecha_fin"
              value={formData.fecha_fin}
              onChange={(e) => handleChange('fecha_fin', e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
        </div>
        {!esEdicion && (
          <div className="field mb-3">
            <label htmlFor="certificado_asistencia">ID Certificado de Asistencia (opcional)</label>
            <InputNumber
              inputId="certificado_asistencia"
              value={formData.certificado_asistencia}
              onValueChange={(e) => handleChange('certificado_asistencia', e.value)}
              useGrouping={false}
            />
          </div>
        )}
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default CertificacionExternaFormModal;