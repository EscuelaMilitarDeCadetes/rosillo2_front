// src/domains/formativa/components/registroHoras/RegistroHorasFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { crearRegistroHoras } from '../../../../features/registroHoras/registroHorasSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';

const ESTADO_INICIAL = { proceso: null, horas_requeridas: 120 };

/**
 * Solo creación, solo las acciones puntuales
 * "ajustar-horas-requeridas" y "recalcular". 
 */
const RegistroHorasFormModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.registroHoras);
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
    if (!formData.horas_requeridas || formData.horas_requeridas <= 0) {
      setValidationError('Las horas requeridas deben ser mayores a cero.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    dispatch(crearRegistroHoras(formData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Crear Control" icon="pi pi-check" onClick={handleSubmit} loading={saving} autoFocus />
    </div>
  );

  return (
    <Dialog
      header="Nuevo Control de Horas"
      visible={visible}
      style={{ width: '30vw' }}
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
          <label htmlFor="horas_requeridas">Horas Requeridas *</label>
          <InputNumber
            inputId="horas_requeridas"
            value={formData.horas_requeridas}
            onValueChange={(e) => handleChange('horas_requeridas', e.value)}
            min={1}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default RegistroHorasFormModal;