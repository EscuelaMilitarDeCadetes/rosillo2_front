// src/domains/formativa/components/etapaFlujo/EtapaFlujoTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchEtapasFlujo,
  fetchEtapasPorFlujo,
  activarEtapaFlujo,
  desactivarEtapaFlujo,
  establecerFiltroFlujoEtapa,
  limpiarErrorEtapaFlujo,
} from '../../../../features/etapaFlujo/etapaFlujoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const EtapaFlujoTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, transicionandoId, flujoFiltro } = useSelector(
    (state) => state.etapaFlujo
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemATransicion, setItemATransicion] = useState(null);
  const [flujoInput, setFlujoInput] = useState('');

  useEffect(() => {
    if (flujoFiltro) {
      dispatch(fetchEtapasPorFlujo(flujoFiltro));
    } else {
      dispatch(fetchEtapasFlujo({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, flujoFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorFlujo = () => {
    dispatch(establecerFiltroFlujoEtapa(flujoInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroFlujoEtapa(null));
    setFlujoInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const activoTemplate = (rowData) => (
    <Tag value={rowData.activo ? 'Activa' : 'Inactiva'} severity={rowData.activo ? 'success' : 'danger'} />
  );

  const finalTemplate = (rowData) => (rowData.es_final ? <Tag value="Final" severity="info" /> : null);

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    return (
      <>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-warning"
          onClick={() => onEdit(rowData)}
          tooltip="Editar"
        />
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
            onClick={() => dispatch(activarEtapaFlujo(rowData.id))}
            loading={enTransicion}
            tooltip="Activar"
          />
        )}
      </>
    );
  };

  const handleConfirmarDesactivar = () => {
    dispatch(desactivarEtapaFlujo(itemATransicion.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemATransicion(null);
      }
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText
            value={flujoInput}
            onChange={(e) => setFlujoInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorFlujo()}
            placeholder="ID Flujo de Proceso"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorFlujo} tooltip="Filtrar por flujo" />
        </div>
        {flujoFiltro && (
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
          onClick={() => dispatch(limpiarErrorEtapaFlujo())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Etapas de Flujo</h5>}
        loading={loading}
        lazy={!flujoFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={flujoFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron etapas de flujo."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="orden" header="Orden" style={{ width: '5rem' }} />
        <Column field="nombre" header="Nombre" />
        <Column field="flujo_nombre" header="Flujo" />
        <Column field="tipo_etapa" header="Tipo" />
        <Column field="rol_responsable" header="Rol Responsable" />
        <Column header="" body={finalTemplate} style={{ width: '5rem' }} />
        <Column field="activo" header="Estado" body={activoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '9rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemATransicion)}
        onHide={() => setItemATransicion(null)}
        onConfirm={handleConfirmarDesactivar}
        header="¿Desactivar etapa de flujo?"
        loading={transicionandoId === itemATransicion?.id}
      >
        Esta acción desactivará la etapa <strong>{itemATransicion?.nombre}</strong>.
      </ConfirmationModal>
    </>
  );
};

export default EtapaFlujoTable;