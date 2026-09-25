// src/domains/formativa/components/participanteProceso/ParticipanteProcesoFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  crearParticipanteProceso,
  actualizarParticipanteProceso,
} from '../../../../features/participanteProceso/participanteProcesoSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';
import UsuarioAutoComplete from '../../../usuarios/components/usuarioAdmin/UsuarioAutoComplete';
import PersonaAutoComplete from '../../../institucional/components/personas/PersonaAutoComplete';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const ROLES_PARTICIPANTE = [
  { label: 'Estudiante', value: 'ESTUDIANTE' },
  { label: 'Tutor', value: 'TUTOR' },
  { label: 'Jurado', value: 'JURADO' },
  { label: 'Investigador Principal', value: 'INVESTIGADOR_PRINCIPAL' },
  { label: 'Coordinador', value: 'COORDINADOR' },
  { label: 'Otro', value: 'OTRO' },
];

const ESTADO_INICIAL = {
  proceso_formativo: null,
  persona: null,
  rol_en_modalidad: null,
  fecha_finalizacion: null,
  usuario_revisor: null,
};

const aFecha = (valor) => (valor ? new Date(valor) : null);
const aISO = (fecha) => (fecha ? fecha.toISOString().slice(0, 10) : null);

/**
 * Modal de alta/edición para ParticipanteProceso, un objeto significa edición. 
 * proceso_formativo y persona son inmutables tras la creación, así que en 
 * edición se muestran de solo lectura.
 *
 * La persona se elige con PersonaAutoComplete. En edición, el nombre ya 
 * viene resuelto por el backend, así que no hace falta cargar ninguna 
 * lista para mostrarlo de solo lectura.
 */
const ParticipanteProcesoFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.participanteProceso);
  const { items: procesos } = useSelector((state) => state.procesosInvFormativa);
  const [usuarioRevisorSeleccionado, setUsuarioRevisorSeleccionado] = useState(null);
  const { roles } = useSelector((state) => state.auth);
  const esFacultad = (roles || []).includes('FACULTAD');
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
              persona: item.persona ?? null,
              rol_en_modalidad: item.rol_en_modalidad ?? null,
              fecha_finalizacion: aFecha(item.fecha_finalizacion),
              usuario_revisor: null,
            }
          : ESTADO_INICIAL
      );
      setPersonaSeleccionada(null);
      setUsuarioRevisorSeleccionado(null);
      setValidationError('');
    }
  }, [visible, item, dispatch]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonaChange = (persona) => {
    setPersonaSeleccionada(persona);
    handleChange('persona', persona ? persona.id : null);
  };

  const handleUsuarioRevisorChange = (usuario) => {
    setUsuarioRevisorSeleccionado(usuario);
    handleChange('usuario_revisor', usuario ? usuario.id : null);
  };

  const validar = () => {
    if (!esEdicion && !formData.proceso_formativo) {
      setValidationError('El proceso formativo es obligatorio.');
      return false;
    }
    if (!esEdicion && !formData.persona) {
      setValidationError('La persona es obligatoria.');
      return false;
    }
    if (!formData.rol_en_modalidad) {
      setValidationError('El rol del participante es obligatorio.');
      return false;
    }
    if (!esEdicion && esFacultad && !formData.usuario_revisor) {          // NUEVO
      setValidationError('Como Facultad, debe seleccionar un revisor (Decano) para este participante.');
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
      rol_en_modalidad: formData.rol_en_modalidad,
      fecha_finalizacion: aISO(formData.fecha_finalizacion),
    };
    const accion = esEdicion
      ? actualizarParticipanteProceso({ id: item.id, payload: payloadComun })
      : crearParticipanteProceso({
          ...payloadComun,
          proceso_formativo: formData.proceso_formativo,
          persona: formData.persona,
          usuario_revisor: formData.usuario_revisor || undefined,
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
        label={esEdicion ? 'Guardar Cambios' : 'Vincular'}
        icon="pi pi-check"
        onClick={handleShowConfirmation}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Participación' : 'Nuevo Participante'}
      visible={visible}
      style={{ width: '40vw' }}
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
          <label htmlFor="persona">Persona *</label>
          {esEdicion ? (
            <InputText value={item?.persona_nombre_completo || 'N/A'} disabled />
          ) : (
            <PersonaAutoComplete
              value={personaSeleccionada}
              onChange={handlePersonaChange}
              placeholder="Buscar persona por nombre, apellido o documento..."
            />
          )}
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="rol_en_modalidad">Rol *</label>
            <Dropdown
              inputId="rol_en_modalidad"
              value={formData.rol_en_modalidad}
              options={ROLES_PARTICIPANTE}
              onChange={(e) => handleChange('rol_en_modalidad', e.value)}
              placeholder="Seleccione el rol"
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="fecha_finalizacion">Fecha de Finalización</label>
            <Calendar
              inputId="fecha_finalizacion"
              value={formData.fecha_finalizacion}
              onChange={(e) => handleChange('fecha_finalizacion', e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
        </div>
        {!esEdicion && (
          <div className="field mb-3">
            <label htmlFor="usuario_revisor">
              Revisor (Decano) {esFacultad ? '*' : ''}
            </label>
            <UsuarioAutoComplete
              value={usuarioRevisorSeleccionado}
              onChange={handleUsuarioRevisorChange}
              placeholder={esFacultad ? 'Buscar revisor...' : 'Buscar revisor (opcional)...'}
            />
            {esFacultad && (
              <small className="text-muted">
                Registras esta vinculación como Facultad: el backend exige un revisor.
              </small>
            )}
          </div>
        )}
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
          <li>
            <strong>Rol:</strong>{' '}
            {ROLES_PARTICIPANTE.find((r) => r.value === formData.rol_en_modalidad)?.label || 'N/A'}
          </li>
          <li>
            <strong>Fecha de finalización:</strong> {aISO(formData.fecha_finalizacion) || 'N/A'}
          </li>
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default ParticipanteProcesoFormModal;