// src/domains/formal/components/proyectos/EditObjetivoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { actualizarObjetivo } from '../../../../features/proyectos/objetivosSlice';

const EditObjetivoModal = ({ visible, onHide, objetivo, proyectoId }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.objetivos);
  const [texto, setTexto] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible && objetivo) {
      setTexto(objetivo.objetivo || '');
      setValidationError('');
    }
  }, [visible, objetivo]);

  const handleSubmit = () => {
    if (!texto.trim()) {
      setValidationError('El texto del objetivo es obligatorio.');
      return;
    }
    setValidationError('');
    dispatch(
      actualizarObjetivo({ id: objetivo.id, objetivo: texto, proyectoId })
    ).then((result) => {
      if (actualizarObjetivo.fulfilled.match(result)) onHide();
    });
  };

  const footer = (
    <>
      <Button label="Cancelar" className="p-button-text" onClick={onHide} disabled={saving} />
      <Button label="Guardar Cambios" icon="pi pi-check" onClick={handleSubmit} loading={saving} />
    </>
  );

  return (
    <Dialog
      header={objetivo?.clase === 'PRINCIPAL' ? 'Editar Objetivo General' : 'Editar Objetivo Específico'}
      visible={visible}
      style={{ width: '40vw' }}
      onHide={onHide}
      footer={footer}
    >
      <div className="p-fluid">
        {(validationError || error) && (
          <Message severity="error" text={validationError || error} className="mb-3 w-full" />
        )}
        <label htmlFor="objetivo-texto" className="font-bold mb-2 d-block">
          Texto del objetivo
        </label>
        <InputTextarea
          id="objetivo-texto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={4}
          autoResize
        />
      </div>
    </Dialog>
  );
};

export default EditObjetivoModal;