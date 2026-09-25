// src/domains/formativa/components/postulacionProceso/PostulacionProcesoTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import {
  fetchPostulaciones,
  fetchPostulacionesPorEstudiante,
  fetchPostulacionesPendientesPorFacultad,
  eliminarPostulacion,
  enviarPostulacion,
  pasarPostulacionAValidacion,
  establecerFiltroEstudiantePostulacion,
  establecerFiltroPendientesFacultad,
  limpiarFiltrosPostulacion,
  limpiarErrorPostulacion,
} from '../../../../features/postulacionProceso/postulacionProcesoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import AprobarPostulacionModal from './AprobarPostulacionModal';
import RechazarPostulacionModal from './RechazarPostulacionModal';
import SolicitarDecisionDecanoModal from './SolicitarDecisionDecanoModal';

const ESTADOS_RECHAZABLES = ['ENVIADA', 'EN_VALIDACION'];

const estadoSeverity = (estado) => {
  switch (estado) {
    case 'BORRADOR': return 'secondary';
    case 'ENVIADA': return 'info';
    case 'EN_VALIDACION': return 'warning';
    case 'APROBADA': return 'success';
    case 'RECHAZADA': return 'danger';
    case 'ELIMINADA': return 'secondary';
    default: return 'secondary';
  }
};

const PostulacionProcesoTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const {
    items, total, loading, error, deletingId, transicionandoId,
    estudianteFiltro, pendientesFacultadFiltro,
  } = useSelector((state) => state.postulacionProceso);

  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [itemAAprobar, setItemAAprobar] = useState(null);
  const [itemARechazar, setItemARechazar] = useState(null);
  const [itemASolicitar, setItemASolicitar] = useState(null);
  const [estudianteInput, setEstudianteInput] = useState('');
  const [facultadInput, setFacultadInput] = useState('');

  const hayFiltro = Boolean(estudianteFiltro || pendientesFacultadFiltro);

  useEffect(() => {
    if (estudianteFiltro) {
      dispatch(fetchPostulacionesPorEstudiante(estudianteFiltro));
    } else if (pendientesFacultadFiltro) {
      dispatch(fetchPostulacionesPendientesPorFacultad(pendientesFacultadFiltro));
    } else {
      dispatch(fetchPostulaciones({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, estudianteFiltro, pendientesFacultadFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorEstudiante = () => {
    dispatch(establecerFiltroEstudiantePostulacion(estudianteInput.trim() || null));
    setFacultadInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onBuscarPendientesFacultad = () => {
    dispatch(establecerFiltroPendientesFacultad(facultadInput.trim() || null));
    setEstudianteInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(limpiarFiltrosPostulacion());
    setEstudianteInput('');
    setFacultadInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const estadoTemplate = (rowData) => (
    <Tag value={rowData.estado} severity={estadoSeverity(rowData.estado)} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    return (
      <>
        {rowData.estado === 'BORRADOR' && (
          <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" onClick={() => onEdit(rowData)} tooltip="Editar" />
        )}
        {rowData.estado === 'BORRADOR' && (
          <Button icon="pi pi-send" className="p-button-rounded p-button-text p-button-info" onClick={() => dispatch(enviarPostulacion(rowData.id))} loading={enTransicion} tooltip="Enviar" />
        )}
        {rowData.estado === 'ENVIADA' && (
          <Button icon="pi pi-forward" className="p-button-rounded p-button-text p-button-info" onClick={() => dispatch(pasarPostulacionAValidacion(rowData.id))} loading={enTransicion} tooltip="Pasar a validación" />
        )}
        {rowData.estado === 'EN_VALIDACION' && (
          <Button icon="pi pi-check" className="p-button-rounded p-button-text p-button-success" onClick={() => setItemAAprobar(rowData)} tooltip="Aprobar (Decano/Soporte)" />
        )}
        {rowData.estado === 'EN_VALIDACION' && (
          <Button icon="pi pi-briefcase" className="p-button-rounded p-button-text p-button-help" onClick={() => setItemASolicitar(rowData)} tooltip="Solicitar decisión al Decano" />
        )}
        {ESTADOS_RECHAZABLES.includes(rowData.estado) && (
          <Button icon="pi pi-times-circle" className="p-button-rounded p-button-text p-button-danger" onClick={() => setItemARechazar(rowData)} tooltip="Rechazar (Decano/Soporte)" />
        )}
        {rowData.estado === 'BORRADOR' && (
          <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => setItemAEliminar(rowData)} tooltip="Eliminar" />
        )}
      </>
    );
  };

  const handleConfirmarEliminar = () => {
    dispatch(eliminarPostulacion(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') setItemAEliminar(null);
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText value={estudianteInput} onChange={(e) => setEstudianteInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onBuscarPorEstudiante()} placeholder="ID Estudiante" />
          <Button icon="pi pi-search" onClick={onBuscarPorEstudiante} tooltip="Filtrar por estudiante" />
        </div>
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText value={facultadInput} onChange={(e) => setFacultadInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onBuscarPendientesFacultad()} placeholder="ID Facultad (pendientes)" />
          <Button icon="pi pi-search" onClick={onBuscarPendientesFacultad} tooltip="Pendientes por facultad" />
        </div>
        {hayFiltro && (
          <Button label="Limpiar filtros" icon="pi pi-times" className="p-button-text p-button-sm" onClick={onLimpiarFiltros} />
        )}
      </div>
      {error && (
        <Message severity="error" className="mb-3 w-full" text={error} onClick={() => dispatch(limpiarErrorPostulacion())} />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Postulaciones a Procesos de Grado</h5>}
        loading={loading}
        lazy={!hayFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={hayFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron postulaciones."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="estudiante_nombre_completo" header="Estudiante" />
        <Column field="modalidad_nombre" header="Modalidad" />
        <Column field="promedio_actual" header="Promedio" />
        <Column body={estadoTemplate} header="Estado" sortable field="estado" />
        <Column field="proceso_creado_titulo" header="Proceso Generado" />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '14rem' }} />
      </DataTable>

      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar postulación?"
        loading={Boolean(deletingId)}
      >
        Esta acción eliminará la postulación de <strong>{itemAEliminar?.estudiante_nombre_completo}</strong>. Solo es posible en estado Borrador.
      </ConfirmationModal>

      <AprobarPostulacionModal visible={Boolean(itemAAprobar)} onHide={() => setItemAAprobar(null)} postulacion={itemAAprobar} />
      <RechazarPostulacionModal visible={Boolean(itemARechazar)} onHide={() => setItemARechazar(null)} postulacion={itemARechazar} />
      <SolicitarDecisionDecanoModal visible={Boolean(itemASolicitar)} onHide={() => setItemASolicitar(null)} postulacion={itemASolicitar} />
    </>
  );
};

export default PostulacionProcesoTable;