// src/domains/formativa/components/actividadFormativa/CompletarActividadModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { completarActividadFormativa } from '../../../../features/actividadFormativa/actividadFormativaSlice';
import DocumentoPorObjetoSelector from '../../../common/components/documentoFirma/DocumentoPorObjetoSelector';

/**
 * documento_soporte se elige desde los DocumentoFirma ya vinculados
 * a esta ActividadFormativa.
 * Solo se muestran documentos en estado FIRMADO (soloFirmados por defecto),
 * ya que un documento en borrador o en proceso de firmas no debería servir
 * como soporte de que la actividad se completó.
 */
const CompletarActividadModal = ({ visible, onHide, actividad }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.actividadFormativa);
  const [documentoSoporteId, setDocumentoSoporteId] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setDocumentoSoporteId(null);
      setValidationError('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (!documentoSoporteId) {
      setValidationError('Debe seleccionar el documento soporte.');
      return;
    }
    dispatch(
      completarActividadFormativa({ id: actividad.id, documentoSoporteId })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Completar"
        icon="pi pi-check"
        onClick={handleConfirm}
        loading={transicionandoId === actividad?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Completar actividad: ${actividad?.nombre || ''}`}
      visible={visible}
      style={{ width: '30vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="documento_soporte">Documento Soporte *</label>
          <DocumentoPorObjetoSelector
            contentTypeAppLabel="investigacion_formativa"
            contentTypeModel="actividadformativa"
            objectId={actividad?.id}
            value={documentoSoporteId}
            onChange={setDocumentoSoporteId}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default CompletarActividadModal;