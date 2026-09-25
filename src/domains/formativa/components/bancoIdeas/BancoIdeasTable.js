// src/domains/formativa/components/bancoIdeas/BancoIdeasTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchBancoIdeas,
  fetchBancoIdeasPorFacultad,
  fetchBancoIdeasDisponibles,
  eliminarBancoIdea,
  separarBancoIdea,
  tomarBancoIdea,
  liberarBancoIdea,
  establecerFiltroFacultadIdea,
  establecerFiltroDisponiblesIdea,
  limpiarFiltrosBancoIdeas,
  limpiarErrorBancoIdeas,
} from '../../../../features/bancoIdeas/bancoIdeasSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const SEVERIDAD_ESTADO = {
  DISPONIBLE: 'success',
  SEPARADA: 'warning',
  TOMADA: 'info',
  ELIMINADA: 'danger',
};

const OPCIONES_ESTADO = [
  { label: 'Todos los estados', value: null },
  { label: 'Disponible', value: 'DISPONIBLE' },
  { label: 'Separada', value: 'SEPARADA' },
  { label: 'Tomada', value: 'TOMADA' },
];

const BancoIdeasTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const {
    items,
    total,
    loading,
    error,
    deletingId,
    transicionandoId,
    facultadFiltro,
    estadoFiltro,
    disponiblesActivo,
  } = useSelector((state) => state.bancoIdeas);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [facultadInput, setFacultadInput] = useState('');
  const [estadoInput, setEstadoInput] = useState(null);

  const hayFiltroActivo = Boolean(facultadFiltro || disponiblesActivo);

  useEffect(() => {
    if (disponiblesActivo) {
      dispatch(fetchBancoIdeasDisponibles(facultadFiltro));
    } else if (facultadFiltro) {
      dispatch(fetchBancoIdeasPorFacultad({ facultadId: facultadFiltro, estado: estadoFiltro }));
    } else {
      dispatch(fetchBancoIdeas({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, facultadFiltro, estadoFiltro, disponiblesActivo, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorFacultad = () => {
    dispatch(
      establecerFiltroFacultadIdea({ facultadId: facultadInput.trim() || null, estado: estadoInput })
    );
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onVerDisponibles = () => {
    dispatch(establecerFiltroDisponiblesIdea(facultadInput.trim() || null));
    setEstadoInput(null);
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(limpiarFiltrosBancoIdeas());
    setFacultadInput('');
    setEstadoInput(null);
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const estadoTemplate = (rowData) => (
    <Tag value={rowData.estado} severity={SEVERIDAD_ESTADO[rowData.estado] || 'info'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    const puedeEliminar = rowData.estado !== 'TOMADA' && rowData.estado !== 'ELIMINADA';
    return (
      <>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-warning"
          onClick={() => onEdit(rowData)}
          tooltip="Editar"
        />
        {rowData.estado === 'DISPONIBLE' && (
          <Button
            icon="pi pi-bookmark"
            className="p-button-rounded p-button-text p-button-info"
            onClick={() => dispatch(separarBancoIdea(rowData.id))}
            loading={enTransicion}
            tooltip="Separar"
          />
        )}
        {(rowData.estado === 'DISPONIBLE' || rowData.estado === 'SEPARADA') && (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => dispatch(tomarBancoIdea(rowData.id))}
            loading={enTransicion}
            tooltip="Tomar"
          />
        )}
        {rowData.estado === 'SEPARADA' && (
          <Button
            icon="pi pi-replay"
            className="p-button-rounded p-button-text p-button-secondary"
            onClick={() => dispatch(liberarBancoIdea(rowData.id))}
            loading={enTransicion}
            tooltip="Liberar"
          />
        )}
        {puedeEliminar && (
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
    dispatch(eliminarBancoIdea(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAEliminar(null);
      }
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText
            value={facultadInput}
            onChange={(e) => setFacultadInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorFacultad()}
            placeholder="ID Facultad"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorFacultad} tooltip="Filtrar por facultad" />
        </div>
        <Dropdown
          value={estadoInput}
          options={OPCIONES_ESTADO}
          onChange={(e) => setEstadoInput(e.value)}
          placeholder="Estado"
          style={{ minWidth: '12rem' }}
          disabled={!facultadInput.trim()}
        />
        <Button
          label="Ver disponibles"
          icon="pi pi-eye"
          className="p-button-outlined p-button-sm"
          onClick={onVerDisponibles}
        />
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
          onClick={() => dispatch(limpiarErrorBancoIdeas())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Banco de Ideas</h5>}
        loading={loading}
        lazy={!hayFiltroActivo}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={hayFiltroActivo ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron ideas en el banco."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="idea" header="Idea" />
        <Column field="facultad_nombre" header="Facultad" />
        <Column field="linea_investigacion" header="Línea de Investigación" />
        <Column field="palabras_clave" header="Palabras Clave" />
        <Column field="estado" header="Estado" body={estadoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '12rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar idea del banco?"
        loading={Boolean(deletingId)}
      >
        Esta acción eliminará permanentemente <strong>{itemAEliminar?.idea}</strong>.
        No será posible si la idea ya fue tomada por un estudiante.
      </ConfirmationModal>
    </>
  );
};

export default BancoIdeasTable;