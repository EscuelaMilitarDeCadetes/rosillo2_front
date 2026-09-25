// src/domains/crm/components/interaccion/InteraccionTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchInteracciones,
  fetchInteraccionesPorEntidad,
  fetchInteraccionesPorProyecto,
  fetchInteraccionesPorMedio,
  fetchEntidadesOpciones,
  fetchProyectosOpciones,
  eliminarInteraccion,
  establecerFiltroEntidad,
  establecerFiltroProyecto,
  establecerFiltroMedio,
  limpiarErrorInteraccion,
} from '../../../../features/crm/interaccionSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const OPCIONES_MEDIO = [
  { label: 'Todos los medios', value: null },
  { label: 'Reunión', value: 'REUNION' },
  { label: 'Firma Convenio', value: 'CONVENIO' },
];

const formatearFecha = (iso) => (iso ? new Date(iso).toLocaleString('es-CO') : 'N/A');

const InteraccionTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const {
    items,
    total,
    loading,
    error,
    deletingId,
    entidadFiltro,
    proyectoFiltro,
    medioFiltro,
    entidadesOpciones,
    entidadesOpcionesLoading,
    proyectosOpciones,
    proyectosOpcionesLoading,
  } = useSelector((state) => state.interaccion);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);

  const sinFiltro = !entidadFiltro && !proyectoFiltro && !medioFiltro;

  useEffect(() => {
    if (entidadesOpciones.length === 0) dispatch(fetchEntidadesOpciones());
  }, [dispatch, entidadesOpciones.length]);

  useEffect(() => {
    if (proyectosOpciones.length === 0) dispatch(fetchProyectosOpciones());
  }, [dispatch, proyectosOpciones.length]);

  useEffect(() => {
    if (entidadFiltro) {
      dispatch(fetchInteraccionesPorEntidad(entidadFiltro));
    } else if (proyectoFiltro) {
      dispatch(fetchInteraccionesPorProyecto(proyectoFiltro));
    } else if (medioFiltro) {
      dispatch(fetchInteraccionesPorMedio(medioFiltro));
    } else {
      dispatch(fetchInteracciones({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, entidadFiltro, proyectoFiltro, medioFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onFiltroEntidadChange = (value) => {
    dispatch(establecerFiltroEntidad(value));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onFiltroProyectoChange = (value) => {
    dispatch(establecerFiltroProyecto(value));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onFiltroMedioChange = (value) => {
    dispatch(establecerFiltroMedio(value));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const entidadTemplate = (rowData) => rowData.entidad_nombre || 'N/A';
  const proyectoTemplate = (rowData) => rowData.proyecto_asociado_titulo || 'Sin proyecto';
  const fechaTemplate = (rowData) => formatearFecha(rowData.fecha);
  const medioTemplate = (rowData) => (
    <Tag
      value={rowData.medio === 'REUNION' ? 'Reunión' : 'Firma Convenio'}
      severity={rowData.medio === 'REUNION' ? 'info' : 'success'}
    />
  );

  const accionesTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-text p-button-warning"
        onClick={() => onEdit(rowData)}
        tooltip="Editar"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-danger"
        onClick={() => setItemAEliminar(rowData)}
        tooltip="Eliminar"
      />
    </>
  );

  const handleConfirmarEliminar = () => {
    dispatch(eliminarInteraccion(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAEliminar(null);
      }
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end gap-2 mb-3">
        <Dropdown
          value={entidadFiltro}
          options={[{ nombre: 'Todas las entidades', id: null }, ...entidadesOpciones]}
          optionLabel="nombre"
          optionValue="id"
          onChange={(e) => onFiltroEntidadChange(e.value)}
          placeholder="Filtrar por entidad"
          filter
          loading={entidadesOpcionesLoading}
          style={{ minWidth: '16rem' }}
        />
        <Dropdown
          value={proyectoFiltro}
          options={[{ titulo: 'Todos los proyectos', id: null }, ...proyectosOpciones]}
          optionLabel="titulo"
          optionValue="id"
          onChange={(e) => onFiltroProyectoChange(e.value)}
          placeholder="Filtrar por proyecto"
          filter
          loading={proyectosOpcionesLoading}
          style={{ minWidth: '16rem' }}
        />
        <Dropdown
          value={medioFiltro}
          options={OPCIONES_MEDIO}
          onChange={(e) => onFiltroMedioChange(e.value)}
          placeholder="Filtrar por medio"
          style={{ minWidth: '14rem' }}
        />
      </div>
      {error && (
        <Message
          severity="error"
          className="mb-3 w-full"
          text={error}
          onClick={() => dispatch(limpiarErrorInteraccion())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Interacciones</h5>}
        loading={loading}
        lazy={sinFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={sinFiltro ? total : undefined}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron interacciones."
        responsiveLayout="scroll"
        dataKey="id"
        sortField="fecha"
        sortOrder={-1}
      >
        <Column field="entidad_nombre" header="Entidad" body={entidadTemplate} />
        <Column field="proyecto_asociado_titulo" header="Proyecto Asociado" body={proyectoTemplate} />
        <Column field="medio" header="Medio" body={medioTemplate} />
        <Column field="fecha" header="Fecha" body={fechaTemplate} />
        <Column field="resumen" header="Resumen" style={{ maxWidth: '20rem' }} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '8rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar interacción?"
        loading={Boolean(deletingId)}
      >
        Esta acción eliminará permanentemente el registro de interacción con{' '}
        <strong>{itemAEliminar?.entidad_nombre}</strong> del {formatearFecha(itemAEliminar?.fecha)}.
      </ConfirmationModal>
    </>
  );
};

export default InteraccionTable;