// src/domains/crm/components/entidadExterna/EntidadExternaFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  crearEntidadExterna,
  actualizarEntidadExterna,
} from '../../../../features/crm/entidadExternaSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

// Debe coincidir exactamente con TIPOS_RELACION_VALIDOS en
// apps/crm/validators/entidad_externa_validator.py
const TIPOS_RELACION = [
  { label: 'Financiador', value: 'FINANCIADOR' },
  { label: 'Cooperante', value: 'COOPERANTE' },
];

const ESTADO_INICIAL = { nombre: '', sector: '', pais: '', tipo_relacion: '' };

/**
 * Modal de alta/edición para EntidadExterna. `item` = null significa modo
 * creación; un objeto significa edición (PATCH a `crm/entidad-externa/{id}/`).
 */
const EntidadExternaFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.entidadExterna);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      setFormData(
        item
          ? {
              nombre: item.nombre ?? '',
              sector: item.sector ?? '',
              pais: item.pais ?? '',
              tipo_relacion: item.tipo_relacion ?? '',
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
      setValidationError('El nombre de la entidad externa es obligatorio.');
      return false;
    }
    if (!formData.sector.trim()) {
      setValidationError('El sector es obligatorio.');
      return false;
    }
    if (!formData.pais.trim()) {
      setValidationError('El país es obligatorio.');
      return false;
    }
    if (!formData.tipo_relacion) {
      setValidationError('El tipo de relación es obligatorio.');
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
    const payload = { ...formData };
    const accion = esEdicion
      ? actualizarEntidadExterna({ id: item.id, payload })
      : crearEntidadExterna(payload);
    dispatch(accion).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const tipoRelacionLabel = (valor) =>
    TIPOS_RELACION.find((t) => t.value === valor)?.label || 'N/A';

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
      header={esEdicion ? 'Editar Entidad Externa' : 'Nueva Entidad Externa'}
      visible={visible}
      style={{ width: '40vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
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
          <label htmlFor="sector">Sector *</label>
          <InputText
            id="sector"
            value={formData.sector}
            maxLength={100}
            onChange={(e) => handleChange('sector', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="pais">País *</label>
          <InputText
            id="pais"
            value={formData.pais}
            maxLength={100}
            onChange={(e) => handleChange('pais', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="tipo_relacion">Tipo de relación *</label>
          <Dropdown
            inputId="tipo_relacion"
            value={formData.tipo_relacion || null}
            options={TIPOS_RELACION}
            onChange={(e) => handleChange('tipo_relacion', e.value)}
            placeholder="Seleccione el tipo de relación"
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
          <li><strong>Sector:</strong> {formData.sector || 'N/A'}</li>
          <li><strong>País:</strong> {formData.pais || 'N/A'}</li>
          <li><strong>Tipo de relación:</strong> {tipoRelacionLabel(formData.tipo_relacion)}</li>
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default EntidadExternaFormModal;