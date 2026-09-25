// src/domains/formal/components/convocatorias/ProyectosUsuarioTable.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProyectosPorUsuario } from '../../../../features/convocatorias/convocatoriasSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import CargarDocumentoCorregidoModal from './CargarDocumentoCorregidoModal';

const ProyectosUsuarioTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { proyectosUsuario, proyectosUsuarioLoading } = useSelector((state) => state.convocatorias);
  const [globalFilter, setGlobalFilter] = useState('');
  const [modalProyectoId, setModalProyectoId] = useState(null);

  useEffect(() => {
    dispatch(fetchProyectosPorUsuario());
  }, [dispatch]);

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Mis Proyectos</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const statusBodyTemplate = (rowData) => {
    if (!rowData.estado_finalizado_calificacion) {
      return <Tag severity="warning" value="EN PROCESO" />;
    }
    const severity = rowData.calificacion_ultimo_filtro_calificacion === 'APROBADO' ? 'success' : 'danger';
    return (
      <Tag
        severity={severity}
        value={`FINALIZADO — ${rowData.calificacion_ultimo_filtro_calificacion || 'SIN RESULTADO'}`}
      />
    );
  };

  const actionBodyTemplate = (rowData) => {
    const puedeVerDetalle =
      rowData.estado_finalizado_calificacion &&
      rowData.calificacion_ultimo_filtro_calificacion === 'APROBADO';
    return (
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-info p-button-sm"
        tooltip={puedeVerDetalle ? 'Ver Detalles' : 'Disponible cuando el proyecto sea aprobado'}
        disabled={!puedeVerDetalle}
        onClick={() => navigate(`/proyectos/${rowData.proyecto}`)}
      />
    );
  };

  const cargueDocumentoTemplate = (rowData) => {
    if (rowData.modificacion_documento_proyecto) {
      return (
        <Button
          label="Cargar Documento"
          icon="pi pi-upload"
          className="p-button-sm p-button-primary"
          onClick={() => setModalProyectoId(rowData.proyecto)}
        />
      );
    }
    return <span className="text-color-secondary" style={{ fontSize: '0.85rem' }}>No habilitado para actualización</span>;
  };

  return (
    <>
      <DataTable
        value={proyectosUsuario}
        header={header}
        loading={proyectosUsuarioLoading}
        paginator
        rows={10}
        globalFilter={globalFilter}
        emptyMessage="No tienes proyectos registrados."
        responsiveLayout="scroll"
      >
        <Column field="proyecto_titulo" header="Título del Proyecto" sortable />
        <Column field="convocatoria_nombre" header="Convocatoria" sortable />
        <Column header="Estado" body={statusBodyTemplate} sortable sortField="estado_finalizado_calificacion" />
        <Column header="Cargue documento corregido" body={cargueDocumentoTemplate} />
        <Column header="Acciones" body={actionBodyTemplate} />
      </DataTable>
      <CargarDocumentoCorregidoModal
        visible={modalProyectoId !== null}
        onHide={() => setModalProyectoId(null)}
        proyectoId={modalProyectoId}
      />
    </>
  );
};

export default ProyectosUsuarioTable;