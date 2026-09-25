// src/domains/formal/components/calificaciones/calificacionTable/DocumentosParticipacionModal.js
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

const DocumentosParticipacionModal = ({
  visible, tituloProyecto, documentos, loading, descargandoDocumentoId, onHide, onDescargar,
  puedeEnviarFirma, enviandoFirmaId, onEnviarAFirma,
}) => (
  <Dialog
    header={`Documentos de participación — ${tituloProyecto}`}
    visible={visible}
    style={{ width: '50vw' }}
    onHide={onHide}
  >
    <DataTable
      value={documentos}
      loading={loading}
      emptyMessage="Este proyecto no tiene documentos de participación registrados."
      responsiveLayout="scroll"
    >
      <Column field="tipo_documento_nombre" header="Tipo de Documento" />
      <Column field="version" header="Versión" />
      <Column header="Estado" body={(row) => <Tag value={row.estado} />} />
      <Column
        header="Acciones"
        body={(row) => (
          <div className="d-flex gap-2">
            <Button
              icon="pi pi-download"
              className="p-button-rounded p-button-info p-button-sm"
              loading={descargandoDocumentoId === row.id}
              onClick={() => onDescargar(row.id)}
            />
            {puedeEnviarFirma && ['BORRADOR', 'RECHAZADO'].includes(row.estado) && (
              <Button
                icon="pi pi-send"
                className="p-button-rounded p-button-warning p-button-sm"
                tooltip={row.estado === 'RECHAZADO' ? 'Reenviar a firma' : 'Enviar a firma'}
                loading={enviandoFirmaId === row.id}
                onClick={() => onEnviarAFirma(row.id)}
              />
            )}
          </div>          
        )}
      />
    </DataTable>
  </Dialog>
);

export default DocumentosParticipacionModal;