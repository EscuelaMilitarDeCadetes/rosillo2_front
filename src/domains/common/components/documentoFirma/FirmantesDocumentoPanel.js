// src/domains/common/components/documentoFirma/FirmantesDocumentoPanel.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';
import {
  fetchFirmantesPorDocumento,
  asignarFirmante,
  eliminarFirmante,
  generarCodigoFirmante,
  limpiarErrorDocumentoFirmante,
  limpiarCodigoEnviado,
} from '../../../../features/documentoFirmante/documentoFirmanteSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import AsignarFirmantesModal from './AsignarFirmantesModal';

const nombreUsuario = (u) => u.persona_actual_nombre || u.username;

const estadoSeverity = (estado) => {
  switch (estado) {
    case 'PENDIENTE': return 'warning';
    case 'ACEPTADO': return 'info';
    case 'FIRMADO': return 'success';
    case 'RECHAZADO': return 'danger';
    default: return 'secondary';
  }
};

// Panel embebible desde la tabla de documentos del dueño (proyecto,
// convocatoria, etc.) para gestionar los firmantes de un DocumentoFirma
// puntual: listado (CRUD -> list), alta individual y masiva (CRUD -> create
// + asignar-varios), baja (CRUD -> delete) y generación de código de
// verificación por firmante (generar-codigo).
const FirmantesDocumentoPanel = ({ documentoFirmaId }) => {
  const dispatch = useDispatch();
  const { usuarios, loading: cargandoMetadata } = useSelector((state) => state.metadata);
  const {
    firmantes,
    loadingFirmantes,
    asignando,
    asignarError,
    actioningId,
    actionError,
    codigoEnviadoId,
  } = useSelector((state) => state.documentoFirmante);

  const [nuevoUsuarioId, setNuevoUsuarioId] = useState(null);
  const [firmanteAEliminar, setFirmanteAEliminar] = useState(null);
  const [modalMasivoVisible, setModalMasivoVisible] = useState(false);

  useEffect(() => {
    if (documentoFirmaId) dispatch(fetchFirmantesPorDocumento(documentoFirmaId));
  }, [dispatch, documentoFirmaId]);

  useEffect(() => {
    if (!usuarios?.length) dispatch(fetchMetadata());
  }, [dispatch, usuarios]);

  useEffect(() => {
    dispatch(limpiarErrorDocumentoFirmante());
  }, [dispatch, documentoFirmaId]);

  const siguienteOrden = (firmantes?.length || 0) + 1;

  const handleAgregarUno = () => {
    if (!nuevoUsuarioId) return;
    dispatch(asignarFirmante({ documentoFirmaId, usuarioId: nuevoUsuarioId, orden: siguienteOrden })).then((result) => {
      if (asignarFirmante.fulfilled.match(result)) setNuevoUsuarioId(null);
    });
  };

  const handleGenerarCodigo = (firmante) => {
    dispatch(limpiarCodigoEnviado());
    dispatch(generarCodigoFirmante(firmante.id));
  };

  const handleConfirmarEliminar = () => {
    if (!firmanteAEliminar) return;
    dispatch(eliminarFirmante({ firmanteId: firmanteAEliminar.id, documentoFirmaId })).then((result) => {
      if (eliminarFirmante.fulfilled.match(result)) setFirmanteAEliminar(null);
    });
  };

  const ordenTemplate = (rowData) => `#${rowData.orden}`;
  const estadoTemplate = (rowData) => <Tag value={rowData.estado} severity={estadoSeverity(rowData.estado)} />;
  const usuarioTemplate = (rowData) => rowData.usuario_username;

  const accionesTemplate = (rowData) => (
    <div className="d-flex flex-column gap-1">
      <div className="d-flex gap-2">
        <Button
          label="Generar código"
          icon="pi pi-key"
          className="p-button-secondary p-button-sm"
          loading={actioningId === rowData.id}
          disabled={rowData.estado === 'FIRMADO'}
          onClick={() => handleGenerarCodigo(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-danger p-button-sm"
          tooltip="Retirar firmante"
          disabled={rowData.estado === 'FIRMADO'}
          onClick={() => setFirmanteAEliminar(rowData)}
        />
      </div>
      {codigoEnviadoId === rowData.id && (
        <small className="text-success">Código enviado por notificación/correo.</small>
      )}
    </div>
  );

  return (
    <div>
      {(asignarError || actionError) && (
        <Message severity="error" className="mb-3 w-full" text={asignarError || actionError} />
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2 align-items-center">
          <Dropdown
            value={nuevoUsuarioId}
            options={usuarios.filter((u) => !firmantes.some((f) => f.usuario === u.id))}
            onChange={(e) => setNuevoUsuarioId(e.value)}
            optionLabel={nombreUsuario}
            optionValue="id"
            filter
            placeholder="Agregar firmante individual"
            disabled={cargandoMetadata}
            style={{ minWidth: '18rem' }}
          />
          <Button icon="pi pi-plus" label="Agregar" loading={asignando} disabled={!nuevoUsuarioId} onClick={handleAgregarUno} />
        </div>
        <Button
          label="Asignar Varios (por orden)"
          icon="pi pi-users"
          className="p-button-outlined"
          onClick={() => setModalMasivoVisible(true)}
        />
      </div>

      <DataTable
        value={firmantes}
        loading={loadingFirmantes}
        emptyMessage="Este documento aún no tiene firmantes asignados."
        responsiveLayout="scroll"
      >
        <Column header="Turno" body={ordenTemplate} sortable field="orden" style={{ width: '6rem' }} />
        <Column header="Firmante" body={usuarioTemplate} />
        <Column header="Estado" body={estadoTemplate} sortable field="estado" />
        <Column field="fecha_firma" header="Fecha de Firma" body={(r) => (r.fecha_firma ? new Date(r.fecha_firma).toLocaleString('es-CO') : '—')} />
        <Column field="motivo_rechazo" header="Motivo de Rechazo" body={(r) => r.motivo_rechazo || '—'} />
        <Column header="Acciones" body={accionesTemplate} style={{ minWidth: '16rem' }} />
      </DataTable>

      <AsignarFirmantesModal
        visible={modalMasivoVisible}
        onHide={() => setModalMasivoVisible(false)}
        documentoFirmaId={documentoFirmaId}
      />

      <ConfirmationModal
        visible={!!firmanteAEliminar}
        onHide={() => setFirmanteAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="Retirar Firmante"
        loading={actioningId === firmanteAEliminar?.id}
      >
        <p>¿Está seguro de que desea retirar a <strong>{firmanteAEliminar?.usuario_username}</strong> como firmante de este documento?</p>
      </ConfirmationModal>
    </div>
  );
};

export default FirmantesDocumentoPanel;