// src/domains/formativa/components/procesoFormativo/ProcesoFormativoTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchProcesosFormativos,
  buscarProcesosFormativos,
  eliminarProcesoFormativo,
  activarSegundaInstanciaProceso,
  establecerModoLista,
  establecerModoActivos,
  descargarProcesosExcel,
  descargarProcesosPdf,
  limpiarErrorProcesoFormativo,
} from '../../../../features/procesoFormativo/procesoFormativoSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import BuscarProcesosPanel from './BuscarProcesosPanel';
import CalificarProcesoModal from './CalificarProcesoModal';
import AvanceProcesoModal from './AvanceProcesoModal';

const SEVERIDAD_APROBADO = { true: 'success', false: 'danger', null: 'warning' };

const ProcesoFormativoTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const {
    items: itemsLista,
    total: totalLista,
    loading: loadingLista,
    error,
    deletingId,
    transicionandoId,
    modoVista,
    filtrosBusqueda,
  } = useSelector((state) => state.procesoFormativo);
  const {
    items: itemsActivos,
    total: totalActivos,
    loading: loadingActivos,
  } = useSelector((state) => state.procesosInvFormativa);

  const items = modoVista === 'activos' ? itemsActivos : itemsLista;
  const total = modoVista === 'activos' ? totalActivos : totalLista;
  const loading = modoVista === 'activos' ? loadingActivos : loadingLista;
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [itemACalificar, setItemACalificar] = useState(null);
  const [itemAvance, setItemAvance] = useState(null);
  const [descargando, setDescargando] = useState(false);

  const esPaginado = modoVista === 'lista' || modoVista === 'busqueda';

  useEffect(() => {
    if (modoVista === 'activos') {
      dispatch(fetchProcesosActivos());
    } else if (modoVista === 'busqueda') {
      dispatch(buscarProcesosFormativos({ filtros: filtrosBusqueda, page: lazyParams.page, pageSize: lazyParams.rows }));
    } else {
      dispatch(fetchProcesosFormativos({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, modoVista, filtrosBusqueda, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const [descargaError, setDescargaError] = useState('');

  const handleDescargar = async (formato) => {
    setDescargando(true);
    setDescargaError('');
    try {
      await (formato === 'excel' ? descargarProcesosExcel(filtrosBusqueda) : descargarProcesosPdf(filtrosBusqueda));
    } catch (err) {
      setDescargaError(err.message);
    } finally {
      setDescargando(false);
    }
  };

  const aprobadoTemplate = (rowData) => {
    const label = rowData.aprobado === null ? 'Sin calificar' : rowData.aprobado ? 'Aprobado' : 'No aprobado';
    return <Tag value={label} severity={SEVERIDAD_APROBADO[String(rowData.aprobado)]} />;
  };

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    const esFinalizado = rowData.estado_actual === 'FINALIZADO';
    const puedeSegundaInstancia =
      rowData.permite_segunda_instancia && rowData.aprobado === false && !rowData.segunda_instancia_consumida;
    return (
      <>
        {!esFinalizado && (
          <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" onClick={() => onEdit(rowData)} tooltip="Editar" />
        )}
        <Button icon="pi pi-chart-line" className="p-button-rounded p-button-text p-button-info" onClick={() => setItemAvance(rowData)} tooltip="Ver avance" />
        {rowData.aprobado === null && (
          <Button icon="pi pi-verified" className="p-button-rounded p-button-text p-button-success" onClick={() => setItemACalificar(rowData)} tooltip="Calificar" />
        )}
        {puedeSegundaInstancia && (
          <Button
            icon="pi pi-replay"
            className="p-button-rounded p-button-text p-button-warning"
            onClick={() => dispatch(activarSegundaInstanciaProceso(rowData.id))}
            loading={enTransicion}
            tooltip="Activar segunda instancia"
          />
        )}
        {rowData.activo && (
          <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => setItemAEliminar(rowData)} tooltip="Desactivar" />
        )}
      </>
    );
  };

  const handleConfirmarEliminar = () => {
    dispatch(eliminarProcesoFormativo(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') setItemAEliminar(null);
    });
  };

  return (
    <>
      <BuscarProcesosPanel />
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <Button
          label={modoVista === 'activos' ? 'Ver todos' : 'Ver solo activos'}
          icon="pi pi-filter"
          className="p-button-outlined p-button-sm"
          onClick={() => dispatch(modoVista === 'activos' ? establecerModoLista() : establecerModoActivos())}
        />
        <Button label="Excel" icon="pi pi-file-excel" className="p-button-outlined p-button-sm p-button-success" onClick={() => handleDescargar('excel')} loading={descargando} />
        <Button label="PDF" icon="pi pi-file-pdf" className="p-button-outlined p-button-sm p-button-danger" onClick={() => handleDescargar('pdf')} loading={descargando} />
      </div>
      {error && (
        <Message severity="error" className="mb-3 w-full" text={error} onClick={() => dispatch(limpiarErrorProcesoFormativo())} />
      )}
      {descargaError && (
        <Message severity="error" className="mb-3 w-full" text={descargaError} />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Procesos Formativos</h5>}
        loading={loading}
        lazy={esPaginado}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={esPaginado ? total : undefined}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron procesos formativos."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="titulo" header="Título" />
        <Column field="flujo_version_nombre" header="Flujo" />
        <Column field="estado_actual" header="Etapa Actual" />
        <Column field="fecha_inicio" header="Fecha Inicio" />
        <Column field="fecha_fin" header="Fecha Fin" />
        <Column field="nota_final" header="Nota Final" />
        <Column header="Calificación" body={aprobadoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '13rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Desactivar proceso formativo?"
        loading={Boolean(deletingId)}
      >
        Esta acción desactivará <strong>{itemAEliminar?.titulo}</strong>.
      </ConfirmationModal>
      {itemACalificar && (
        <CalificarProcesoModal visible={Boolean(itemACalificar)} onHide={() => setItemACalificar(null)} proceso={itemACalificar} />
      )}
      {itemAvance && (
        <AvanceProcesoModal visible={Boolean(itemAvance)} onHide={() => setItemAvance(null)} proceso={itemAvance} />
      )}
    </>
  );
};

export default ProcesoFormativoTable;