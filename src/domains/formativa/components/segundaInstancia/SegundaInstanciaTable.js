// src/domains/formativa/components/segundaInstancia/SegundaInstanciaTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchSegundasInstancias,
  fetchSegundasInstanciasActivadasPendientes,
  eliminarSegundaInstancia,
  activarSegundaInstanciaDirecto,
  consumirSegundaInstancia,
  establecerFiltroPendientesSegundaInstancia,
  limpiarErrorSegundaInstancia,
} from '../../../../features/segundaInstancia/segundaInstanciaSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import SolicitarActivacionDecanoModal from './SolicitarActivacionDecanoModal';
import DecisionDecanoActivacionModal from './DecisionActivacionDecanoModal';
import AprobacionesPendientesTable from '../../../common/components/aprobacion/AprobacionesPendientesTable';

const SegundaInstanciaTable = () => {
  const dispatch = useDispatch();
  const { items, total, loading, error, deletingId, transicionandoId, pendientesActivo } = useSelector(
    (state) => state.segundaInstancia
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [itemASolicitar, setItemASolicitar] = useState(null);
  const [isBandejaVisible, setIsBandejaVisible] = useState(false);
  const [aprobacionSeleccionada, setAprobacionSeleccionada] = useState(null);

  useEffect(() => {
    if (pendientesActivo) {
      dispatch(fetchSegundasInstanciasActivadasPendientes());
    } else {
      dispatch(fetchSegundasInstancias({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, pendientesActivo, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const estadoTemplate = (rowData) => {
    if (rowData.consumida) return <Tag value="Consumida" severity="secondary" />;
    if (rowData.activada) return <Tag value="Activada" severity="warning" />;
    return <Tag value="Sin activar" severity="info" />;
  };

  const activaTemplate = (rowData) => (
    <Tag value={rowData.activa ? 'Vigente' : 'Desactivada'} severity={rowData.activa ? 'success' : 'danger'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    return (
      <>
        {rowData.activa && !rowData.activada && (
          <Button icon="pi pi-check-circle" className="p-button-rounded p-button-text p-button-success" onClick={() => dispatch(activarSegundaInstanciaDirecto(rowData.id))} loading={enTransicion} tooltip="Activar (Decano/Soporte)" />
        )}
        {rowData.activa && !rowData.activada && (
          <Button icon="pi pi-share-alt" className="p-button-rounded p-button-text p-button-help" onClick={() => setItemASolicitar(rowData)} tooltip="Solicitar activación al Decano (Facultad)" />
        )}
        {rowData.activada && !rowData.consumida && (
          <Button icon="pi pi-flag-fill" className="p-button-rounded p-button-text p-button-info" onClick={() => dispatch(consumirSegundaInstancia(rowData.id))} loading={enTransicion} tooltip="Marcar consumida" />
        )}
        {rowData.activa && (
          <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => setItemAEliminar(rowData)} tooltip="Desactivar" />
        )}
      </>
    );
  };

  const handleConfirmarEliminar = () => {
    dispatch(eliminarSegundaInstancia(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') setItemAEliminar(null);
    });
  };

  const handleSeleccionarAprobacion = (aprobacion) => {
    setIsBandejaVisible(false);
    setAprobacionSeleccionada(aprobacion);
  };

  return (
    <>
      <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
        <Button
          label="Decisión del Decano"
          icon="pi pi-briefcase"
          className="p-button-outlined p-button-sm"
          onClick={() => setIsBandejaVisible(true)}
        />
        <Button
          label={pendientesActivo ? 'Ver todas' : 'Ver activadas pendientes'}
          icon="pi pi-clock"
          className="p-button-outlined p-button-sm"
          onClick={() => {
            dispatch(establecerFiltroPendientesSegundaInstancia(!pendientesActivo));
            setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
          }}
        />
      </div>
      {error && (
        <Message severity="error" className="mb-3 w-full" text={error} onClick={() => dispatch(limpiarErrorSegundaInstancia())} />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Segundas Instancias</h5>}
        loading={loading}
        lazy={!pendientesActivo}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={pendientesActivo ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron segundas instancias."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="proceso_titulo" header="Proceso Formativo" />
        <Column field="tipo" header="Tipo" />
        <Column field="motivo" header="Motivo" />
        <Column field="nota_maxima" header="Nota Máxima" />
        <Column header="Progreso" body={estadoTemplate} />
        <Column field="activa" header="Vigencia" body={activaTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '12rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Desactivar segunda instancia?"
        loading={Boolean(deletingId)}
      >
        Esta acción desactivará la segunda instancia del proceso <strong>{itemAEliminar?.proceso_titulo}</strong>.
      </ConfirmationModal>
      {itemASolicitar && (
        <SolicitarActivacionDecanoModal visible={Boolean(itemASolicitar)} onHide={() => setItemASolicitar(null)} segundaInstancia={itemASolicitar} />
      )}
      {/* Paso 1: bandeja navegable, sin ID manual */}
      <Dialog
        header="Activaciones de segunda instancia pendientes de tu decisión"
        visible={isBandejaVisible}
        style={{ width: '50vw' }}
        onHide={() => setIsBandejaVisible(false)}
      >
        <AprobacionesPendientesTable
          filtroTipoDocumento="APROBACION_SEGUNDA_INSTANCIA"
          onSeleccionar={handleSeleccionarAprobacion}
        />
      </Dialog>
      {/* Paso 2: decisión sobre la Aprobacion ya elegida */}
      <DecisionDecanoActivacionModal
        visible={Boolean(aprobacionSeleccionada)}
        onHide={() => setAprobacionSeleccionada(null)}
        aprobacion={aprobacionSeleccionada}
      />
    </>
  );
};

export default SegundaInstanciaTable;