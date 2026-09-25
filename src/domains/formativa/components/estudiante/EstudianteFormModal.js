// src/domains/formativa/components/estudiante/EstudianteFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { crearEstudiante, actualizarEstudiante } from '../../../../features/estudiante/estudianteSlice';
import { fetchCatalogo } from '../../../../features/catalogos/catalogosSlice';
import { fetchModalidadesPorFacultad } from '../../../../features/modalidadXFacultad/modalidadXFacultadSlice';
import PersonaAutoComplete from '../../../institucional/components/personas/PersonaAutoComplete';

const ESTADO_INICIAL = {
  persona: null,
  facultad: null, // solo filtro de cliente para acotar modalidad_facultad; no viaja en el payload
  modalidad_facultad: null,
  correo_personal: '',
  nivel: '',
};

const etiquetaModalidadFacultad = (v) => `${v.modalidad_nombre} — ${v.facultad_nombre}`;

/**
 * Modal de alta/edición para Estudiante. persona/modalidad_facultad son
 * inmutables tras la creación.
 *
 * persona usa PersonaAutoComplete. En edición, el nombre ya
 * viene resuelto por el backend.
 *
 * En modalidad_facultad se elige una Facultad primero y eso acota.
 */
const EstudianteFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.estudiante);
  const { items: facultades } = useSelector((state) => state.catalogos.facultad_escuela);
  const { items: modalidadesFacultad, loading: cargandoModalidadesFacultad } = useSelector(
    (state) => state.modalidadXFacultad
  );
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [validationError, setValidationError] = useState('');
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      if (!esEdicion) {
        dispatch(fetchCatalogo({ catalogKey: 'facultad_escuela', pageSize: 100 }));
      }
      setFormData(
        item
          ? {
              persona: item.persona ?? null,
              facultad: null,
              modalidad_facultad: item.modalidad_facultad ?? null,
              correo_personal: item.correo_personal ?? '',
              nivel: item.nivel ?? '',
            }
          : ESTADO_INICIAL
      );
      setPersonaSeleccionada(null);
      setValidationError('');
    }
  }, [visible, item, esEdicion, dispatch]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonaChange = (persona) => {
    setPersonaSeleccionada(persona);
    handleChange('persona', persona ? persona.id : null);
  };

  const handleFacultadChange = (facultadId) => {
    setFormData((prev) => ({ ...prev, facultad: facultadId, modalidad_facultad: null }));
    if (facultadId) {
      dispatch(fetchModalidadesPorFacultad({ facultadId, disponible: true }));
    }
  };

  const validar = () => {
    if (!esEdicion && !formData.persona) {
      setValidationError('La persona es obligatoria.');
      return false;
    }
    if (!esEdicion && !formData.facultad) {
      setValidationError('Seleccione primero la facultad.');
      return false;
    }
    if (!esEdicion && !formData.modalidad_facultad) {
      setValidationError('La modalidad-facultad es obligatoria.');
      return false;
    }
    if (!formData.correo_personal.trim()) {
      setValidationError('El correo personal es obligatorio.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo_personal)) {
      setValidationError('El correo personal no tiene un formato válido.');
      return false;
    }
    if (!formData.nivel.trim()) {
      setValidationError('El nivel del estudiante es obligatorio.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const payloadComun = { correo_personal: formData.correo_personal, nivel: formData.nivel };
    const accion = esEdicion
      ? actualizarEstudiante({ id: item.id, payload: payloadComun })
      : crearEstudiante({
          ...payloadComun,
          persona: formData.persona,
          modalidad_facultad: formData.modalidad_facultad,
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
      header={esEdicion ? 'Editar Estudiante' : 'Nuevo Estudiante'}
      visible={visible}
      style={{ width: '40vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
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
        {esEdicion ? (
          <div className="field mb-3">
            <label htmlFor="modalidad_facultad">Modalidad — Facultad *</label>
            <InputText
              value={item?.modalidad_facultad_nombre || `ID ${formData.modalidad_facultad}`}
              disabled
            />
          </div>
        ) : (
          <div className="formgrid grid">
            <div className="field mb-3 col">
              <label htmlFor="facultad">Facultad *</label>
              <Dropdown
                inputId="facultad"
                value={formData.facultad}
                options={facultades}
                optionLabel="nombre"
                optionValue="id"
                filter
                onChange={(e) => handleFacultadChange(e.value)}
                placeholder="Seleccione la facultad"
              />
            </div>
            <div className="field mb-3 col">
              <label htmlFor="modalidad_facultad">Modalidad *</label>
              <Dropdown
                inputId="modalidad_facultad"
                value={formData.modalidad_facultad}
                options={modalidadesFacultad}
                optionLabel={etiquetaModalidadFacultad}
                optionValue="id"
                filter
                loading={cargandoModalidadesFacultad}
                disabled={!formData.facultad}
                onChange={(e) => handleChange('modalidad_facultad', e.value)}
                placeholder={
                  formData.facultad ? 'Seleccione la modalidad' : 'Seleccione primero la facultad'
                }
                emptyMessage="Esta facultad no tiene modalidades disponibles."
              />
            </div>
          </div>
        )}
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="correo_personal">Correo Personal *</label>
            <InputText
              id="correo_personal"
              value={formData.correo_personal}
              maxLength={150}
              onChange={(e) => handleChange('correo_personal', e.target.value)}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="nivel">Nivel *</label>
            <InputText
              id="nivel"
              value={formData.nivel}
              maxLength={50}
              placeholder="Ej: 'Pregrado', 'Maestría'"
              onChange={(e) => handleChange('nivel', e.target.value)}
            />
          </div>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default EstudianteFormModal;