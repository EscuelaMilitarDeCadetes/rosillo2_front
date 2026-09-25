// src/domains/formativa/components/procesoFormativoXProyecto/VinculoProyectoFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  crearVinculoProyecto,
  actualizarVinculoProyecto,
} from '../../../../features/procesoFormativoXProyecto/procesoFormativoXProyectoSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';

const ESTADO_INICIAL = { proceso_formativo: null, proyecto_formal: null };

// No existe un selector de Proyecto (investigacion_formal) en el proyecto,
// así que proyecto_formal se captura por ID, igual que otras FK sin slice.
const VinculoProyectoFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.procesoFormativoXProyecto);
  const { items: procesos } = useSelector((state) => state.procesosInvFormativa);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      dispatch(fetchProcesosActivos());
      setFormData(
        item
          ? { proceso_formativo: item.proceso_formativo ?? null, proyecto_formal: item.proyecto_formal ?? null }
          : ESTADO_INICIAL
      );
      setValidationError('');
    }
  }, [visible, item, dispatch]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!formData.proceso_formativo) {
      setValidationError('El proceso formativo es obligatorio.');
      return false;
    }
    if (!formData.proyecto_formal) {
      setValidationError('El ID del proyecto formal es obligatorio.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const accion = esEdicion
      ? actualizarVinculoProyecto({ id: item.id, payload: formData })
      : crearVinculoProyecto(formData);
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
        label={esEdicion ? 'Guardar Cambios' : 'Vincular'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Vinculación' : 'Nueva Vinculación Proceso-Proyecto'}
      visible={visible}
      style={{ width: '35vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="proceso_formativo">Proceso Formativo *</label>
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
        </div>
        <div className="field mb-3">
          <label htmlFor="proyecto_formal">ID Proyecto Formal *</label>
          <InputNumber
            inputId="proyecto_formal"
            value={formData.proyecto_formal}
            onValueChange={(e) => handleChange('proyecto_formal', e.value)}
            useGrouping={false}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default VinculoProyectoFormModal;