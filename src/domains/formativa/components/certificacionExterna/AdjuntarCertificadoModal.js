// src/domains/formativa/components/certificacionExterna/AdjuntarCertificadoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import {
  adjuntarCertificadoAsistencia,
  adjuntarCertificadoAprobacion,
} from '../../../../features/certificacionExterna/certificacionExternaSlice';

// Reutilizable para ambos endpoints ("certificado-asistencia" y
// "certificado-aprobacion"): la diferencia es solo qué thunk se dispara,
// controlado por la prop `tipo`.
const AdjuntarCertificadoModal = ({ visible, onHide, certificacion, tipo }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.certificacionExterna);
  const [documentoId, setDocumentoId] = useState(null);
  const [validationError, setValidationError] = useState('');

  const esAsistencia = tipo === 'asistencia';

  useEffect(() => {
    if (visible) {
      setDocumentoId(null);
      setValidationError('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (!documentoId) {
      setValidationError('Debe indicar el ID del documento.');
      return;
    }
    const accion = esAsistencia ? adjuntarCertificadoAsistencia : adjuntarCertificadoAprobacion;
    dispatch(accion({ id: certificacion.id, documentoId })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Adjuntar"
        icon="pi pi-paperclip"
        onClick={handleConfirm}
        loading={transicionandoId === certificacion?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Adjuntar certificado de ${esAsistencia ? 'asistencia' : 'aprobación'} — ${
        certificacion?.nombre_programa ?? ''
      }`}
      visible={visible}
      style={{ width: '28vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="documento">ID Documento Firmado *</label>
          <InputNumber
            inputId="documento"
            value={documentoId}
            onValueChange={(e) => setDocumentoId(e.value)}
            useGrouping={false}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default AdjuntarCertificadoModal;