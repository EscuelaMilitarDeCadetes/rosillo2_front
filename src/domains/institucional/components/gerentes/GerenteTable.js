// src/domains/institucional/components/gerentes/GerenteTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import {
  fetchGerentes,
  fetchGerenteActual,
  fetchHistoricoGerentes,
  finalizarGerente,
  eliminarGerente,
} from '../../../../features/gerentes/gerentesSlice';
import NewGerenteModal from './NewGerenteModal';
import EditGerenteModal from './EditGerenteModal';
import { fetchCatalogosInstitucionales } from '../../../../features/metadata/metadataSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const PAGE_SIZE = 10;

const GerenteTable = () => {
  const dispatch = useDispatch();
  const { items, total, loading, actual, actualLoading, historico, historicoLoading, saving } = useSelector(
    (state) => state.gerentes
  );
  const { roles } = useSelector((state) => state.auth);
  const puedeGestionar = roles?.includes('SOPORTE') || roles?.includes('CINTERNO');

  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [isNewModalVisible, setIsNewModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [finalizarTarget, setFinalizarTarget] = useState(null);
  const [eliminarTarget, setEliminarTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchGerenteActual());
    dispatch(fetchHistoricoGerentes());
    dispatch(fetchGerentes({ page: 1, pageSize: PAGE_SIZE }));
    dispatch(fetchCatalogosInstitucionales());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const onPage = (event) => {
    const nuevaPagina = event.page + 1;
    setPage(nuevaPagina);
    dispatch(fetchGerentes({ page: nuevaPagina, pageSize: PAGE_SIZE }));
  };

  const estadoBodyTemplate = (rowData) => (
    <Tag severity={rowData.estado ? 'success' : 'danger'} value={rowData.estado ? 'Vigente' : 'Finalizado'} />
  );

  const accionesBodyTemplate = (rowData) => {
    if (!puedeGestionar) return null;
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-secondary p-button-sm"
          tooltip="Editar fechas"
          onClick={() => setEditTarget(rowData)}
        />
        {rowData.estado && (
          <Button
            icon="pi pi-flag"
            className="p-button-rounded p-button-warning p-button-sm"
            tooltip="Finalizar gerencia"
            onClick={() => setFinalizarTarget(rowData)}
          />
        )}
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          tooltip="Eliminar registro (corrección)"
          onClick={() => setEliminarTarget(rowData)}
        />
      </div>
    );
  };

  const columnas = (
    <>
      <Column field="persona_nombre" header="Gerente" sortable />
      <Column field="persona_documento" header="Documento" />
      <Column field="fecha_ingreso" header="Fecha Ingreso" sortable />
      <Column field="fecha_salida" header="Fecha Salida" sortable />
      <Column header="Estado" body={estadoBodyTemplate} sortable sortField="estado" />
      <Column header="Acciones" body={accionesBodyTemplate} />
    </>
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Gestión de Gerentes</h5>
        {puedeGestionar && (
          <Button label="Asignar Nuevo Gerente" icon="pi pi-plus" onClick={() => setIsNewModalVisible(true)} />
        )}
      </div>

      {actual && (
        <div className="alert alert-primary">
          Gerente actual: <strong>{actual.persona_nombre}</strong> (desde {actual.fecha_ingreso})
        </div>
      )}
      {!actualLoading && !actual && <div className="alert alert-secondary">No hay un gerente vigente actualmente.</div>}

      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        <TabPanel header="Todos (paginado)">
          <DataTable
            value={items}
            loading={loading}
            lazy
            paginator
            rows={PAGE_SIZE}
            totalRecords={total}
            first={(page - 1) * PAGE_SIZE}
            onPage={onPage}
            emptyMessage="No se encontraron registros de gerencia."
            responsiveLayout="scroll"
          >
            {columnas}
          </DataTable>
        </TabPanel>
        <TabPanel header="Histórico completo">
          <DataTable
            value={historico}
            loading={historicoLoading}
            paginator
            rows={10}
            emptyMessage="No hay histórico de gerentes."
            responsiveLayout="scroll"
          >
            {columnas}
          </DataTable>
        </TabPanel>
      </TabView>

      <NewGerenteModal visible={isNewModalVisible} onHide={() => setIsNewModalVisible(false)} gerenteActual={actual} />
      <EditGerenteModal visible={!!editTarget} onHide={() => setEditTarget(null)} gerente={editTarget} />

      <ConfirmationModal
        visible={!!finalizarTarget}
        onHide={() => setFinalizarTarget(null)}
        loading={saving}
        header="Finalizar Gerencia"
        onConfirm={() =>
          dispatch(finalizarGerente({ id: finalizarTarget.id })).then((result) => {
            if (finalizarGerente.fulfilled.match(result)) setFinalizarTarget(null);
          })
        }
      >
        ¿Deseas finalizar la gerencia de <strong>{finalizarTarget?.persona_nombre}</strong>? El cargo quedará
        vacante a partir de hoy.
      </ConfirmationModal>

      <ConfirmationModal
        visible={!!eliminarTarget}
        onHide={() => setEliminarTarget(null)}
        loading={saving}
        header="Eliminar Registro de Gerencia"
        onConfirm={() =>
          dispatch(eliminarGerente(eliminarTarget.id)).then((result) => {
            if (eliminarGerente.fulfilled.match(result)) setEliminarTarget(null);
          })
        }
      >
        Esta acción desactiva (soft-delete) el registro de <strong>{eliminarTarget?.persona_nombre}</strong>.
        Úsala solo para corregir registros creados por error, no para representar el fin natural de una gestión
        (para eso usa "Finalizar").
      </ConfirmationModal>
    </>
  );
};

export default GerenteTable;