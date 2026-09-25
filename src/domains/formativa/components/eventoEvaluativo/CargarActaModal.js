// src/domains/formativa/components/eventoEvaluativo/CargarActaModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { cargarActaEvento } from '../../../../features/eventoEvaluativo/eventoEvaluativoSlice';
import DocumentoPorObjetoSelector from '../../../common/components/documentoFirma/DocumentoPorObjetoSelector';

/**
 * acta_sustentacion se elige desde los DocumentoFirma ya vinculados
 * a este EventoEvaluativo, mismo componente reutilizable 
 * DocumentoPorObjetoSelector construido para documento_soporte en 
 * CompletarActividadModal.
 */
const CargarActaModal = ({ visible, onHide, evento }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.eventoEvaluativo);
  const [actaSustentacionId, setActaSustentacionId] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setActaSustentacionId(null);
      setValidationError('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (!actaSustentacionId) {
      setValidationError('Debe seleccionar el acta de sustentación.');
      return;
    }
    dispatch(cargarActaEvento({ id: evento.id, actaSustentacionId })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Cargar Acta"
        icon="pi pi-file-check"
        onClick={handleConfirm}
        loading={transicionandoId === evento?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Cargar acta — sustentación #${evento?.numero ?? ''}`}
      visible={visible}
      style={{ width: '30vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="acta_sustentacion">Acta de Sustentación *</label>
          <DocumentoPorObjetoSelector
            contentTypeAppLabel="investigacion_formativa"
            contentTypeModel="eventoevaluativo"
            objectId={evento?.id}
            value={actaSustentacionId}
            onChange={setActaSustentacionId}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default CargarActaModal;