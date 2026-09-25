// src/domains/formativa/components/tutor/TutorFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { crearTutor, actualizarTutor } from '../../../../features/tutor/tutorSlice';
import { fetchCatalogo } from '../../../../features/catalogos/catalogosSlice';
import PersonaAutoComplete from '../../../institucional/components/personas/PersonaAutoComplete';

const ESTADO_INICIAL = { persona: null, facultad: null };


const TutorFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.tutor);
  const { items: facultades } = useSelector((state) => state.catalogos.facultad_escuela);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [validationError, setValidationError] = useState('');
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      dispatch(fetchCatalogo({ catalogKey: 'facultad_escuela', pageSize: 100 }));
      setFormData(item ? { persona: item.persona ?? null, facultad: item.facultad ?? null } : ESTADO_INICIAL);
      setPersonaSeleccionada(null);
      setValidationError('');
    }
  }, [visible, item, dispatch]);

  const handleChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handlePersonaChange = (persona) => {
    setPersonaSeleccionada(persona);
    handleChange('persona', persona ? persona.id : null);
  };

  const validar = () => {
    if (!esEdicion && !formData.persona) {
      setValidationError('La persona es obligatoria.');
      return false;
    }
    if (!formData.facultad) {
      setValidationError('La facultad es obligatoria.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const accion = esEdicion
      ? actualizarTutor({ id: item.id, facultadId: formData.facultad })
      : crearTutor(formData);
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
      header={esEdicion ? 'Editar Tutor' : 'Nuevo Tutor'}
      visible={visible}
      style={{ width: '35vw' }}
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
        <div className="field mb-3">
          <label htmlFor="facultad">Facultad *</label>
          <Dropdown
            inputId="facultad"
            value={formData.facultad}
            options={facultades}
            optionLabel="nombre_facultad"
            optionValue="id"
            filter
            onChange={(e) => handleChange('facultad', e.value)}
            placeholder="Seleccione la facultad"
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default TutorFormModal;