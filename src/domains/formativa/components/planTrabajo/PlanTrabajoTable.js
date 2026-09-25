// src/domains/formativa/components/planTrabajo/PlanTrabajoTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchPlanesTrabajo,
  fetchPlanTrabajoPorProceso,
  eliminarPlanTrabajo,
  enviarPlanTrabajo,
  aprobarPlanTrabajo,
  limpiarPlanTrabajoPorProceso,
  limpiarErrorPlanTrabajo,
} from '../../../../features/planTrabajo/planTrabajoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import RechazarPlanTrabajoModal from './RechazarPlanTrabajoModal';

const SEVERIDAD_ESTADO = {
  BORRADOR: 'info',
  ENVIADO: 'warning',
  APROBADO: 'success',
  RECHAZADO: 'danger',
  ELIMINADO: 'secondary',
};

const ESTADOS_EDITABLES = ['BORRADOR', 'RECHAZADO'];

/**
 * Ojo: el backend no oculta los planes en estado ELIMINADO del listado
 * general (ver nota en planTrabajoSlice) — aquí simplemente se muestran sin
 * acciones disponibles, en vez de filtrarlos, para no inventar un
 * comportamiento que el backend no tiene.
 */
const PlanTrabajoTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, deletingId, transicionandoId, porProceso, buscandoPorProceso } =
    useSelector((state) => state.planTrabajo);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [itemAAprobar, setItemAAprobar] = useState(null);
  const [itemARechazar, setItemARechazar] = useState(null);
  const [procesoInput, setProcesoInput] = useState('');

  useEffect(() => {
    dispatch(fetchPlanesTrabajo({ page: lazyParams.page, pageSize: lazyParams.rows }));
  }, [dispatch, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorProceso = () => {
    if (!procesoInput.trim()) return;
    dispatch(fetchPlanTrabajoPorProceso(procesoInput.trim()));
  };

  const onLimpiarBusquedaProceso = () => {
    dispatch(limpiarPlanTrabajoPorProceso());
    setProcesoInput('');
  };

  const estadoTemplate = (rowData) => (
    <Tag value={rowData.estado} severity={SEVERIDAD_ESTADO[rowData.estado] || 'info'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    const esEditable = ESTADOS_EDITABLES.includes(rowData.estado);
    return (
      <>
        {esEditable && (
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-text p-button-warning"
            onClick={() => onEdit(rowData)}
            tooltip="Editar"
          />
        )}
        {esEditable && (
          <Button
            icon="pi pi-send"
            className="p-button-rounded p-button-text p-button-info"
            onClick={() => dispatch(enviarPlanTrabajo(rowData.id))}
            loading={enTransicion}
            tooltip="Enviar a revisión"
          />
        )}
        {rowData.estado === 'ENVIADO' && (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => setItemAAprobar(rowData)}
            loading={enTransicion}
            tooltip="Aprobar"
          />
        )}
        {rowData.estado === 'ENVIADO' && (
          <Button
            icon="pi pi-times-circle"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => setItemARechazar(rowData)}
            tooltip="Rechazar"
          />
        )}
        {rowData.estado === 'BORRADOR' && (
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
    dispatch(eliminarPlanTrabajo(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAEliminar(null);
      }
    });
  };

  const handleConfirmarAprobar = () => {
    dispatch(aprobarPlanTrabajo(itemAAprobar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAAprobar(null);
      }
    });
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
            tooltip="Buscar plan de trabajo del proceso"
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
              ? `Proceso "${porProceso.proceso_titulo}": plan de trabajo en estado ${porProceso.estado}.`
              : 'Este proceso no tiene ningún plan de trabajo registrado. (Clic para cerrar este mensaje)'
          }
        />
      )}
      {error && (
        <Message
          severity="error"
          className="mb-3 w-full"
          text={error}
          onClick={() => dispatch(limpiarErrorPlanTrabajo())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Planes de Trabajo</h5>}
        loading={loading}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron planes de trabajo."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="proceso_titulo" header="Proceso Formativo" />
        <Column field="fecha_inicio_planeada" header="Inicio Planeado" />
        <Column field="fecha_fin_planeada" header="Fin Planeado" />
        <Column field="aprobado_por_username" header="Aprobado Por" />
        <Column field="estado" header="Estado" body={estadoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '13rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar plan de trabajo?"
        loading={Boolean(deletingId)}
      >
        Esta acción eliminará el plan de trabajo de{' '}
        <strong>{itemAEliminar?.proceso_titulo}</strong>. Solo es posible en estado Borrador.
      </ConfirmationModal>
      <ConfirmationModal
        visible={Boolean(itemAAprobar)}
        onHide={() => setItemAAprobar(null)}
        onConfirm={handleConfirmarAprobar}
        header="¿Aprobar plan de trabajo?"
        loading={transicionandoId === itemAAprobar?.id}
      >
        Se aprobará el plan de trabajo de <strong>{itemAAprobar?.proceso_titulo}</strong> a tu nombre.
      </ConfirmationModal>
      {itemARechazar && (
        <RechazarPlanTrabajoModal
          visible={Boolean(itemARechazar)}
          onHide={() => setItemARechazar(null)}
          plan={itemARechazar}
        />
      )}
    </>
  );
};

export default PlanTrabajoTable;