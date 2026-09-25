// src/domains/formativa/components/registroActividades/RegistroActividadesTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchRegistrosActividades,
  fetchRegistrosPorProceso,
  eliminarRegistroActividades,
  aprobarRegistroActividades,
  establecerFiltroProcesoRegistroActividades,
  limpiarErrorRegistroActividades,
} from '../../../../features/registroActividades/registroActividadesSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const RegistroActividadesTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, deletingId, transicionandoId, procesoFiltro } = useSelector(
    (state) => state.registroActividades
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [itemAAprobar, setItemAAprobar] = useState(null);
  const [procesoInput, setProcesoInput] = useState('');

  useEffect(() => {
    if (procesoFiltro) {
      dispatch(fetchRegistrosPorProceso(procesoFiltro));
    } else {
      dispatch(fetchRegistrosActividades({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, procesoFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorProceso = () => {
    dispatch(establecerFiltroProcesoRegistroActividades(procesoInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroProcesoRegistroActividades(null));
    setProcesoInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const aprobadoTemplate = (rowData) => (
    <Tag value={rowData.aprobado ? 'Aprobado' : 'Pendiente'} severity={rowData.aprobado ? 'success' : 'warning'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    return (
      <>
        {!rowData.aprobado && (
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-text p-button-warning"
            onClick={() => onEdit(rowData)}
            tooltip="Editar"
          />
        )}
        {!rowData.aprobado && (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => setItemAAprobar(rowData)}
            loading={enTransicion}
            tooltip="Aprobar"
          />
        )}
        {!rowData.aprobado && (
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
    dispatch(eliminarRegistroActividades(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAEliminar(null);
      }
    });
  };

  const handleConfirmarAprobar = () => {
    dispatch(aprobarRegistroActividades(itemAAprobar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAAprobar(null);
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
        {procesoFiltro && (
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
          onClick={() => dispatch(limpiarErrorRegistroActividades())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Registros de Actividades</h5>}
        loading={loading}
        lazy={!procesoFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={procesoFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron registros de actividades."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="proceso_titulo" header="Proceso Formativo" />
        <Column field="registrado_por_username" header="Registrado Por" />
        <Column field="tipo_periodo" header="Tipo Período" />
        <Column field="fecha_periodo" header="Fecha Período" />
        <Column field="horas_reportadas" header="Horas" />
        <Column field="nota" header="Nota" />
        <Column field="aprobado" header="Estado" body={aprobadoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '10rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar registro de actividades?"
        loading={Boolean(deletingId)}
      >
        Esta acción eliminará el registro del proceso <strong>{itemAEliminar?.proceso_titulo}</strong>.
      </ConfirmationModal>
      <ConfirmationModal
        visible={Boolean(itemAAprobar)}
        onHide={() => setItemAAprobar(null)}
        onConfirm={handleConfirmarAprobar}
        header="¿Aprobar registro de actividades?"
        loading={transicionandoId === itemAAprobar?.id}
      >
        Al aprobar se recalculará automáticamente el control de horas del proceso{' '}
        <strong>{itemAAprobar?.proceso_titulo}</strong>.
      </ConfirmationModal>
    </>
  );
};

export default RegistroActividadesTable;