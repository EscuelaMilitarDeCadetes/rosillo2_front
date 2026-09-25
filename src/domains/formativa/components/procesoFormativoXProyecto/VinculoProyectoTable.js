// src/domains/formativa/components/procesoFormativoXProyecto/VinculoProyectoTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import {
  fetchVinculosProyecto,
  fetchVinculosPorProceso,
  eliminarVinculoProyecto,
  establecerFiltroProcesoVinculo,
  limpiarErrorVinculoProyecto,
} from '../../../../features/procesoFormativoXProyecto/procesoFormativoXProyectoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const VinculoProyectoTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, deletingId, procesoFiltro } = useSelector(
    (state) => state.procesoFormativoXProyecto
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [procesoInput, setProcesoInput] = useState('');

  useEffect(() => {
    if (procesoFiltro) {
      dispatch(fetchVinculosPorProceso(procesoFiltro));
    } else {
      dispatch(fetchVinculosProyecto({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, procesoFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorProceso = () => {
    dispatch(establecerFiltroProcesoVinculo(procesoInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroProcesoVinculo(null));
    setProcesoInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

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
    dispatch(eliminarVinculoProyecto(itemAEliminar.id)).then((result) => {
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
          onClick={() => dispatch(limpiarErrorVinculoProyecto())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Vinculaciones Proceso-Proyecto Formal</h5>}
        loading={loading}
        lazy={!procesoFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={procesoFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron vinculaciones."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="proceso_formativo_titulo" header="Proceso Formativo" />
        <Column field="proyecto_formal_titulo" header="Proyecto Formal" />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '7rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar vinculación?"
        loading={Boolean(deletingId)}
      >
        Esta acción eliminará permanentemente el vínculo entre{' '}
        <strong>{itemAEliminar?.proceso_formativo_titulo}</strong> y{' '}
        <strong>{itemAEliminar?.proyecto_formal_titulo}</strong>. No se puede deshacer.
      </ConfirmationModal>
    </>
  );
};

export default VinculoProyectoTable;