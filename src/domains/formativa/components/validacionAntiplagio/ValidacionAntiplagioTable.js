// src/domains/formativa/components/validacionAntiplagio/ValidacionAntiplagioTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchValidacionesAntiplagio,
  fetchValidacionesPorInstanciaEtapa,
  establecerFiltroInstanciaEtapaValidacion,
  limpiarErrorValidacionAntiplagio,
} from '../../../../features/validacionAntiplagio/validacionAntiplagioSlice';

/**
 * Sin botón de eliminar: ValidacionAntiplagioViewSet no implementa
 * destroy() (ver hallazgo señalado antes).
 */
const ValidacionAntiplagioTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, instanciaEtapaFiltro } = useSelector(
    (state) => state.validacionAntiplagio
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [instanciaInput, setInstanciaInput] = useState('');

  useEffect(() => {
    if (instanciaEtapaFiltro) {
      dispatch(fetchValidacionesPorInstanciaEtapa(instanciaEtapaFiltro));
    } else {
      dispatch(fetchValidacionesAntiplagio({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, instanciaEtapaFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorInstancia = () => {
    dispatch(establecerFiltroInstanciaEtapaValidacion(instanciaInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroInstanciaEtapaValidacion(null));
    setInstanciaInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const aprobadoTemplate = (rowData) => (
    <Tag value={rowData.aprobado ? 'Aprobado' : 'No Aprobado'} severity={rowData.aprobado ? 'success' : 'danger'} />
  );

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '16rem' }}>
          <InputText value={instanciaInput} onChange={(e) => setInstanciaInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onBuscarPorInstancia()} placeholder="ID Instancia de Etapa" />
          <Button icon="pi pi-search" onClick={onBuscarPorInstancia} tooltip="Filtrar por instancia" />
        </div>
        {instanciaEtapaFiltro && (
          <Button label="Limpiar filtros" icon="pi pi-times" className="p-button-text p-button-sm" onClick={onLimpiarFiltros} />
        )}
      </div>
      {error && (
        <Message severity="error" className="mb-3 w-full" text={error} onClick={() => dispatch(limpiarErrorValidacionAntiplagio())} />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Validaciones de Antiplagio</h5>}
        loading={loading}
        lazy={!instanciaEtapaFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={instanciaEtapaFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron validaciones de antiplagio."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="instancia_etapa_etapa" header="Etapa" />
        <Column field="documento_nombre_documento" header="Documento" />
        <Column field="porcentaje" header="% Similitud" />
        <Column field="aprobado" header="Resultado" body={aprobadoTemplate} />
        <Column body={(rowData) => (
          <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" onClick={() => onEdit(rowData)} tooltip="Editar" />
        )} header="Acciones" style={{ width: '5rem' }} />
      </DataTable>
    </>
  );
};

export default ValidacionAntiplagioTable;