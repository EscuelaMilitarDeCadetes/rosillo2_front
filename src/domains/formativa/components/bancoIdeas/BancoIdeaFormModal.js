// src/domains/formativa/components/bancoIdeas/BancoIdeaFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  crearBancoIdea,
  actualizarBancoIdea,
} from '../../../../features/bancoIdeas/bancoIdeasSlice';
import { fetchCatalogo } from '../../../../features/catalogos/catalogosSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const ESTADO_INICIAL = {
  facultad: null,
  idea: '',
  descripcion: '',
  linea_investigacion: '',
  palabras_clave: '',
};

/**
 * BancoIdeasService.actualizar solo recibe descripcion/linea_investigacion/
 * palabras_clave: facultad e idea son inmutables tras la creación, así que en
 * edición se muestran de solo lectura.
 */
const BancoIdeaFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.bancoIdeas);
  const { items: facultades } = useSelector((state) => state.catalogos.facultad_escuela);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      dispatch(fetchCatalogo({ catalogKey: 'facultad_escuela', pageSize: 100 }));
      setFormData(
        item
          ? {
              facultad: item.facultad ?? null,
              idea: item.idea ?? '',
              descripcion: item.descripcion ?? '',
              linea_investigacion: item.linea_investigacion ?? '',
              palabras_clave: item.palabras_clave ?? '',
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
    if (!esEdicion && !formData.facultad) {
      setValidationError('La facultad es obligatoria.');
      return false;
    }
    if (!esEdicion && !formData.idea.trim()) {
      setValidationError('El título de la idea es obligatorio.');
      return false;
    }
    if (!formData.descripcion.trim()) {
      setValidationError('La descripción es obligatoria.');
      return false;
    }
    if (!formData.linea_investigacion.trim()) {
      setValidationError('La línea de investigación es obligatoria.');
      return false;
    }
    if (!formData.palabras_clave.trim()) {
      setValidationError('Las palabras clave son obligatorias.');
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
      descripcion: formData.descripcion,
      linea_investigacion: formData.linea_investigacion,
      palabras_clave: formData.palabras_clave,
    };
    const accion = esEdicion
      ? actualizarBancoIdea({ id: item.id, payload: payloadComun })
      : crearBancoIdea({
          ...payloadComun,
          facultad: formData.facultad,
          idea: formData.idea,
        });
    dispatch(accion).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const facultadLabel = (id) => facultades.find((f) => f.id === id)?.nombre_facultad || 'N/A';

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label={esEdicion ? 'Guardar Cambios' : 'Registrar'}
        icon="pi pi-check"
        onClick={handleShowConfirmation}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Idea del Banco' : 'Nueva Idea del Banco'}
      visible={visible}
      style={{ width: '40vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="facultad">Facultad *</label>
          {esEdicion ? (
            <InputText value={facultadLabel(formData.facultad)} disabled />
          ) : (
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
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="idea">Título de la Idea *</label>
          <InputText
            id="idea"
            value={formData.idea}
            maxLength={255}
            disabled={esEdicion}
            onChange={(e) => handleChange('idea', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="descripcion">Descripción *</label>
          <InputTextarea
            id="descripcion"
            value={formData.descripcion}
            maxLength={255}
            rows={3}
            onChange={(e) => handleChange('descripcion', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="linea_investigacion">Línea de Investigación *</label>
          <InputText
            id="linea_investigacion"
            value={formData.linea_investigacion}
            maxLength={255}
            onChange={(e) => handleChange('linea_investigacion', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="palabras_clave">Palabras Clave *</label>
          <InputText
            id="palabras_clave"
            value={formData.palabras_clave}
            maxLength={255}
            onChange={(e) => handleChange('palabras_clave', e.target.value)}
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
          <li><strong>Idea:</strong> {formData.idea || 'N/A'}</li>
          <li><strong>Línea de investigación:</strong> {formData.linea_investigacion || 'N/A'}</li>
          <li><strong>Palabras clave:</strong> {formData.palabras_clave || 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default BancoIdeaFormModal;