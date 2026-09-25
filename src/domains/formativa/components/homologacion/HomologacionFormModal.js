// src/domains/formativa/components/homologacion/HomologacionFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { crearHomologacion } from '../../../../features/homologacion/homologacionSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';

const ESTADO_INICIAL = { proceso: null, observaciones: '' };

/**
 * Solo creación: Homologacion no tiene update() genérico ni destroy(), solo
 * las transiciones aprobar/rechazar/cargar-acta (ver tabla). Es 1:1 por
 * proceso (existe_para_proceso lo valida en backend).
 */
const HomologacionFormModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.homologacion);
  const { items: procesos } = useSelector((state) => state.procesosInvFormativa);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      dispatch(fetchProcesosActivos());
      setFormData(ESTADO_INICIAL);
      setValidationError('');
    }
  }, [visible, dispatch]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!formData.proceso) {
      setValidationError('El proceso formativo es obligatorio.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    dispatch(
      crearHomologacion({ proceso: formData.proceso, observaciones: formData.observaciones || null })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Abrir Solicitud" icon="pi pi-check" onClick={handleSubmit} loading={saving} autoFocus />
    </div>
  );

  return (
    <Dialog
      header="Nueva Solicitud de Homologación"
      visible={visible}
      style={{ width: '35vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="proceso">Proceso Formativo *</label>
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
        </div>
        <div className="field mb-3">
          <label htmlFor="observaciones">Observaciones</label>
          <InputTextarea
            id="observaciones"
            value={formData.observaciones}
            rows={3}
            onChange={(e) => handleChange('observaciones', e.target.value)}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default HomologacionFormModal;