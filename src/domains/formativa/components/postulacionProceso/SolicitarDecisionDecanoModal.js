// src/domains/formativa/components/postulacionProceso/SolicitarDecisionDecanoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { solicitarDecisionDecano } from '../../../../features/postulacionProceso/postulacionProcesoSlice';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';

const nombreUsuario = (u) => u.persona_actual_nombre || u.username;

/**
 * Camino de Facultad: no aprueba/rechaza directamente, solo abre una
 * Aprobacion pendiente para el Decano. La postulación permanece en
 * EN_VALIDACION hasta que el Decano confirme o deniegue.
 */
const SolicitarDecisionDecanoModal = ({ visible, onHide, postulacion }) => {
  const dispatch = useDispatch();
  const { transicionandoId, error } = useSelector((state) => state.postulacionProceso);
  const { usuarios, loading: cargandoMetadata } = useSelector((state) => state.metadata);
  const [usuarioRevisor, setUsuarioRevisor] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      dispatch(fetchMetadata());
      setUsuarioRevisor(null);
      setObservacion('');
      setValidationError('');
    }
  }, [visible, dispatch]);

  const handleConfirm = () => {
    if (!usuarioRevisor) {
      setValidationError('Debe seleccionar el Decano que revisará la postulación.');
      return;
    }
    dispatch(
      solicitarDecisionDecano({ id: postulacion.id, usuarioRevisorId: usuarioRevisor, observacion: observacion || null })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') onHide();
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Solicitar Decisión"
        icon="pi pi-send"
        onClick={handleConfirm}
        loading={transicionandoId === postulacion?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Solicitar decisión al Decano — ${postulacion?.estudiante_nombre_completo ?? ''}`}
      visible={visible}
      style={{ width: '32vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="usuario_revisor">Decano *</label>
          <Dropdown
            inputId="usuario_revisor"
            value={usuarioRevisor}
            options={usuarios}
            optionLabel={nombreUsuario}
            optionValue="id"
            filter
            onChange={(e) => setUsuarioRevisor(e.value)}
            placeholder="Seleccione el Decano"
            disabled={cargandoMetadata}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="observacion">Observación (opcional)</label>
          <InputTextarea id="observacion" value={observacion} rows={3} onChange={(e) => setObservacion(e.target.value)} />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default SolicitarDecisionDecanoModal;