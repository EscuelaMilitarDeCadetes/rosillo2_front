// src/domains/formativa/components/modalidadXFacultad/ModalidadXFacultadFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { crearModalidadXFacultad } from '../../../../features/modalidadXFacultad/modalidadXFacultadSlice';
import { fetchModalidadesActivas } from '../../../../features/modalidad/modalidadSlice';
import { fetchCatalogo } from '../../../../features/catalogos/catalogosSlice';

const ESTADO_INICIAL = { facultad: null, modalidad: null, disponible: true };

/**
 * Solo creación: ModalidadXFacultadService no tiene actualizar() genérico
 * (validar_actualizacion está huérfana), solo crear/habilitar/deshabilitar.
 */
const ModalidadXFacultadFormModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.modalidadXFacultad);
  const { items: modalidades } = useSelector((state) => state.modalidad);
  const { items: facultades } = useSelector((state) => state.catalogos.facultad_escuela);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      dispatch(fetchModalidadesActivas());
      dispatch(fetchCatalogo({ catalogKey: 'facultad_escuela', pageSize: 100 }));
      setFormData(ESTADO_INICIAL);
      setValidationError('');
    }
  }, [visible, dispatch]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!formData.facultad) {
      setValidationError('La facultad es obligatoria.');
      return false;
    }
    if (!formData.modalidad) {
      setValidationError('La modalidad es obligatoria.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    dispatch(crearModalidadXFacultad(formData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Habilitar" icon="pi pi-check" onClick={handleSubmit} loading={saving} autoFocus />
    </div>
  );

  return (
    <Dialog
      header="Habilitar Modalidad para Facultad"
      visible={visible}
      style={{ width: '32vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
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
        <div className="field mb-3">
          <label htmlFor="modalidad">Modalidad *</label>
          <Dropdown
            inputId="modalidad"
            value={formData.modalidad}
            options={modalidades}
            optionLabel="nombre"
            optionValue="id"
            filter
            onChange={(e) => handleChange('modalidad', e.value)}
            placeholder="Seleccione la modalidad"
          />
        </div>
        <div className="field mb-3 flex align-items-center gap-2">
          <Checkbox
            inputId="disponible"
            checked={formData.disponible}
            onChange={(e) => handleChange('disponible', e.checked)}
          />
          <label htmlFor="disponible">Disponible desde ya</label>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default ModalidadXFacultadFormModal;