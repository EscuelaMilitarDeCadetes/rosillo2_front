// src/domains/formativa/components/registroHoras/RegistroHorasTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchRegistrosHoras,
  fetchRegistroHorasPorProceso,
  recalcularRegistroHoras,
  limpiarRegistroHorasPorProceso,
  limpiarErrorRegistroHoras,
} from '../../../../features/registroHoras/registroHorasSlice';
import AjustarHorasRequeridasModal from './AjustarHorasRequeridasModal';

/**
 * Solo "Ajustar horas requeridas" y "Recalcular".
 */
const RegistroHorasTable = () => {
  const dispatch = useDispatch();
  const { items, total, loading, error, transicionandoId, porProceso, buscandoPorProceso } = useSelector(
    (state) => state.registroHoras
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAAjustar, setItemAAjustar] = useState(null);
  const [procesoInput, setProcesoInput] = useState('');

  useEffect(() => {
    dispatch(fetchRegistrosHoras({ page: lazyParams.page, pageSize: lazyParams.rows }));
  }, [dispatch, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorProceso = () => {
    if (!procesoInput.trim()) return;
    dispatch(fetchRegistroHorasPorProceso(procesoInput.trim()));
  };

  const onLimpiarBusquedaProceso = () => {
    dispatch(limpiarRegistroHorasPorProceso());
    setProcesoInput('');
  };

  const cumpleTemplate = (rowData) => (
    <Tag
      value={rowData.cumple_requisito ? 'Cumple' : 'Pendiente'}
      severity={rowData.cumple_requisito ? 'success' : 'warning'}
    />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    return (
      <>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-warning"
          onClick={() => setItemAAjustar(rowData)}
          tooltip="Ajustar horas requeridas"
        />
        <Button
          icon="pi pi-refresh"
          className="p-button-rounded p-button-text p-button-info"
          onClick={() => dispatch(recalcularRegistroHoras(rowData.id))}
          loading={enTransicion}
          tooltip="Recalcular"
        />
      </>
    );
  };

  return (
    <>
      <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText
            value={procesoInput}
            onChange={(e) => setProcesoInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorProceso()}
            placeholder="ID Proceso Formativo"
          />
          <Button
            icon="pi pi-search"
            loading={buscandoPorProceso}
            onClick={onBuscarPorProceso}
            tooltip="Buscar control de horas del proceso"
          />
        </div>
      </div>
      {procesoInput && (buscandoPorProceso || porProceso !== null) && (
        <Message
          severity={porProceso ? 'success' : 'warn'}
          className="mb-3 w-full"
          onClick={onLimpiarBusquedaProceso}
          text={
            buscandoPorProceso
              ? 'Buscando...'
              : porProceso
              ? `Proceso "${porProceso.proceso_titulo}": ${porProceso.horas_acumuladas}/${porProceso.horas_requeridas} horas acumuladas.`
              : 'Este proceso no tiene control de horas registrado. (Click para cerrar este mensaje)'
          }
        />
      )}
      {error && (
        <Message
          severity="error"
          className="mb-3 w-full"
          text={error}
          onClick={() => dispatch(limpiarErrorRegistroHoras())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Control de Horas</h5>}
        loading={loading}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron controles de horas."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="proceso_titulo" header="Proceso Formativo" />
        <Column field="horas_requeridas" header="Requeridas" />
        <Column field="horas_acumuladas" header="Acumuladas" />
        <Column field="horas_pendientes" header="Pendientes" />
        <Column field="cumple_requisito" header="Estado" body={cumpleTemplate} />
        <Column field="fecha_ultima_actualizacion" header="Última Actualización" />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '9rem' }} />
      </DataTable>
      {itemAAjustar && (
        <AjustarHorasRequeridasModal
          visible={Boolean(itemAAjustar)}
          onHide={() => setItemAAjustar(null)}
          registro={itemAAjustar}
        />
      )}
    </>
  );
};

export default RegistroHorasTable;