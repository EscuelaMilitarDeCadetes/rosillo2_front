// src/domains/formativa/components/actividadFormativa/ActividadFormativaFormModal.js
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
  crearActividadFormativa,
  actualizarActividadFormativa,
} from '../../../../features/actividadFormativa/actividadFormativaSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';
import PersonaAutoComplete from '../../../institucional/components/personas/PersonaAutoComplete';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const ESTADO_INICIAL = {
  proceso_formativo: null,
  responsable: null,
  nombre: '',
  descripcion: '',
  fecha_inicio: null,
  fecha_fin: null,
  horas_dedicadas: null,
};

const aFecha = (valor) => (valor ? new Date(valor) : null);
const aISO = (fecha) => (fecha ? fecha.toISOString().slice(0, 10) : null);

/**
 * El backend congela proceso_formativo y responsable tras la creación,
 * así que en edición ambos se muestran de solo lectura.
 *
 * responsable se elige con PersonaAutoComplete, en vez de precargar
 * hasta 100 personas y filtrar en cliente. En edición, el nombre del
 * responsable ya viene resuelto por el backend en
 * item.responsable_nombre_completo, así que no hace falta ninguna
 * consulta adicional para mostrarlo de solo lectura.
 */
const ActividadFormativaFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.actividadFormativa);
  const { items: procesos } = useSelector((state) => state.procesosInvFormativa);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      dispatch(fetchProcesosActivos());
      setFormData(
        item
          ? {
              proceso_formativo: item.proceso_formativo ?? null,
              responsable: item.responsable ?? null,
              nombre: item.nombre ?? '',
              descripcion: item.descripcion ?? '',
              fecha_inicio: aFecha(item.fecha_inicio),
              fecha_fin: aFecha(item.fecha_fin),
              horas_dedicadas: item.horas_dedicadas ?? null,
            }
          : ESTADO_INICIAL
      );
      setPersonaSeleccionada(null);
      setValidationError('');
    }
  }, [visible, item, dispatch]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResponsableChange = (persona) => {
    setPersonaSeleccionada(persona);
    handleChange('responsable', persona ? persona.id : null);
  };

  const validar = () => {
    if (!esEdicion && !formData.proceso_formativo) {
      setValidationError('El proceso formativo es obligatorio.');
      return false;
    }
    if (!esEdicion && !formData.responsable) {
      setValidationError('El responsable de la actividad es obligatorio.');
      return false;
    }
    if (!formData.nombre.trim()) {
      setValidationError('El nombre de la actividad es obligatorio.');
      return false;
    }
    if (
      formData.fecha_inicio &&
      formData.fecha_fin &&
      formData.fecha_fin < formData.fecha_inicio
    ) {
      setValidationError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return false;
    }
    if (formData.horas_dedicadas != null && formData.horas_dedicadas < 0) {
      setValidationError('Las horas dedicadas no pueden ser negativas.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleShowConfirmation = () => {
    if (!validar()) return;
    setIsConfirmVisible(true);
  };

  const handleConfirm = () => {
    const payloadComun = {
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      fecha_inicio: aISO(formData.fecha_inicio),
      fecha_fin: aISO(formData.fecha_fin),
      horas_dedicadas: formData.horas_dedicadas,
    };
    const accion = esEdicion
      ? actualizarActividadFormativa({ id: item.id, payload: payloadComun })
      : crearActividadFormativa({
          ...payloadComun,
          proceso_formativo: formData.proceso_formativo,
          responsable: formData.responsable,
        });
    dispatch(accion).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const procesoLabel = (id) => procesos.find((p) => p.id === id)?.titulo || 'N/A';

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label={esEdicion ? 'Guardar Cambios' : 'Planificar'}
        icon="pi pi-check"
        onClick={handleShowConfirmation}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Actividad Formativa' : 'Nueva Actividad Formativa'}
      visible={visible}
      style={{ width: '45vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="proceso_formativo">Proceso Formativo *</label>
          {esEdicion ? (
            <InputText value={procesoLabel(formData.proceso_formativo)} disabled />
          ) : (
            <Dropdown
              inputId="proceso_formativo"
              value={formData.proceso_formativo}
              options={procesos}
              optionLabel="titulo"
              optionValue="id"
              filter
              onChange={(e) => handleChange('proceso_formativo', e.value)}
              placeholder="Seleccione el proceso formativo"
            />
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="responsable">Responsable *</label>
          {esEdicion ? (
            <InputText value={item?.responsable_nombre_completo || 'N/A'} disabled />
          ) : (
            <PersonaAutoComplete
              value={personaSeleccionada}
              onChange={handleResponsableChange}
              placeholder="Buscar responsable por nombre, apellido o documento..."
            />
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="nombre">Nombre *</label>
          <InputText
            id="nombre"
            value={formData.nombre}
            maxLength={255}
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
            <label htmlFor="fecha_inicio">Fecha Inicio</label>
            <Calendar
              inputId="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={(e) => handleChange('fecha_inicio', e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="fecha_fin">Fecha Fin</label>
            <Calendar
              inputId="fecha_fin"
              value={formData.fecha_fin}
              onChange={(e) => handleChange('fecha_fin', e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="horas_dedicadas">Horas Dedicadas</label>
          <InputNumber
            inputId="horas_dedicadas"
            value={formData.horas_dedicadas}
            onValueChange={(e) => handleChange('horas_dedicadas', e.value)}
            min={0}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirm}
        header="¿Deseas confirmar la acción?"
        loading={saving}
      >
        <h6>Resumen:</h6>
        <ul>
          <li><strong>Nombre:</strong> {formData.nombre || 'N/A'}</li>
          <li><strong>Fecha inicio:</strong> {aISO(formData.fecha_inicio) || 'N/A'}</li>
          <li><strong>Fecha fin:</strong> {aISO(formData.fecha_fin) || 'N/A'}</li>
          <li><strong>Horas dedicadas:</strong> {formData.horas_dedicadas ?? 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default ActividadFormativaFormModal;