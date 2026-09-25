// src/domains/formativa/components/revision/RevisionFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { crearRevision } from '../../../../features/revision/revisionSlice';

const ESTADO_INICIAL = { instancia_etapa: null, observaciones: '', aprobado: true };

/**
 * Solo creación: Revision es append-only (ver nota), la versión la calcula
 * el backend automáticamente (consecutiva por instancia de etapa).
 */
const RevisionFormModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.revision);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setFormData(ESTADO_INICIAL);
      setValidationError('');
    }
  }, [visible]);

  const handleChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const validar = () => {
    if (!formData.instancia_etapa) {
      setValidationError('El ID de la instancia de etapa es obligatorio.');
      return false;
    }
    if (!formData.observaciones.trim()) {
      setValidationError('Las observaciones de la revisión son obligatorias.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    dispatch(crearRevision(formData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Registrar Revisión" icon="pi pi-check" onClick={handleSubmit} loading={saving} autoFocus />
    </div>
  );

  return (
    <Dialog header="Nueva Revisión" visible={visible} style={{ width: '35vw' }} footer={footer} onHide={onHide}>
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="instancia_etapa">ID Instancia de Etapa *</label>
          <InputNumber
            inputId="instancia_etapa"
            value={formData.instancia_etapa}
            onValueChange={(e) => handleChange('instancia_etapa', e.value)}
            useGrouping={false}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="observaciones">Observaciones *</label>
          <InputTextarea id="observaciones" value={formData.observaciones} rows={4} onChange={(e) => handleChange('observaciones', e.target.value)} />
        </div>
        <div className="field mb-3 flex align-items-center gap-2">
          <Checkbox inputId="aprobado" checked={formData.aprobado} onChange={(e) => handleChange('aprobado', e.checked)} />
          <label htmlFor="aprobado">Revisión aprobada</label>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default RevisionFormModal;