// src/domains/formativa/components/registroActividades/RegistroActividadesFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  crearRegistroActividades,
  actualizarRegistroActividades,
} from '../../../../features/registroActividades/registroActividadesSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';
import UsuarioAutoComplete from '../../../usuarios/components/usuarioAdmin/UsuarioAutoComplete';

const TIPOS_PERIODO = [
  { label: 'Mensual', value: 'MENSUAL' },
  { label: 'Semestral', value: 'SEMESTRAL' },
  { label: 'Registro Puntual', value: 'PUNTUAL' },
];

const TIPOS_QUE_REQUIEREN_FECHA = ['MENSUAL', 'SEMESTRAL'];

const ESTADO_INICIAL = {
  proceso: null,
  registrado_por: null,
  tipo_periodo: null,
  fecha_periodo: null,
  actividades: '',
  horas_reportadas: 0,
  documento: null,
  nota: null,
};

const aFecha = (valor) => (valor ? new Date(valor) : null);
const aISO = (fecha) => (fecha ? fecha.toISOString().slice(0, 10) : null);

/**
 * Modal de alta/edición para RegistroActividades. `item` = null significa
 * creación; un objeto significa edición (PUT). Un registro ya `aprobado` no
 * es editable (validar_editable) — el botón de editar en la tabla ya filtra
 * esa condición. proceso/registrado_por son inmutables tras la creación.
 */
const RegistroActividadesFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.registroActividades);
  const { items: procesos } = useSelector((state) => state.procesosInvFormativa);
  const [registradoPorSeleccionado, setRegistradoPorSeleccionado] = useState(null);
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
              registrado_por: item.registrado_por ?? null,
              tipo_periodo: item.tipo_periodo ?? null,
              fecha_periodo: aFecha(item.fecha_periodo),
              actividades: item.actividades ?? '',
              horas_reportadas: item.horas_reportadas ?? 0,
              documento: item.documento ?? null,
              nota: item.nota ?? null,
            }
          : ESTADO_INICIAL
      );
      setRegistradoPorSeleccionado(null);
      setValidationError('');
    }
  }, [visible, item, dispatch]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegistradoPorChange = (usuario) => {
    setRegistradoPorSeleccionado(usuario);
    handleChange('registrado_por', usuario ? usuario.id : null);
  };

  const requiereFechaPeriodo = TIPOS_QUE_REQUIEREN_FECHA.includes(formData.tipo_periodo);

  const validar = () => {
    if (!esEdicion && !formData.proceso) {
      setValidationError('El proceso formativo es obligatorio.');
      return false;
    }
    if (!esEdicion && !formData.registrado_por) {
      setValidationError('El usuario que registra la actividad es obligatorio.');
      return false;
    }
    if (!formData.tipo_periodo) {
      setValidationError('El tipo de período es obligatorio.');
      return false;
    }
    if (requiereFechaPeriodo && !formData.fecha_periodo) {
      setValidationError(`La fecha del período es obligatoria para registros de tipo '${formData.tipo_periodo}'.`);
      return false;
    }
    if (!formData.actividades.trim()) {
      setValidationError('La descripción de las actividades realizadas es obligatoria.');
      return false;
    }
    if (formData.horas_reportadas == null || formData.horas_reportadas < 0) {
      setValidationError('Las horas reportadas no pueden ser negativas.');
      return false;
    }
    if (formData.nota != null && (formData.nota < 0 || formData.nota > 5)) {
      setValidationError('La nota debe estar entre 0.0 y 5.0.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const payloadComun = {
      tipo_periodo: formData.tipo_periodo,
      actividades: formData.actividades,
      horas_reportadas: formData.horas_reportadas,
      fecha_periodo: aISO(formData.fecha_periodo),
      documento: formData.documento,
      nota: formData.nota,
    };
    const accion = esEdicion
      ? actualizarRegistroActividades({ id: item.id, payload: payloadComun })
      : crearRegistroActividades({
          ...payloadComun,
          proceso: formData.proceso,
          registrado_por: formData.registrado_por,
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
      header={esEdicion ? 'Editar Registro de Actividades' : 'Nuevo Registro de Actividades'}
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
        <div className="field mb-3">
          <label htmlFor="registrado_por">Registrado Por *</label>
          {esEdicion ? (
            <span className="p-inputtext p-disabled">{item.registrado_por_username || 'N/A'}</span>
          ) : (
            <UsuarioAutoComplete
              value={registradoPorSeleccionado}
              onChange={handleRegistradoPorChange}
              placeholder="Buscar usuario (usualmente el propio estudiante)..."
            />
          )}
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="tipo_periodo">Tipo de Período *</label>
            <Dropdown
              inputId="tipo_periodo"
              value={formData.tipo_periodo}
              options={TIPOS_PERIODO}
              onChange={(e) => handleChange('tipo_periodo', e.value)}
              placeholder="Seleccione"
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="fecha_periodo">
              Fecha del Período {requiereFechaPeriodo && '*'}
            </label>
            <Calendar
              inputId="fecha_periodo"
              value={formData.fecha_periodo}
              onChange={(e) => handleChange('fecha_periodo', e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="actividades">Actividades Realizadas *</label>
          <InputTextarea
            id="actividades"
            value={formData.actividades}
            rows={4}
            onChange={(e) => handleChange('actividades', e.target.value)}
          />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="horas_reportadas">Horas Reportadas *</label>
            <InputNumber
              inputId="horas_reportadas"
              value={formData.horas_reportadas}
              onValueChange={(e) => handleChange('horas_reportadas', e.value)}
              min={0}
              mode="decimal"
              minFractionDigits={1}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="nota">Nota (opcional, 0 - 5)</label>
            <InputNumber
              inputId="nota"
              value={formData.nota}
              onValueChange={(e) => handleChange('nota', e.value)}
              min={0}
              max={5}
              mode="decimal"
              minFractionDigits={1}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="documento">ID Documento Firmado (opcional)</label>
            <InputNumber
              inputId="documento"
              value={formData.documento}
              onValueChange={(e) => handleChange('documento', e.value)}
              useGrouping={false}
            />
          </div>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default RegistroActividadesFormModal;