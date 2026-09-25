// src/domains/common/components/aprobacion/AprobacionesTable.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { fetchAprobaciones } from '../../../../features/aprobacion/aprobacionSlice';

const severidadPorEstado = { PENDIENTE: 'warning', APROBADO: 'success', RECHAZADO: 'danger' };

// Listado administrativo general de todas las solicitudes de aprobación
// (CRUD -> list), sin filtrar por revisor ni por documento. Complementa a
// AprobacionesPendientesTable (autoservicio) y AprobacionesPorDocumentoPanel
// (historial de un documento puntual).
const AprobacionesTable = ({ onNuevaSolicitud }) => {
  const dispatch = useDispatch();
  const { items, total, loadingItems, error } = useSelector((state) => state.aprobacion);
  const [page, setPage] = useState(1);
  const [rows] = useState(10);

  useEffect(() => {
    dispatch(fetchAprobaciones({ page, pageSize: rows }));
  }, [dispatch, page, rows]);

  const estadoTemplate = (rowData) => (
    <Tag value={rowData.estado} severity={severidadPorEstado[rowData.estado] || 'secondary'} />
  );

  const fechaTemplate = (rowData) => new Date(rowData.fecha_revision).toLocaleString('es-CO');

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Todas las Solicitudes de Aprobación</h5>
      {onNuevaSolicitud && (
        <Button label="Nueva Solicitud" icon="pi pi-plus" className="p-button-sm" onClick={onNuevaSolicitud} />
      )}
    </div>
  );

  return (
    <>
      {error && <Message severity="error" className="mb-3 w-full" text={error} />}
      <DataTable
        value={items}
        loading={loadingItems}
        header={header}
        lazy
        paginator
        rows={rows}
        totalRecords={total}
        first={(page - 1) * rows}
        onPage={(e) => setPage(e.page + 1)}
        emptyMessage="No hay solicitudes de aprobación registradas."
        responsiveLayout="scroll"
      >
        <Column field="id" header="ID" style={{ width: '5rem' }} />
        <Column field="tipo_documento_nombre" header="Tipo de Documento" />
        <Column field="id_documento" header="ID Documento" />
        <Column field="usuario_revisor" header="Revisor" />
        <Column header="Estado" body={estadoTemplate} field="estado" />
        <Column header="Fecha" body={fechaTemplate} />
        <Column field="observacion" header="Observación" />
      </DataTable>
    </>
  );
};

export default AprobacionesTable;