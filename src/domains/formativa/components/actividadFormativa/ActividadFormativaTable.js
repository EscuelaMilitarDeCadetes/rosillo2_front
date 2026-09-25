// src/domains/formativa/components/actividadFormativa/ActividadFormativaTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchActividadesFormativas,
  fetchActividadesPorProceso,
  fetchActividadesPorResponsable,
  eliminarActividadFormativa,
  iniciarActividadFormativa,
  cancelarActividadFormativa,
  establecerFiltroProcesoActividad,
  establecerFiltroResponsableActividad,
  limpiarErrorActividadFormativa,
} from '../../../../features/actividadFormativa/actividadFormativaSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import CompletarActividadModal from './CompletarActividadModal';

const SEVERIDAD_ESTADO = {
  PLANIFICADA: 'info',
  EN_PROGRESO: 'warning',
  COMPLETADA: 'success',
  CANCELADA: 'danger',
};

const ActividadFormativaTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, deletingId, transicionandoId, procesoFiltro, responsableFiltro } =
    useSelector((state) => state.actividadFormativa);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [itemACompletar, setItemACompletar] = useState(null);
  const [procesoInput, setProcesoInput] = useState('');
  const [responsableInput, setResponsableInput] = useState('');

  const hayFiltroActivo = Boolean(procesoFiltro || responsableFiltro);

  useEffect(() => {
    if (procesoFiltro) {
      dispatch(fetchActividadesPorProceso(procesoFiltro));
    } else if (responsableFiltro) {
      dispatch(fetchActividadesPorResponsable(responsableFiltro));
    } else {
      dispatch(fetchActividadesFormativas({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, procesoFiltro, responsableFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorProceso = () => {
    dispatch(establecerFiltroProcesoActividad(procesoInput.trim() || null));
    setResponsableInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onBuscarPorResponsable = () => {
    dispatch(establecerFiltroResponsableActividad(responsableInput.trim() || null));
    setProcesoInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroProcesoActividad(null));
    setProcesoInput('');
    setResponsableInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const estadoTemplate = (rowData) => (
    <Tag value={rowData.estado} severity={SEVERIDAD_ESTADO[rowData.estado] || 'info'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    const esTerminal = rowData.estado === 'COMPLETADA' || rowData.estado === 'CANCELADA';
    return (
      <>
        {!esTerminal && (
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-text p-button-warning"
            onClick={() => onEdit(rowData)}
            tooltip="Editar"
          />
        )}
        {rowData.estado === 'PLANIFICADA' && (
          <Button
            icon="pi pi-play"
            className="p-button-rounded p-button-text p-button-info"
            onClick={() => dispatch(iniciarActividadFormativa(rowData.id))}
            loading={enTransicion}
            tooltip="Iniciar"
          />
        )}
        {rowData.estado === 'EN_PROGRESO' && (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => setItemACompletar(rowData)}
            tooltip="Completar"
          />
        )}
        {!esTerminal && (
          <Button
            icon="pi pi-ban"
            className="p-button-rounded p-button-text p-button-secondary"
            onClick={() => dispatch(cancelarActividadFormativa(rowData.id))}
            loading={enTransicion}
            tooltip="Cancelar"
          />
        )}
        {rowData.estado === 'PLANIFICADA' && (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => setItemAEliminar(rowData)}
            tooltip="Eliminar"
          />
        )}
      </>
    );
  };

  const handleConfirmarEliminar = () => {
    dispatch(eliminarActividadFormativa(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAEliminar(null);
      }
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '16rem' }}>
          <InputText
            value={procesoInput}
            onChange={(e) => setProcesoInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorProceso()}
            placeholder="ID Proceso Formativo"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorProceso} tooltip="Filtrar por proceso" />
        </div>
        <div className="p-inputgroup" style={{ maxWidth: '16rem' }}>
          <InputText
            value={responsableInput}
            onChange={(e) => setResponsableInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorResponsable()}
            placeholder="ID Responsable"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorResponsable} tooltip="Filtrar por responsable" />
        </div>
        {hayFiltroActivo && (
          <Button
            label="Limpiar filtros"
            icon="pi pi-times"
            className="p-button-text p-button-sm"
            onClick={onLimpiarFiltros}
          />
        )}
      </div>
      {error && (
        <Message
          severity="error"
          className="mb-3 w-full"
          text={error}
          onClick={() => dispatch(limpiarErrorActividadFormativa())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Actividades Formativas</h5>}
        loading={loading}
        lazy={!hayFiltroActivo}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={hayFiltroActivo ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron actividades formativas."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="nombre" header="Nombre" />
        <Column field="proceso_formativo_titulo" header="Proceso Formativo" />
        <Column field="responsable_nombre_completo" header="Responsable" />
        <Column field="fecha_inicio" header="Fecha Inicio" />
        <Column field="fecha_fin" header="Fecha Fin" />
        <Column field="horas_dedicadas" header="Horas" />
        <Column field="estado" header="Estado" body={estadoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '12rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar actividad formativa?"
        loading={Boolean(deletingId)}
      >
        Esta acción eliminará permanentemente <strong>{itemAEliminar?.nombre}</strong>.
      </ConfirmationModal>
      {itemACompletar && (
        <CompletarActividadModal
          visible={Boolean(itemACompletar)}
          onHide={() => setItemACompletar(null)}
          actividad={itemACompletar}
        />
      )}
    </>
  );
};

export default ActividadFormativaTable;