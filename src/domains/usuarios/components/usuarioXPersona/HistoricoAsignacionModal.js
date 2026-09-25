// src/domains/usuarios/components/usuarioXPersona/HistoricoAsignacionModal.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { fetchHistoricoAsignacion } from '../../../../features/usuarioXPersona/usuarioXPersonaSlice';


const HistoricoAsignacionModal = ({ visible, onHide, usuario }) => {
  const dispatch = useDispatch();
  const { historicoPorUsuario, historicoLoading } = useSelector((state) => state.usuarioXPersona);
  const historico = usuario ? historicoPorUsuario[usuario.usuario_id] ?? [] : [];

  useEffect(() => {
    if (visible && usuario) {
      dispatch(fetchHistoricoAsignacion(usuario.usuario_id));
    }
  }, [visible, usuario, dispatch]);

  const estadoBodyTemplate = (rowData) => (
    <Tag severity={rowData.estado ? 'success' : 'secondary'} value={rowData.estado ? 'Activa' : 'Cerrada'} />
  );

  return (
    <Dialog
      header={`Histórico de Asignaciones — ${usuario?.usuario_username ?? ''}`}
      visible={visible}
      style={{ width: '55vw' }}
      onHide={onHide}
    >
      <DataTable value={historico} loading={historicoLoading} paginator rows={10} emptyMessage="Sin asignaciones registradas." responsiveLayout="scroll">
        <Column field="persona_nombre" header="Persona" />
        <Column field="fecha_inicio" header="Fecha Inicio" sortable />
        <Column field="fecha_fin" header="Fecha Fin" sortable />
        <Column header="Estado" body={estadoBodyTemplate} sortable sortField="estado" />
      </DataTable>
    </Dialog>
  );
};

export default HistoricoAsignacionModal;