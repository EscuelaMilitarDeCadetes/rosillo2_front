// src/domains/usuarios/components/usuarioAdmin/MisUsuariosCreadosTable.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import {
  fetchUsuariosCreadosPorMi,
  desactivarUsuario,
  activarUsuario,
  limpiarErrorUsuarioAdmin,
} from '../../../../features/usuarioAdmin/usuarioAdminSlice';

const MisUsuariosCreadosTable = () => {
  const dispatch = useDispatch();
  const { creadosPorMi, creadosPorMiLoading, transicionandoId, error } = useSelector((state) => state.usuarioAdmin);

  useEffect(() => {
    dispatch(fetchUsuariosCreadosPorMi());
  }, [dispatch]);

  const estadoTemplate = (rowData) => (
    <Tag value={rowData.is_active ? 'Activo' : 'Inactivo'} severity={rowData.is_active ? 'success' : 'secondary'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    return rowData.is_active ? (
      <Button
        label="Desactivar"
        icon="pi pi-user-minus"
        className="p-button-sm p-button-text p-button-danger"
        loading={enTransicion}
        onClick={() => dispatch(desactivarUsuario(rowData.id))}
      />
    ) : (
      <Button
        label="Reactivar y reasignar"
        icon="pi pi-user-plus"
        className="p-button-sm p-button-text p-button-success"
        loading={enTransicion}
        onClick={() => dispatch(activarUsuario(rowData.id))}
      />
    );
  };

  return (
    <>
      {error && (
        <Message severity="error" className="mb-3 w-full" text={error} onClick={() => dispatch(limpiarErrorUsuarioAdmin())} />
      )}
      <DataTable
        value={creadosPorMi}
        loading={creadosPorMiLoading}
        header={<h5 className="m-0">Usuarios que he creado</h5>}
        emptyMessage="Aún no has creado ningún usuario."
        responsiveLayout="scroll"
        paginator
        rows={10}
        dataKey="id"
      >
        <Column field="username" header="Usuario" />
        <Column field="persona_actual_nombre" header="Persona" />
        <Column body={estadoTemplate} header="Estado" />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '14rem' }} />
      </DataTable>
      <small className="text-muted d-block mt-2">
        Si un tutor o jurado que ya creaste va a participar en otro proceso, reactívalo aquí en vez de crear una cuenta nueva,
        y luego agrégalo como participante en el proceso correspondiente.
      </small>
    </>
  );
};

export default MisUsuariosCreadosTable;