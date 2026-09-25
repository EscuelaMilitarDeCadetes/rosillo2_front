// src/domains/formativa/components/transicionFlujo/TransicionFlujoTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchTransicionesFlujo,
  fetchTransicionesPorEtapaOrigen,
  activarTransicionFlujo,
  desactivarTransicionFlujo,
  establecerFiltroEtapaOrigenTransicion,
  limpiarErrorTransicionFlujo,
} from '../../../../features/transicionFlujo/transicionFlujoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const TransicionFlujoTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, transicionandoId, etapaOrigenFiltro } = useSelector(
    (state) => state.transicionFlujo
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemATransicion, setItemATransicion] = useState(null);
  const [etapaInput, setEtapaInput] = useState('');

  useEffect(() => {
    if (etapaOrigenFiltro) {
      dispatch(fetchTransicionesPorEtapaOrigen(etapaOrigenFiltro));
    } else {
      dispatch(fetchTransicionesFlujo({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, etapaOrigenFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorEtapaOrigen = () => {
    dispatch(establecerFiltroEtapaOrigenTransicion(etapaInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroEtapaOrigenTransicion(null));
    setEtapaInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const activoTemplate = (rowData) => (
    <Tag value={rowData.activo ? 'Activa' : 'Inactiva'} severity={rowData.activo ? 'success' : 'danger'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    return (
      <>
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" onClick={() => onEdit(rowData)} tooltip="Editar" />
        {rowData.activo ? (
          <Button
            icon="pi pi-ban"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => setItemATransicion(rowData)}
            loading={enTransicion}
            tooltip="Desactivar"
          />
        ) : (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => dispatch(activarTransicionFlujo(rowData.id))}
            loading={enTransicion}
            tooltip="Activar"
          />
        )}
      </>
    );
  };

  const handleConfirmarDesactivar = () => {
    dispatch(desactivarTransicionFlujo(itemATransicion.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') setItemATransicion(null);
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText value={etapaInput} onChange={(e) => setEtapaInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onBuscarPorEtapaOrigen()} placeholder="ID Etapa Origen" />
          <Button icon="pi pi-search" onClick={onBuscarPorEtapaOrigen} tooltip="Filtrar por etapa origen" />
        </div>
        {etapaOrigenFiltro && (
          <Button label="Limpiar filtros" icon="pi pi-times" className="p-button-text p-button-sm" onClick={onLimpiarFiltros} />
        )}
      </div>
      {error && (
        <Message severity="error" className="mb-3 w-full" text={error} onClick={() => dispatch(limpiarErrorTransicionFlujo())} />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Transiciones de Flujo</h5>}
        loading={loading}
        lazy={!etapaOrigenFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={etapaOrigenFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron transiciones de flujo."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="nombre" header="Nombre" />
        <Column field="etapa_origen_nombre" header="Etapa Origen" />
        <Column field="etapa_destino_nombre" header="Etapa Destino" />
        <Column field="accion_automatica" header="Acción Automática" />
        <Column field="orden" header="Orden" style={{ width: '6rem' }} />
        <Column field="activo" header="Estado" body={activoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '9rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemATransicion)}
        onHide={() => setItemATransicion(null)}
        onConfirm={handleConfirmarDesactivar}
        header="¿Desactivar transición de flujo?"
        loading={transicionandoId === itemATransicion?.id}
      >
        Esta acción desactivará la transición <strong>{itemATransicion?.nombre}</strong>.
      </ConfirmationModal>
    </>
  );
};

export default TransicionFlujoTable;