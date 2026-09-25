// src/domains/formativa/components/homologacion/HomologacionTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchHomologaciones,
  fetchHomologacionesPendientes,
  fetchHomologacionPorProceso,
  establecerFiltroPendientesHomologacion,
  limpiarHomologacionPorProceso,
  limpiarErrorHomologacion,
} from '../../../../features/homologacion/homologacionSlice';
import AprobarHomologacionModal from './AprobarHomologacionModal';
import RechazarHomologacionModal from './RechazarHomologacionModal';
import CargarActaHomologacionModal from './CargarActaHomologacionModal';

const SEVERIDAD_ESTADO = { PENDIENTE: 'warning', APROBADA: 'success', RECHAZADA: 'danger' };

const HomologacionTable = () => {
  const dispatch = useDispatch();
  const { items, total, loading, error, pendientesActivo, porProceso, buscandoPorProceso } = useSelector(
    (state) => state.homologacion
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAAprobar, setItemAAprobar] = useState(null);
  const [itemARechazar, setItemARechazar] = useState(null);
  const [itemAActa, setItemAActa] = useState(null);
  const [procesoInput, setProcesoInput] = useState('');

  useEffect(() => {
    if (pendientesActivo) {
      dispatch(fetchHomologacionesPendientes());
    } else {
      dispatch(fetchHomologaciones({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, pendientesActivo, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorProceso = () => {
    if (!procesoInput.trim()) return;
    dispatch(fetchHomologacionPorProceso(procesoInput.trim()));
  };

  const onLimpiarBusquedaProceso = () => {
    dispatch(limpiarHomologacionPorProceso());
    setProcesoInput('');
  };

  const estadoTemplate = (rowData) => (
    <Tag value={rowData.estado} severity={SEVERIDAD_ESTADO[rowData.estado] || 'info'} />
  );

  const accionesTemplate = (rowData) => (
    <>
      {rowData.estado === 'PENDIENTE' && (
        <Button
          icon="pi pi-check-circle"
          className="p-button-rounded p-button-text p-button-success"
          onClick={() => setItemAAprobar(rowData)}
          tooltip="Aprobar"
        />
      )}
      {rowData.estado === 'PENDIENTE' && (
        <Button
          icon="pi pi-times-circle"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => setItemARechazar(rowData)}
          tooltip="Rechazar"
        />
      )}
      {rowData.estado === 'APROBADA' && !rowData.acta_homologacion && (
        <Button
          icon="pi pi-file-check"
          className="p-button-rounded p-button-text p-button-info"
          onClick={() => setItemAActa(rowData)}
          tooltip="Cargar acta"
        />
      )}
    </>
  );

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
          <Button
            icon="pi pi-search"
            loading={buscandoPorProceso}
            onClick={onBuscarPorProceso}
            tooltip="Buscar homologación del proceso"
          />
        </div>
        <Button
          label={pendientesActivo ? 'Ver todas' : 'Ver pendientes'}
          icon="pi pi-clock"
          className="p-button-outlined p-button-sm"
          onClick={() => {
            dispatch(establecerFiltroPendientesHomologacion(!pendientesActivo));
            setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
          }}
        />
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
              ? `Proceso "${porProceso.proceso_titulo}": homologación en estado ${porProceso.estado}, ${porProceso.creditos_reconocidos ?? 0} créditos reconocidos.`
              : 'Este proceso no tiene ninguna homologación registrada. (Clic para cerrar este mensaje)'
          }
        />
      )}
      {error && (
        <Message
          severity="error"
          className="mb-3 w-full"
          text={error}
          onClick={() => dispatch(limpiarErrorHomologacion())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Homologaciones</h5>}
        loading={loading}
        lazy={!pendientesActivo}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={pendientesActivo ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron homologaciones."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="proceso_titulo" header="Proceso Formativo" />
        <Column field="creditos_reconocidos" header="Créditos" />
        <Column field="fecha_homologacion" header="Fecha" />
        <Column field="aprobado_por_username" header="Aprobado Por" />
        <Column field="estado" header="Estado" body={estadoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '9rem' }} />
      </DataTable>
      {itemAAprobar && (
        <AprobarHomologacionModal
          visible={Boolean(itemAAprobar)}
          onHide={() => setItemAAprobar(null)}
          homologacion={itemAAprobar}
        />
      )}
      {itemARechazar && (
        <RechazarHomologacionModal
          visible={Boolean(itemARechazar)}
          onHide={() => setItemARechazar(null)}
          homologacion={itemARechazar}
        />
      )}
      {itemAActa && (
        <CargarActaHomologacionModal
          visible={Boolean(itemAActa)}
          onHide={() => setItemAActa(null)}
          homologacion={itemAActa}
        />
      )}
    </>
  );
};

export default HomologacionTable;