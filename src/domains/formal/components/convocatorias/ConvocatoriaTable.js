// src/domains/formal/components/convocatorias/ConvocatoriaTable.js
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import { Toast } from 'primereact/toast';
import {
  fetchAllConvocatorias,
  descargarDocumentoConvocatoria,
  toggleConvocatoriaStatus,
} from '../../../../features/convocatorias/convocatoriasSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

// Roles que pueden participar en una convocatoria (crear proyecto) —
// debe reflejar ROLES_CREACION_PROYECTO en apps/investigacion_formal/permissions.py
const ROLES_PARTICIPAR = ['FACULTAD', 'GRUPO'];
// Rol que puede habilitar/deshabilitar convocatorias — debe reflejar
// el permiso EsCInterno de la acción cambiar_estado en convocatoria_viewset.py
const ROLES_CAMBIAR_ESTADO = ['CINTERNO'];

const ConvocatoriaTable = ({ onViewProjects }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminItems: convocatorias, adminLoading, adminTotalRecords, adminRows } = useSelector((state) => state.convocatorias);
  const { roles } = useSelector((state) => state.auth);
  const [globalFilter, setGlobalFilter] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState(null);
  const [convocatoriaATransicion, setConvocatoriaATransicion] = useState(null);
  const [first, setFirst] = useState(0);
  const toast = useRef(null);

  const puedeParticipar = ROLES_PARTICIPAR.some((r) => roles?.includes(r));
  const puedeCambiarEstado = ROLES_CAMBIAR_ESTADO.some((r) => roles?.includes(r));

  useEffect(() => {
    dispatch(fetchAllConvocatorias({ page: 1, rows: adminRows }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const onPage = (event) => {
    setFirst(event.first);
    dispatch(fetchAllConvocatorias({ page: event.page + 1, rows: event.rows }));
  };

  const handleDownload = (rowData) => {
    setDownloadingId(rowData.id);
    dispatch(descargarDocumentoConvocatoria(rowData.id))
      .then((result) => {
        if (!descargarDocumentoConvocatoria.fulfilled.match(result)) {
          toast.current?.show({ severity: 'error', summary: 'No se pudo descargar', detail: result.payload, life: 6000 });
        }
      })
      .finally(() => setDownloadingId(null));
  };

  const handleHabilitar = (rowData) => {
    setCambiandoEstadoId(rowData.id);
    dispatch(toggleConvocatoriaStatus({ id: rowData.id, estado: true }))
      .then((result) => {
        if (!toggleConvocatoriaStatus.fulfilled.match(result)) {
          toast.current?.show({ severity: 'error', summary: 'No se pudo habilitar', detail: result.payload, life: 6000 });
        }
      })
      .finally(() => setCambiandoEstadoId(null));
  };

  const handleConfirmarDeshabilitar = () => {
    setCambiandoEstadoId(convocatoriaATransicion.id);
    dispatch(toggleConvocatoriaStatus({ id: convocatoriaATransicion.id, estado: false }))
      .then((result) => {
        if (toggleConvocatoriaStatus.fulfilled.match(result)) {
          setConvocatoriaATransicion(null);
        } else {
          toast.current?.show({ severity: 'error', summary: 'No se pudo deshabilitar', detail: result.payload, life: 6000 });
        }
      })
      .finally(() => setCambiandoEstadoId(null));
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Administración de Convocatorias</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar en esta página..." />
      </span>
    </div>
  );

  const statusBodyTemplate = (rowData) => {
    const severity = rowData.estado ? 'success' : 'danger';
    const value = rowData.estado ? 'Activa' : 'Inactiva';
    return <Tag severity={severity} value={value}></Tag>;
  };

  const nombreBodyTemplate = (rowData) => (
    <>
      <Tooltip
        target={`.conv-nombre-${rowData.id}`}
        content="Click aquí para ver los proyectos que se registraron en esta convocatoria"
        position="top"
      />
      <span
        className={`conv-nombre-${rowData.id}`}
        style={{ cursor: 'pointer', color: 'black', textDecoration: 'none' }}
        onClick={() => onViewProjects(rowData)}
      >
        {rowData.nombre_convocatoria}
      </span>
    </>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="d-flex gap-2">
      <Button
        icon="pi pi-download"
        className="p-button-rounded p-button-secondary p-button-sm"
        tooltip="Descargar documento"
        loading={downloadingId === rowData.id}
        onClick={() => handleDownload(rowData)}
      />
      {puedeParticipar && (
        <Button
          icon="pi pi-plus"
          className="p-button-rounded p-button-success p-button-sm"
          tooltip="Participar"
          onClick={() => navigate(`/participar/${rowData.id}`)}
        />
      )}
      {puedeCambiarEstado && (
        rowData.estado ? (
          <Button
            icon="pi pi-ban"
            className="p-button-rounded p-button-danger p-button-sm"
            tooltip="Deshabilitar"
            loading={cambiandoEstadoId === rowData.id}
            onClick={() => setConvocatoriaATransicion(rowData)}
          />
        ) : (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-sm"
            tooltip="Habilitar"
            loading={cambiandoEstadoId === rowData.id}
            onClick={() => handleHabilitar(rowData)}
          />
        )
      )}
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <DataTable
        value={convocatorias}
        header={header}
        loading={adminLoading}
        lazy
        paginator
        first={first}
        rows={adminRows}
        totalRecords={adminTotalRecords}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        globalFilter={globalFilter}
        globalFilterFields={['nombre_convocatoria']}
        emptyMessage="No se encontraron convocatorias."
        responsiveLayout="scroll"
      >
        <Column field="nombre_convocatoria" header="Nombre" body={nombreBodyTemplate} sortable />
        <Column field="anio_convocatoria" header="Año" sortable />
        <Column field="inicio" header="Fecha Inicio" sortable />
        <Column field="cierre" header="Fecha Cierre" sortable />
        <Column field="estado" header="Estado" body={statusBodyTemplate} sortable />
        <Column header="Acciones" body={actionBodyTemplate} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(convocatoriaATransicion)}
        onHide={() => setConvocatoriaATransicion(null)}
        onConfirm={handleConfirmarDeshabilitar}
        header="¿Deshabilitar esta convocatoria?"
        loading={cambiandoEstadoId === convocatoriaATransicion?.id}
      >
        Nadie podrá participar en <strong>{convocatoriaATransicion?.nombre_convocatoria}</strong> mientras esté deshabilitada.
      </ConfirmationModal>
    </>
  );
};

export default ConvocatoriaTable;