// src/domains/formativa/components/participanteProceso/ParticipanteProcesoTable.js
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchParticipantesProceso,
  fetchParticipantesPorProceso,
  eliminarParticipanteProceso,
  finalizarParticipanteProceso,
  establecerFiltroProcesoParticipante,
  limpiarErrorParticipanteProceso,
} from '../../../../features/participanteProceso/participanteProcesoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const ROLES_PARTICIPANTE = [
  { label: 'Estudiante', value: 'ESTUDIANTE' },
  { label: 'Tutor', value: 'TUTOR' },
  { label: 'Jurado', value: 'JURADO' },
  { label: 'Investigador Principal', value: 'INVESTIGADOR_PRINCIPAL' },
  { label: 'Coordinador', value: 'COORDINADOR' },
  { label: 'Otro', value: 'OTRO' },
];

/**
 * El backend no expone un endpoint dedicado para esto. 
 * Solo tiene sentido cuando ya hay un proceso seleccionado
 * en servidor y filtrar solo la página visible sería engañoso.
 */
const ParticipanteProcesoTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, deletingId, transicionandoId, procesoFiltro } = useSelector(
    (state) => state.participanteProceso
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [procesoInput, setProcesoInput] = useState('');
  const [rolFiltro, setRolFiltro] = useState(null);
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  useEffect(() => {
    if (procesoFiltro) {
      dispatch(fetchParticipantesPorProceso(procesoFiltro));
    } else {
      dispatch(fetchParticipantesProceso({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, procesoFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorProceso = () => {
    dispatch(establecerFiltroProcesoParticipante(procesoInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroProcesoParticipante(null));
    setProcesoInput('');
    setRolFiltro(null);
    setSoloDisponibles(false);
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const itemsFiltrados = useMemo(() => {
    if (!procesoFiltro) return items;
    return items.filter((p) => {
      if (rolFiltro && p.rol_en_modalidad !== rolFiltro) return false;
      // "Disponible" = activo y sin fecha de finalización todavía.
      if (soloDisponibles && (!p.activo || p.fecha_finalizacion)) return false;
      return true;
    });
  }, [items, procesoFiltro, rolFiltro, soloDisponibles]);

  const activoTemplate = (rowData) => (
    <Tag value={rowData.activo ? 'Activo' : 'Inactivo'} severity={rowData.activo ? 'success' : 'danger'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    return (
      <>
        {rowData.activo && (
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-text p-button-warning"
            onClick={() => onEdit(rowData)}
            tooltip="Editar"
          />
        )}
        {rowData.activo && !rowData.fecha_finalizacion && (
          <Button
            icon="pi pi-flag"
            className="p-button-rounded p-button-text p-button-info"
            onClick={() => dispatch(finalizarParticipanteProceso(rowData.id))}
            loading={enTransicion}
            tooltip="Finalizar"
          />
        )}
        {rowData.activo && (
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
    dispatch(eliminarParticipanteProceso(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAEliminar(null);
      }
    });
  };

  const hayFiltrosSecundarios = Boolean(rolFiltro || soloDisponibles);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        {procesoFiltro && (
          <>
            <Dropdown
              value={rolFiltro}
              options={ROLES_PARTICIPANTE}
              onChange={(e) => setRolFiltro(e.value)}
              placeholder="Filtrar por rol"
              showClear
              style={{ minWidth: '12rem' }}
            />
            <Button
              label={soloDisponibles ? 'Mostrando disponibles' : 'Ver disponibles'}
              icon="pi pi-filter"
              className={soloDisponibles ? 'p-button-sm' : 'p-button-outlined p-button-sm'}
              onClick={() => setSoloDisponibles((v) => !v)}
              tooltip="Activos y sin fecha de finalización"
            />
          </>
        )}
        <div className="p-inputgroup" style={{ maxWidth: '16rem' }}>
          <InputText
            value={procesoInput}
            onChange={(e) => setProcesoInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorProceso()}
            placeholder="ID Proceso Formativo"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorProceso} tooltip="Filtrar por proceso" />
        </div>
        {(procesoFiltro || hayFiltrosSecundarios) && (
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
          onClick={() => dispatch(limpiarErrorParticipanteProceso())}
        />
      )}
      <DataTable
        value={itemsFiltrados}
        header={<h5 className="m-0">Participantes de Proceso</h5>}
        loading={loading}
        lazy={!procesoFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={procesoFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron participantes."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="persona_nombre_completo" header="Persona" />
        <Column field="persona_documento" header="Documento" />
        <Column field="proceso_formativo_titulo" header="Proceso Formativo" />
        <Column field="rol_en_modalidad" header="Rol" />
        <Column field="fecha_asignacion" header="Fecha Asignación" />
        <Column field="fecha_finalizacion" header="Fecha Finalización" />
        <Column field="activo" header="Estado" body={activoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '10rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar participante?"
        loading={Boolean(deletingId)}
      >
        Esta acción desactivará la participación de{' '}
        <strong>{itemAEliminar?.persona_nombre_completo}</strong> en este proceso.
      </ConfirmationModal>
    </>
  );
};

export default ParticipanteProcesoTable;