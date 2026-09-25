// src/domains/formativa/components/instanciaEtapa/InstanciaEtapaTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchInstanciasEtapa,
  fetchInstanciasPorProceso,
  iniciarInstanciaEtapa,
  aprobarInstanciaEtapa,
  rechazarInstanciaEtapa,
  marcarSegundaInstancia,
  establecerFiltroProcesoInstancia,
  limpiarErrorInstanciaEtapa,
} from '../../../../features/instanciaEtapa/instanciaEtapaSlice';
import InstanciaEtapaFormModal from './InstanciaEtapaFormModal';

const SEVERIDAD_ESTADO = {
  PENDIENTE: 'secondary',
  EN_PROCESO: 'warning',
  APROBADO: 'success',
  RECHAZADO: 'danger',
  SEGUNDA_INSTANCIA: 'info',
};


const InstanciaEtapaTable = () => {
  const dispatch = useDispatch();
  const { items, total, loading, error, transicionandoId, procesoFiltro } = useSelector(
    (state) => state.instanciaEtapa
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [procesoInput, setProcesoInput] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    if (procesoFiltro) {
      dispatch(fetchInstanciasPorProceso(procesoFiltro));
    } else {
      dispatch(fetchInstanciasEtapa({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, procesoFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorProceso = () => {
    dispatch(establecerFiltroProcesoInstancia(procesoInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroProcesoInstancia(null));
    setProcesoInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const estadoTemplate = (rowData) => (
    <Tag value={rowData.estado} severity={SEVERIDAD_ESTADO[rowData.estado] || 'info'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    const permitidas = rowData.transiciones_permitidas || [];
    return (
      <>
        {permitidas.includes('EN_PROCESO') && rowData.estado === 'PENDIENTE' && (
          <Button
            icon="pi pi-play"
            className="p-button-rounded p-button-text p-button-info"
            onClick={() => dispatch(iniciarInstanciaEtapa(rowData.id))}
            loading={enTransicion}
            tooltip="Iniciar"
          />
        )}
        {permitidas.includes('EN_PROCESO') && rowData.estado === 'RECHAZADO' && (
          <Button
            icon="pi pi-refresh"
            className="p-button-rounded p-button-text p-button-info"
            onClick={() => dispatch(iniciarInstanciaEtapa(rowData.id))}
            loading={enTransicion}
            tooltip="Reintentar (volver a En Proceso)"
          />
        )}
        {permitidas.includes('APROBADO') && (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => dispatch(aprobarInstanciaEtapa(rowData.id))}
            loading={enTransicion}
            tooltip="Aprobar"
          />
        )}
        {permitidas.includes('RECHAZADO') && (
          <Button
            icon="pi pi-times-circle"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => dispatch(rechazarInstanciaEtapa(rowData.id))}
            loading={enTransicion}
            tooltip="Rechazar"
          />
        )}
        {permitidas.includes('SEGUNDA_INSTANCIA') && (
          <Button
            icon="pi pi-replay"
            className="p-button-rounded p-button-text p-button-warning"
            onClick={() => dispatch(marcarSegundaInstancia(rowData.id))}
            loading={enTransicion}
            tooltip="Pasar a segunda instancia"
          />
        )}
      </>
    );
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <Button label="Nueva Instancia" icon="pi pi-plus" onClick={() => setIsFormVisible(true)} />
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
          onClick={() => dispatch(limpiarErrorInstanciaEtapa())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Instancias de Etapa</h5>}
        loading={loading}
        lazy={!procesoFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={procesoFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron instancias de etapa."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="proceso_titulo" header="Proceso Formativo" />
        <Column field="etapa_nombre" header="Etapa" />
        <Column field="fecha_inicio" header="Fecha Inicio" />
        <Column field="fecha_fin" header="Fecha Fin" />
        <Column field="estado" header="Estado" body={estadoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '12rem' }} />
      </DataTable>
      <InstanciaEtapaFormModal visible={isFormVisible} onHide={() => setIsFormVisible(false)} />
    </>
  );
};

export default InstanciaEtapaTable;