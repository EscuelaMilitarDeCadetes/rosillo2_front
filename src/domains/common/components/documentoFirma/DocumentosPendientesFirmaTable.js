// src/domains/common/components/documentoFirma/DocumentosPendientesFirmaTable.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import {
  fetchDocumentosHabilitadosParaFirma,
  marcarDocumentoRechazado,
  limpiarErrorDocumentoFirma,
} from '../../../../features/documentoFirma/documentoFirmaSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const estadoSeverity = (estado) => {
  switch (estado) {
    case 'BORRADOR': return 'secondary';
    case 'EN_FIRMAS': return 'info';
    case 'FIRMADO': return 'success';
    case 'RECHAZADO': return 'danger';
    default: return 'secondary';
  }
};

const DocumentosPendientesFirmaTable = () => {
  const dispatch = useDispatch();
  const { pendientesFirma, loading, error, actioningId, actionError } = useSelector(
    (state) => state.documentoFirma
  );

  const [docToReject, setDocToReject] = useState(null);
  const [isRejectConfirmVisible, setIsRejectConfirmVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchDocumentosHabilitadosParaFirma());
  }, [dispatch]);

  const handleRejectClick = (doc) => {
    dispatch(limpiarErrorDocumentoFirma());
    setDocToReject(doc);
    setIsRejectConfirmVisible(true);
  };

  const handleConfirmReject = () => {
    if (!docToReject) return;
    dispatch(marcarDocumentoRechazado(docToReject.id)).then((result) => {
      if (marcarDocumentoRechazado.fulfilled.match(result)) {
        setIsRejectConfirmVisible(false);
        setDocToReject(null);
      }
    });
  };

  const objetoBodyTemplate = (rowData) =>
    rowData.objeto_descripcion
      ? `${rowData.objeto_tipo}: ${rowData.objeto_descripcion}`
      : '—';

  const estadoBodyTemplate = (rowData) => (
    <Tag value={rowData.estado} severity={estadoSeverity(rowData.estado)} />
  );

  const archivoBodyTemplate = (rowData) => {
    const nombre = rowData.ruta_documento?.split(/[\\/]/).pop();
    return nombre || '—';
  };

  const actionBodyTemplate = (rowData) => (
    <Button
      label="Rechazar"
      icon="pi pi-times"
      className="p-button-danger p-button-sm"
      loading={actioningId === rowData.id}
      onClick={() => handleRejectClick(rowData)}
    />
  );

  return (
    <>
      {error && (
        <Message
          severity="error"
          className="mb-3 w-full"
          text={typeof error === 'string' ? error : 'Ocurrió un error al cargar los documentos.'}
        />
      )}
      {actionError && (
        <Message
          severity="error"
          className="mb-3 w-full"
          text={typeof actionError === 'string' ? actionError : 'Ocurrió un error al rechazar el documento.'}
        />
      )}

      <DataTable
        value={pendientesFirma}
        loading={loading}
        paginator
        rows={10}
        emptyMessage="No hay documentos habilitados para firma en este momento."
        responsiveLayout="scroll"
        header={<h5 className="m-0">Documentos Pendientes de Firma</h5>}
      >
        <Column field="tipo_documento_nombre" header="Tipo de Documento" sortable />
        <Column header="Objeto relacionado" body={objetoBodyTemplate} />
        <Column field="version" header="Versión" sortable style={{ width: '8rem' }} />
        <Column header="Archivo" body={archivoBodyTemplate} />
        <Column header="Estado" body={estadoBodyTemplate} sortable field="estado" />
        <Column header="Acciones" body={actionBodyTemplate} style={{ width: '10rem' }} />
      </DataTable>

      <ConfirmationModal
        visible={isRejectConfirmVisible}
        onHide={() => setIsRejectConfirmVisible(false)}
        onConfirm={handleConfirmReject}
        header="Confirmar Rechazo de Documento"
      >
        <p>
          ¿Está seguro de que desea rechazar el documento{' '}
          <strong>{docToReject?.tipo_documento_nombre}</strong>
          {docToReject?.objeto_descripcion ? ` (${docToReject.objeto_descripcion})` : ''}?
          Esta acción notificará al responsable y el documento quedará en estado RECHAZADO.
        </p>
      </ConfirmationModal>
    </>
  );
};

export default DocumentosPendientesFirmaTable;