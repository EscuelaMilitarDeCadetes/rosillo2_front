// src/domains/formal/components/convocatorias/ConvocatoriasAbiertasTable.js
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import {
  fetchOpenConvocatorias,
  descargarDocumentoConvocatoria,
} from '../../../../features/convocatorias/convocatoriasSlice';
import useHasRole from '../../../../hooks/useHasRole';

const ConvocatoriasAbiertasTable = ({ ocultarSiVacia = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  const { items: convocatorias, loading, error } = useSelector((state) => state.convocatorias);
  const [downloadingId, setDownloadingId] = useState(null);
  // /participar/:id solo admite FACULTAD y GRUPO (ver App.js)
  const puedeParticipar = useHasRole(['FACULTAD', 'GRUPO']);

  useEffect(() => {
    dispatch(fetchOpenConvocatorias());
  }, [dispatch]);

  const handleDownload = (rowData) => {
    setDownloadingId(rowData.id);
    dispatch(descargarDocumentoConvocatoria(rowData.id))
      .then((result) => {
        if (!descargarDocumentoConvocatoria.fulfilled.match(result)) {
          toast.current?.show({
            severity: 'warn',
            summary: 'No se pudo descargar',
            detail: result.payload || 'Esta convocatoria no tiene documento adjunto.',
            life: 5000,
          });
        }
      })
      .finally(() => setDownloadingId(null));
  };

  if (ocultarSiVacia && !loading && !error && convocatorias.length === 0) return null;

  const documentoBodyTemplate = (rowData) => (
    <Button
      icon="pi pi-download"
      label="Descargar PDF"
      className="p-button-text p-button-sm"
      loading={downloadingId === rowData.id}
      onClick={() => handleDownload(rowData)}
    />
  );

  const actionBodyTemplate = (rowData) => (
    <Button
      icon="pi pi-plus"
      className="p-button-rounded p-button-success p-button-sm"
      tooltip="Participar"
      onClick={() => navigate(`/participar/${rowData.id}`)}
    />
  );

  const tabla = (
    <>
      <Toast ref={toast} />
      <h5 className="mb-3">Convocatorias internas abiertas</h5>
      <DataTable
        value={convocatorias}
        loading={loading}
        emptyMessage="No hay convocatorias abiertas en este momento."
        responsiveLayout="scroll"
      >
        <Column field="nombre_convocatoria" header="Nombre" />
        <Column field="inicio" header="Fecha inicio" />
        <Column field="cierre" header="Fecha final" />
        <Column header="Documento" body={documentoBodyTemplate} />
        {puedeParticipar && <Column header="Acciones" body={actionBodyTemplate} />}
      </DataTable>
    </>
  );

  return ocultarSiVacia ? <div className="card card-body mb-4">{tabla}</div> : tabla;
};

export default ConvocatoriasAbiertasTable;