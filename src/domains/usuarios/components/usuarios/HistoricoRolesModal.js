// src/domains/usuarios/components/usuarios/HistoricoRolesModal.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { fetchHistoricoRoles } from '../../../../features/usuarios/rolesUsuarioSlice';


const HistoricoRolesModal = ({ visible, onHide, usuario }) => {
  const dispatch = useDispatch();
  const { historicoRolesPorUsuario, historicoRolesLoading } = useSelector((state) => state.rolesUsuario);
  const historico = usuario ? historicoRolesPorUsuario?.[usuario.usuario_id] ?? [] : [];

  useEffect(() => {
    if (visible && usuario) dispatch(fetchHistoricoRoles(usuario.usuario_id));
  }, [visible, usuario, dispatch]);

  const estadoBodyTemplate = (rowData) => (
    <Tag severity={rowData.estado ? 'success' : 'secondary'} value={rowData.estado ? 'Activo' : 'Removido'} />
  );

  return (
    <Dialog header={`Histórico de Roles — ${usuario?.usuario_nombre ?? ''}`} visible={visible} style={{ width: '45vw' }} onHide={onHide}>
      <DataTable value={historico} loading={historicoRolesLoading} paginator rows={10} emptyMessage="Sin roles registrados." responsiveLayout="scroll">
        <Column field="rol_nombre" header="Rol" />
        <Column header="Estado" body={estadoBodyTemplate} />
      </DataTable>
    </Dialog>
  );
};

export default HistoricoRolesModal;