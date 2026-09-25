// src/domains/formativa/components/eventoEvaluativo/EventoEvaluativoTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchEventosEvaluativos,
  fetchEventosPorProceso,
  fetchEventosProximos,
  eliminarEventoEvaluativo,
  establecerFiltroProcesoEvento,
  establecerFiltroProximas,
  limpiarFiltrosEventoEvaluativo,
  limpiarErrorEventoEvaluativo,
} from '../../../../features/eventoEvaluativo/eventoEvaluativoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import ReprogramarEventoModal from './ReprogramarEventoModal';
import RegistrarResultadoModal from './RegistrarResultadoModal';
import CargarActaModal from './CargarActaModal';

const EventoEvaluativoTable = () => {
  const dispatch = useDispatch();
  const { items, total, loading, error, deletingId, procesoFiltro, proximasActivo } = useSelector(
    (state) => state.eventoEvaluativo
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [itemAReprogramar, setItemAReprogramar] = useState(null);
  const [itemAResultado, setItemAResultado] = useState(null);
  const [itemAActa, setItemAActa] = useState(null);
  const [procesoInput, setProcesoInput] = useState('');

  const hayFiltroActivo = Boolean(procesoFiltro || proximasActivo);

  useEffect(() => {
    if (proximasActivo) {
      dispatch(fetchEventosProximos(procesoFiltro));
    } else if (procesoFiltro) {
      dispatch(fetchEventosPorProceso(procesoFiltro));
    } else {
      dispatch(fetchEventosEvaluativos({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, procesoFiltro, proximasActivo, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorProceso = () => {
    dispatch(establecerFiltroProcesoEvento(procesoInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onVerProximas = () => {
    dispatch(establecerFiltroProximas(procesoInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(limpiarFiltrosEventoEvaluativo());
    setProcesoInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const resultadoTemplate = (rowData) => {
    const severidad = rowData.resultado === 'PENDIENTE' ? 'warning' : 'success';
    return <Tag value={rowData.resultado} severity={severidad} />;
  };

  const accionesTemplate = (rowData) => {
    const finalizado = rowData.resultado && rowData.resultado !== 'PENDIENTE';
    return (
      <>
        {!finalizado && (
          <Button
            icon="pi pi-calendar"
            className="p-button-rounded p-button-text p-button-info"
            onClick={() => setItemAReprogramar(rowData)}
            tooltip="Reprogramar"
          />
        )}
        {!finalizado && (
          <Button
            icon="pi pi-check-square"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => setItemAResultado(rowData)}
            tooltip="Registrar resultado"
          />
        )}
        {finalizado && !rowData.acta_sustentacion && (
          <Button
            icon="pi pi-file-check"
            className="p-button-rounded p-button-text p-button-warning"
            onClick={() => setItemAActa(rowData)}
            tooltip="Cargar acta"
          />
        )}
        {!finalizado && (
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
    dispatch(eliminarEventoEvaluativo(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAEliminar(null);
      }
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText
            value={procesoInput}
            onChange={(e) => setProcesoInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorProceso()}
            placeholder="ID Proceso Formativo"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorProceso} tooltip="Filtrar por proceso" />
        </div>
        <Button
          label="Ver próximas"
          icon="pi pi-clock"
          className="p-button-outlined p-button-sm"
          onClick={onVerProximas}
        />
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
          onClick={() => dispatch(limpiarErrorEventoEvaluativo())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Sustentaciones</h5>}
        loading={loading}
        lazy={!hayFiltroActivo}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={hayFiltroActivo ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron sustentaciones."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="numero" header="N°" style={{ width: '4rem' }} />
        <Column field="proceso_formativo_titulo" header="Proceso Formativo" />
        <Column field="fecha_sustentacion" header="Fecha" />
        <Column field="lugar" header="Lugar" />
        <Column
          field="es_obligatoria"
          header="Obligatoria"
          body={(row) => (row.es_obligatoria ? 'Sí' : 'No')}
        />
        <Column field="resultado" header="Resultado" body={resultadoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '12rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar sustentación?"
        loading={Boolean(deletingId)}
      >
        Esta acción eliminará la sustentación #{itemAEliminar?.numero}. No será posible si ya tiene
        un resultado registrado.
      </ConfirmationModal>
      {itemAReprogramar && (
        <ReprogramarEventoModal
          visible={Boolean(itemAReprogramar)}
          onHide={() => setItemAReprogramar(null)}
          evento={itemAReprogramar}
        />
      )}
      {itemAResultado && (
        <RegistrarResultadoModal
          visible={Boolean(itemAResultado)}
          onHide={() => setItemAResultado(null)}
          evento={itemAResultado}
        />
      )}
      {itemAActa && (
        <CargarActaModal
          visible={Boolean(itemAActa)}
          onHide={() => setItemAActa(null)}
          evento={itemAActa}
        />
      )}
    </>
  );
};

export default EventoEvaluativoTable;