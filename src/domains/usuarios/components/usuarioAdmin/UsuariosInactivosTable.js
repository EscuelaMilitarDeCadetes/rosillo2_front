// src/domains/usuarios/components/usuarioAdmin/UsuariosInactivosTable.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { fetchUsuariosInactivos } from '../../../../features/usuarioAdmin/usuarioAdminSlice';

const UsuariosInactivosTable = () => {
  const dispatch = useDispatch();
  const { inactivos, inactivosLoading } = useSelector((state) => state.usuarioAdmin);

  useEffect(() => {
    dispatch(fetchUsuariosInactivos());
  }, [dispatch]);

  return (
    <>
      <h5 className="mb-3">Usuarios Inactivos</h5>
      <DataTable value={inactivos} loading={inactivosLoading} paginator rows={15} emptyMessage="No hay usuarios inactivos." responsiveLayout="scroll" dataKey="id">
        <Column field="username" header="Usuario" sortable />
        <Column field="persona_actual_nombre" header="Última persona asignada" />
        <Column field="persona_actual_documento" header="Documento" />
        <Column field="email" header="Correo" />
      </DataTable>
    </>
  );
};

export default UsuariosInactivosTable;