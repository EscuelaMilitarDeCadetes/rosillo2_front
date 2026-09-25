// src/domains/formativa/components/evaluacionProceso/EvaluacionProcesoTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchEvaluacionesProceso,
  fetchEvaluacionesPorInstanciaEtapa,
  fetchEvaluacionesPorProceso,
  fetchTercerosEvaluadores,
  establecerFiltroInstanciaEtapa,
  establecerFiltroProcesoEvaluacion,
  establecerFiltroTercerosEvaluadores,
  limpiarErrorEvaluacionProceso,
} from '../../../../features/evaluacionProceso/evaluacionProcesoSlice';


const EvaluacionProcesoTable = () => {
  const dispatch = useDispatch();
  const { items, total, loading, error, instanciaEtapaFiltro, procesoFiltro, soloTerceros } = useSelector(
    (state) => state.evaluacionProceso
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [instanciaInput, setInstanciaInput] = useState('');
  const [procesoInput, setProcesoInput] = useState('');
  const [soloTercerosInput, setSoloTercerosInput] = useState(false);

  const hayFiltroActivo = Boolean(instanciaEtapaFiltro || procesoFiltro);

  useEffect(() => {
    if (instanciaEtapaFiltro) {
      dispatch(fetchEvaluacionesPorInstanciaEtapa(instanciaEtapaFiltro));
    } else if (procesoFiltro && soloTerceros) {
      dispatch(fetchTercerosEvaluadores(procesoFiltro));
    } else if (procesoFiltro) {
      dispatch(fetchEvaluacionesPorProceso(procesoFiltro));
    } else {
      dispatch(fetchEvaluacionesProceso({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, instanciaEtapaFiltro, procesoFiltro, soloTerceros, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorInstancia = () => {
    dispatch(establecerFiltroInstanciaEtapa(instanciaInput.trim() || null));
    setProcesoInput('');
    setSoloTercerosInput(false);
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onBuscarPorProceso = () => {
    const accion = soloTercerosInput ? establecerFiltroTercerosEvaluadores : establecerFiltroProcesoEvaluacion;
    dispatch(accion(procesoInput.trim() || null));
    setInstanciaInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroInstanciaEtapa(null));
    setInstanciaInput('');
    setProcesoInput('');
    setSoloTercerosInput(false);
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const resultadoTemplate = (rowData) => (
    <Tag value={rowData.resultado} severity={rowData.aprobado ? 'success' : 'danger'} />
  );

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '16rem' }}>
          <InputText
            value={instanciaInput}
            onChange={(e) => setInstanciaInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorInstancia()}
            placeholder="ID Instancia de Etapa"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorInstancia} tooltip="Filtrar por instancia" />
        </div>
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText
            value={procesoInput}
            onChange={(e) => setProcesoInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorProceso()}
            placeholder="ID Proceso"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorProceso} tooltip="Filtrar por proceso" />
        </div>
        <div className="flex align-items-center gap-2">
          <Checkbox
            inputId="soloTerceros"
            checked={soloTercerosInput}
            onChange={(e) => setSoloTercerosInput(e.checked)}
            disabled={!procesoInput.trim()}
          />
          <label htmlFor="soloTerceros">Solo terceros evaluadores</label>
        </div>
        {hayFiltroActivo && (
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
          onClick={() => dispatch(limpiarErrorEvaluacionProceso())}
        />
      )}
      <DataTable
        value={items}
        header={
          <h5 className="m-0">
            Evaluaciones de Proceso{soloTerceros && procesoFiltro ? ' — Terceros Evaluadores' : ''}
          </h5>
        }
        loading={loading}
        lazy={!hayFiltroActivo}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={hayFiltroActivo ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron evaluaciones de proceso."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="evaluador_nombre_completo" header="Evaluador" />
        <Column field="evaluador_rol_en_modalidad" header="Rol" />
        <Column field="instancia_etapa_etapa_nombre" header="Etapa" />
        <Column field="concepto" header="Concepto" />
        <Column field="nota" header="Nota" />
        <Column field="peso" header="Peso" />
        <Column field="resultado" header="Resultado" body={resultadoTemplate} />
        <Column field="fecha_evaluacion" header="Fecha" />
      </DataTable>
    </>
  );
};

export default EvaluacionProcesoTable;