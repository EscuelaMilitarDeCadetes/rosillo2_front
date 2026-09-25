// src/domains/common/components/documentoFirma/FirmarDocumentoModal.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { TabView, TabPanel } from 'primereact/tabview';
import { firmarDocumento, rechazarFirma, limpiarErrorDocumentoFirmante } from '../../../../features/documentoFirmante/documentoFirmanteSlice';

// Autoservicio del firmante: recibió el código de verificación por
// notificación/correo (lo generó el dueño del documento vía
// generar-codigo/) y aquí lo ingresa para completar su firma, o puede
// rechazar indicando el motivo. Ambas acciones solo las permite el backend
// si el ejecutor es exactamente el usuario asignado como firmante.
const FirmarDocumentoModal = ({ visible, onHide, firmante }) => {
  const dispatch = useDispatch();
  const { firmando, firmarError } = useSelector((state) => state.documentoFirmante);
  const [codigo, setCodigo] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');

  useEffect(() => {
    if (visible) {
      dispatch(limpiarErrorDocumentoFirmante());
      setCodigo('');
      setMotivoRechazo('');
    }
  }, [visible, dispatch]);

  const handleFirmar = () => {
    if (!codigo.trim()) return;
    dispatch(firmarDocumento({ firmanteId: firmante.id, codigoVerificacion: codigo.trim() })).then((result) => {
      if (firmarDocumento.fulfilled.match(result)) onHide();
    });
  };

  const handleRechazar = () => {
    if (!motivoRechazo.trim()) return;
    dispatch(rechazarFirma({ firmanteId: firmante.id, motivoRechazo: motivoRechazo.trim() })).then((result) => {
      if (rechazarFirma.fulfilled.match(result)) onHide();
    });
  };

  return (
    <Dialog header="Firmar Documento" visible={visible} style={{ width: '28rem' }} onHide={onHide}>
      {firmarError && <Message severity="error" className="mb-3 w-full" text={firmarError} />}
      <p className="text-muted small">
        Documento: <strong>{firmante?.documento_firma_hash ? `hash ${firmante.documento_firma_hash.slice(0, 12)}…` : `#${firmante?.documento_firma}`}</strong>
      </p>
      <TabView>
        <TabPanel header="Firmar">
          <p className="small">Ingrese el código de verificación que le fue enviado por correo/notificación.</p>
          <div className="field mb-3">
            <label htmlFor="codigo">Código de Verificación</label>
            <InputText id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} maxLength={6} className="w-100" />
          </div>
          <div className="d-flex justify-content-end">
            <Button label="Confirmar Firma" icon="pi pi-check" loading={firmando} disabled={!codigo.trim()} onClick={handleFirmar} />
          </div>
        </TabPanel>
        <TabPanel header="Rechazar">
          <div className="field mb-3">
            <label htmlFor="motivoRechazo">Motivo del rechazo (obligatorio)</label>
            <InputTextarea
              id="motivoRechazo"
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              rows={4}
              className="w-100"
            />
          </div>
          <div className="d-flex justify-content-end">
            <Button
              label="Confirmar Rechazo"
              icon="pi pi-times"
              className="p-button-danger"
              loading={firmando}
              disabled={!motivoRechazo.trim()}
              onClick={handleRechazar}
            />
          </div>
        </TabPanel>
      </TabView>
    </Dialog>
  );
};

export default FirmarDocumentoModal;