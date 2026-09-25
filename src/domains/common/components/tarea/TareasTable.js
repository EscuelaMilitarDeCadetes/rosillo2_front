// src/domains/common/components/tarea/TareasTable.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { completarTarea, reasignarTarea, eliminarTarea } from '../../../../features/tarea/tareaSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const objetoTemplate = (rowData) =>
  rowData.objeto_descripcion ? `${rowData.objeto_tipo}: ${rowData.objeto_descripcion}` : 'Sin objeto asociado';

const estadoTemplate = (rowData) => {
  if (rowData.completada) return <Tag value="Completada" severity="success" />;
  if (rowData.fecha_limite && new Date(rowData.fecha_limite) < new Date()) {
    return <Tag value="Vencida" severity="danger" />;
  }
  return <Tag value="Pendiente" severity="warning" />;
};

const nombreUsuario = (u) => u.persona_actual_nombre || u.username;

// Tabla presentacional reutilizable: recibe las tareas ya cargadas (el
// contenedor decide con qué thunk las trajo: listado general, por-usuario,
// por-objeto, vencidas o próximas-a-vencer) y ofrece completar/reasignar/
// eliminar según el permiso puedeGestionar.
const TareasTable = ({ tareas, loading, puedeGestionar = false, emptyMessage = 'No hay tareas registradas.' }) => {
  const dispatch = useDispatch();
  const { usuarios } = useSelector((state) => state.metadata);
  const { actioningId } = useSelector((state) => state.tarea);
  const [tareaAEliminar, setTareaAEliminar] = useState(null);
  const [tareaAReasignar, setTareaAReasignar] = useState(null);
  const [nuevoAsignadoId, setNuevoAsignadoId] = useState(null);

  const handleCompletar = (tarea) => dispatch(completarTarea(tarea.id));

  const handleConfirmarEliminar = () => {
    dispatch(eliminarTarea(tareaAEliminar.id)).then((result) => {
      if (eliminarTarea.fulfilled.match(result)) setTareaAEliminar(null);
    });
  };

  const abrirReasignar = (tarea) => {
    setNuevoAsignadoId(null);
    setTareaAReasignar(tarea);
  };

  const handleConfirmarReasignar = () => {
    if (!nuevoAsignadoId) return;
    dispatch(reasignarTarea({ tareaId: tareaAReasignar.id, nuevoAsignadoId })).then((result) => {
      if (reasignarTarea.fulfilled.match(result)) setTareaAReasignar(null);
    });
  };

  const accionesTemplate = (rowData) => (
    <div className="d-flex gap-2">
      {!rowData.completada && (
        <Button
          icon="pi pi-check"
          className="p-button-sm p-button-success"
          tooltip="Marcar como completada"
          loading={actioningId === rowData.id}
          onClick={() => handleCompletar(rowData)}
        />
      )}
      {puedeGestionar && !rowData.completada && (
        <Button
          icon="pi pi-user-edit"
          className="p-button-sm p-button-secondary"
          tooltip="Reasignar"
          onClick={() => abrirReasignar(rowData)}
        />
      )}
      {puedeGestionar && (
        <Button
          icon="pi pi-trash"
          className="p-button-sm p-button-danger"
          tooltip="Eliminar"
          loading={actioningId === rowData.id}
          onClick={() => setTareaAEliminar(rowData)}
        />
      )}
    </div>
  );

  return (
    <>
      <DataTable value={tareas} loading={loading} paginator rows={10} emptyMessage={emptyMessage} responsiveLayout="scroll">
        <Column field="descripcion" header="Descripción" />
        <Column field="asignado_a_username" header="Asignado a" />
        <Column header="Objeto relacionado" body={objetoTemplate} />
        <Column field="fecha_limite" header="Fecha Límite" body={(r) => (r.fecha_limite ? new Date(r.fecha_limite).toLocaleDateString('es-CO') : '—')} sortable />
        <Column header="Estado" body={estadoTemplate} />
        <Column header="Acciones" body={accionesTemplate} style={{ minWidth: '9rem' }} />
      </DataTable>

      <ConfirmationModal
        visible={!!tareaAEliminar}
        onHide={() => setTareaAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="Eliminar Tarea"
        loading={actioningId === tareaAEliminar?.id}
      >
        <p>¿Está seguro de que desea eliminar la tarea <strong>{tareaAEliminar?.descripcion}</strong>?</p>
      </ConfirmationModal>

      <Dialog header="Reasignar Tarea" visible={!!tareaAReasignar} onHide={() => setTareaAReasignar(null)} style={{ width: '25rem' }}>
        <div className="field mb-3">
          <label htmlFor="nuevoAsignado" className="d-block mb-1">Nuevo responsable</label>
          <Dropdown
            inputId="nuevoAsignado"
            value={nuevoAsignadoId}
            options={usuarios}
            onChange={(e) => setNuevoAsignadoId(e.value)}
            optionLabel={nombreUsuario}
            optionValue="id"
            filter
            placeholder="Seleccione un usuario"
            className="w-100"
          />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <Button label="Cancelar" className="p-button-text" onClick={() => setTareaAReasignar(null)} />
          <Button label="Reasignar" disabled={!nuevoAsignadoId} onClick={handleConfirmarReasignar} />
        </div>
      </Dialog>
    </>
  );
};

export default TareasTable;