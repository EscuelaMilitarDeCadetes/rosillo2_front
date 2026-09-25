// src/domains/formativa/components/revision/RevisionTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchRevisiones,
  fetchRevisionesPorInstanciaEtapa,
  establecerFiltroInstanciaEtapaRevision,
  limpiarErrorRevision,
} from '../../../../features/revision/revisionSlice';

// Sin columna de acciones: Revision es append-only, no hay editar ni eliminar.
const RevisionTable = () => {
  const dispatch = useDispatch();
  const { items, total, loading, error, instanciaEtapaFiltro } = useSelector((state) => state.revision);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [instanciaInput, setInstanciaInput] = useState('');

  useEffect(() => {
    if (instanciaEtapaFiltro) {
      dispatch(fetchRevisionesPorInstanciaEtapa(instanciaEtapaFiltro));
    } else {
      dispatch(fetchRevisiones({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, instanciaEtapaFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorInstancia = () => {
    dispatch(establecerFiltroInstanciaEtapaRevision(instanciaInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroInstanciaEtapaRevision(null));
    setInstanciaInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const aprobadoTemplate = (rowData) => (
    <Tag value={rowData.aprobado ? 'Aprobada' : 'No Aprobada'} severity={rowData.aprobado ? 'success' : 'danger'} />
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
        <Message severity="error" className="mb-3 w-full" text={error} onClick={() => dispatch(limpiarErrorRevision())} />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Revisiones</h5>}
        loading={loading}
        lazy={!instanciaEtapaFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={instanciaEtapaFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron revisiones."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="instancia_etapa_etapa" header="Etapa" />
        <Column field="version" header="Versión" style={{ width: '6rem' }} />
        <Column field="observaciones" header="Observaciones" />
        <Column field="aprobado" header="Resultado" body={aprobadoTemplate} />
        <Column field="fecha" header="Fecha" body={(r) => new Date(r.fecha).toLocaleString('es-CO')} />
      </DataTable>
    </>
  );
};

export default RevisionTable;