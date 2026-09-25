// src/domains/formativa/components/reglaFlujo/ReglaFlujoTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchReglasFlujo,
  fetchReglasPorTransicion,
  activarReglaFlujo,
  desactivarReglaFlujo,
  establecerFiltroTransicion,
  limpiarErrorReglaFlujo,
} from '../../../../features/reglaFlujo/reglaFlujoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

/**
 * Usa el toggle activar/desactivar, ya que destroy() y 
 * desactivar() hacen exactamente lo mismo en el backend.
 */
const ReglaFlujoTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, transicionandoId, transicionFiltro } = useSelector(
    (state) => state.reglaFlujo
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemATransicion, setItemATransicion] = useState(null);
  const [etapaOrigenInput, setEtapaOrigenInput] = useState('');
  const [etapaDestinoInput, setEtapaDestinoInput] = useState('');

  useEffect(() => {
    if (transicionFiltro) {
      dispatch(fetchReglasPorTransicion(transicionFiltro));
    } else {
      dispatch(fetchReglasFlujo({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, transicionFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorTransicion = () => {
    if (!etapaOrigenInput.trim() || !etapaDestinoInput.trim()) return;
    dispatch(
      establecerFiltroTransicion({
        etapaOrigenId: etapaOrigenInput.trim(),
        etapaDestinoId: etapaDestinoInput.trim(),
      })
    );
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroTransicion(null));
    setEtapaOrigenInput('');
    setEtapaDestinoInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const activaTemplate = (rowData) => (
    <Tag value={rowData.activa ? 'Activa' : 'Inactiva'} severity={rowData.activa ? 'success' : 'danger'} />
  );

  const bloqueanteTemplate = (rowData) => (
    <Tag value={rowData.bloqueante ? 'Sí' : 'No'} severity={rowData.bloqueante ? 'danger' : 'info'} />
  );

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
        {rowData.activa ? (
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
            onClick={() => dispatch(activarReglaFlujo(rowData.id))}
            loading={enTransicion}
            tooltip="Activar"
          />
        )}
      </>
    );
  };

  const handleConfirmarDesactivar = () => {
    dispatch(desactivarReglaFlujo(itemATransicion.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemATransicion(null);
      }
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '10rem' }}>
          <InputText
            value={etapaOrigenInput}
            onChange={(e) => setEtapaOrigenInput(e.target.value)}
            placeholder="ID Etapa Origen"
          />
        </div>
        <div className="p-inputgroup" style={{ maxWidth: '10rem' }}>
          <InputText
            value={etapaDestinoInput}
            onChange={(e) => setEtapaDestinoInput(e.target.value)}
            placeholder="ID Etapa Destino"
          />
        </div>
        <Button icon="pi pi-search" onClick={onBuscarPorTransicion} tooltip="Filtrar por transición" />
        {transicionFiltro && (
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
          onClick={() => dispatch(limpiarErrorReglaFlujo())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Reglas de Flujo</h5>}
        loading={loading}
        lazy={!transicionFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={transicionFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron reglas de flujo."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="nombre" header="Nombre" />
        <Column field="etapa_origen_nombre" header="Etapa Origen" />
        <Column field="etapa_destino_nombre" header="Etapa Destino" />
        <Column field="tipo_regla" header="Tipo" />
        <Column field="prioridad" header="Prioridad" />
        <Column field="bloqueante" header="Bloqueante" body={bloqueanteTemplate} />
        <Column field="activa" header="Estado" body={activaTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '9rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemATransicion)}
        onHide={() => setItemATransicion(null)}
        onConfirm={handleConfirmarDesactivar}
        header="¿Desactivar regla de flujo?"
        loading={transicionandoId === itemATransicion?.id}
      >
        Esta acción desactivará la regla <strong>{itemATransicion?.nombre}</strong>.
      </ConfirmationModal>
    </>
  );
};

export default ReglaFlujoTable;