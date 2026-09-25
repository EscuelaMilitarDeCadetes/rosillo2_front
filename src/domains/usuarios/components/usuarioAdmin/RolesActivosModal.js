// src/domains/usuarios/components/usuarioAdmin/RolesActivosModal.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { fetchRolesActivosUsuario } from '../../../../features/usuarioAdmin/usuarioAdminSlice';

// GET /usuarios/usuarios/{id}/roles-activos/
const RolesActivosModal = ({ visible, onHide, usuario }) => {
  const dispatch = useDispatch();
  const { rolesActivosPorUsuario, rolesActivosLoading } = useSelector((state) => state.usuarioAdmin);
  const roles = usuario ? rolesActivosPorUsuario[usuario.id] ?? [] : [];

  useEffect(() => {
    if (visible && usuario) dispatch(fetchRolesActivosUsuario(usuario.id));
  }, [visible, usuario, dispatch]);

  return (
    <Dialog header={`Roles Activos — ${usuario?.username ?? ''}`} visible={visible} style={{ width: '40vw' }} onHide={onHide}>
      <DataTable value={roles} loading={rolesActivosLoading} emptyMessage="Sin roles activos." responsiveLayout="scroll">
        <Column field="rol_nombre" header="Rol" />
        <Column field="fecha_inicio" header="Desde" />
        <Column field="fecha_fin" header="Hasta" />
      </DataTable>
    </Dialog>
  );
};

export default RolesActivosModal;