// src/domains/common/components/documentoFirma/GestionarFirmantesModal.js
import React from 'react';
import { Dialog } from 'primereact/dialog';
import FirmantesDocumentoPanel from './FirmantesDocumentoPanel';

// Envoltorio en modal de FirmantesDocumentoPanel, pensado para abrirse desde
// el botón de acciones de cualquier tabla de documentos del dueño (proyecto,
// convocatoria, etc.) sin tener que construir una pantalla dedicada por cada
// dominio que use DocumentoFirma.
const GestionarFirmantesModal = ({ visible, onHide, documento }) => (
  <Dialog
    header={`Firmantes: ${documento?.tipo_documento_nombre || ''}${documento?.version ? ` (v${documento.version})` : ''}`}
    visible={visible}
    style={{ width: '45rem' }}
    onHide={onHide}
  >
    {documento?.id && <FirmantesDocumentoPanel documentoFirmaId={documento.id} />}
  </Dialog>
);

export default GestionarFirmantesModal;