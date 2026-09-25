// src/domains/crm/components/indicadorImpacto/IndicadorImpactoTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { ProgressBar } from 'primereact/progressbar';
import {
  fetchIndicadores,
  fetchIndicadoresPorProyecto,
  fetchProyectosOpciones,
  eliminarIndicador,
  establecerFiltroProyecto,
  limpiarErrorIndicador,
} from '../../../../features/crm/indicadorImpactoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import ActualizarAvanceModal from './ActualizarAvanceModal';

const IndicadorImpactoTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const {
    items,
    total,
    loading,
    error,
    deletingId,
    proyectoFiltro,
    proyectosOpciones,
    proyectosOpcionesLoading,
  } = useSelector((state) => state.indicadorImpacto);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [itemAActualizar, setItemAActualizar] = useState(null);

  useEffect(() => {
    if (proyectosOpciones.length === 0) dispatch(fetchProyectosOpciones());
  }, [dispatch, proyectosOpciones.length]);

  useEffect(() => {
    if (proyectoFiltro) {
      dispatch(fetchIndicadoresPorProyecto(proyectoFiltro));
    } else {
      dispatch(fetchIndicadores({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, proyectoFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onFiltroChange = (value) => {
    dispatch(establecerFiltroProyecto(value));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const proyectoTemplate = (rowData) => rowData.proyecto_titulo || 'N/A';

  const progresoTemplate = (rowData) => {
    const meta = Number(rowData.valor_proyectado) || 0;
    const real = Number(rowData.valor_real) || 0;
    const porcentaje = meta > 0 ? Math.min(Math.round((real / meta) * 100), 100) : 0;
    return (
      <div style={{ minWidth: '10rem' }}>
        <div className="d-flex justify-content-between">
          <small>{real} / {meta}</small>
          <small>{porcentaje}%</small>
        </div>
        <ProgressBar value={porcentaje} showValue={false} style={{ height: '0.6rem' }} />
      </div>
    );
  };

  const accionesTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-chart-line"
        className="p-button-rounded p-button-text p-button-success"
        onClick={() => setItemAActualizar(rowData)}
        tooltip="Actualizar avance"
      />
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
    dispatch(eliminarIndicador(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAEliminar(null);
      }
    });
  };

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <Dropdown
          value={proyectoFiltro}
          options={[{ titulo: 'Todos los proyectos', id: null }, ...proyectosOpciones]}
          optionLabel="titulo"
          optionValue="id"
          onChange={(e) => onFiltroChange(e.value)}
          placeholder="Filtrar por proyecto"
          filter
          loading={proyectosOpcionesLoading}
          style={{ minWidth: '18rem' }}
        />
      </div>
      {error && (
        <Message
          severity="error"
          className="mb-3 w-full"
          text={error}
          onClick={() => dispatch(limpiarErrorIndicador())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Indicadores de Impacto</h5>}
        loading={loading}
        lazy={!proyectoFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={proyectoFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron indicadores de impacto."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="proyecto_titulo" header="Proyecto" body={proyectoTemplate} />
        <Column field="kpi_nombre" header="KPI" />
        <Column header="Avance" body={progresoTemplate} style={{ width: '14rem' }} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '10rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar indicador de impacto?"
        loading={Boolean(deletingId)}
      >
        Esta acción eliminará permanentemente el KPI <strong>{itemAEliminar?.kpi_nombre}</strong> del
        proyecto <strong>{itemAEliminar?.proyecto_titulo}</strong>.
      </ConfirmationModal>
      <ActualizarAvanceModal
        visible={Boolean(itemAActualizar)}
        onHide={() => setItemAActualizar(null)}
        item={itemAActualizar}
      />
    </>
  );
};

export default IndicadorImpactoTable;