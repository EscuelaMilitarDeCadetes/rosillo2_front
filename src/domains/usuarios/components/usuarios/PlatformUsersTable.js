// src/domains/usuarios/components/usuarios/PlatformUsersTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { fetchPlatformUsers } from '../../../../features/usuarios/rolesUsuarioSlice';
import { toggleUserStatus } from '../../../../features/usuarios/usuarioLifecycleSlice';
import ConfirmationModal from "../../../../components/common/ConfirmationModal.js";
import ReemplazarUsuarioModal from './ReemplazarUsuarioModal';
import RetirarUsuarioModal from './RetirarUsuarioModal';
import HistoricoRolesModal from './HistoricoRolesModal';

/**
 * Tabla de usuarios de plataforma.
 */
const PlatformUsersTable = () => {
  const dispatch = useDispatch();
  const { platformUsers, platformUsersTotal, loading, error } = useSelector(
    (state) => state.rolesUsuario
  );
  const { rowLoading } = useSelector((state) => state.usuarioLifecycle);
  const { roles } = useSelector((state) => state.auth);
  const puedeReemplazar = roles?.includes('SOPORTE');
  const puedeRetirar = roles?.includes('SOPORTE') || roles?.includes('FACULTAD');
 
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [reemplazarTarget, setReemplazarTarget] = useState(null);
  const [retirarTarget, setRetirarTarget] = useState(null);
  const [historicoTarget, setHistoricoTarget] = useState(null);
 
  const cargarPagina = () => {
    dispatch(fetchPlatformUsers({ page: lazyParams.page, pageSize: lazyParams.rows }));
  };
 
  useEffect(() => {
    cargarPagina();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, lazyParams.page, lazyParams.rows]);
 
  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };
 
  const abrirConfirmacion = (row) => {
    setFilaSeleccionada(row);
    setIsConfirmVisible(true);
  };
 
  const handleConfirmToggle = () => {
    if (!filaSeleccionada) return;
    const { usuario_id: usuarioId, usuario_is_active: activarActual } = filaSeleccionada;
    dispatch(toggleUserStatus({ userId: usuarioId, activar: !activarActual })).then((result) => {
      if (toggleUserStatus.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        setFilaSeleccionada(null);
        cargarPagina(); // refresca la página actual para reflejar el nuevo estado
      }
    });
  };
 
  const accionesTemplate = (row) => (
    <div className="d-flex gap-2 flex-wrap">
      <Button
        label={row.usuario_is_active ? 'Desactivar' : 'Activar'}
        icon={row.usuario_is_active ? 'pi pi-ban' : 'pi pi-check'}
        className={row.usuario_is_active ? 'p-button-danger p-button-sm' : 'p-button-success p-button-sm'}
        loading={!!rowLoading[row.usuario_id]}
        onClick={() => abrirConfirmacion(row)}
      />
      {puedeReemplazar && (
        <Button
          icon="pi pi-sync"
          className="p-button-rounded p-button-secondary p-button-sm"
          tooltip="Reemplazar persona"
          onClick={() => setReemplazarTarget(row)}
        />
      )}
      {puedeRetirar && row.usuario_is_active && (
        <Button
          icon="pi pi-user-minus"
          className="p-button-rounded p-button-warning p-button-sm"
          tooltip="Retirar usuario"
          onClick={() => setRetirarTarget(row)}
        />
      )}
      <Button
        icon="pi pi-history"
        className="p-button-rounded p-button-sm p-button-secondary"
        tooltip="Histórico de roles"
        onClick={() => setHistoricoTarget(row)}
      />
    </div>
  );
 
  const header = <h5 className="m-0">Usuarios Activos registrados</h5>;

  return (
    <>
      {error && (
        <Message severity="error" className="mb-3 w-full" text="No se pudieron cargar los usuarios de plataforma." />
      )}
      <DataTable
        value={platformUsers}
        header={header}
        loading={loading}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={platformUsersTotal}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron usuarios."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="persona_grado" header="Grado" />
        <Column field="persona_nombre" header="Nombre" />
        <Column field="persona_apellido" header="Apellido" />
        <Column field="persona_documento" header="Documento" />
        <Column field="persona_celular" header="Celular" />
        <Column field="persona_correo" header="Correo Institucional" />
        <Column field="rol_nombre" header="Rol en la plataforma" />
        <Column header="Acciones" body={accionesTemplate} />
      </DataTable>
 
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => {
          setIsConfirmVisible(false);
          setFilaSeleccionada(null);
        }}
        onConfirm={handleConfirmToggle}
        header={filaSeleccionada?.usuario_is_active ? '¿Desactivar usuario?' : '¿Activar usuario?'}
        loading={filaSeleccionada ? !!rowLoading[filaSeleccionada.usuario_id] : false}
      >
        {filaSeleccionada && (
          <p className="mb-0">
            {filaSeleccionada.usuario_is_active ? 'Desactivar' : 'Activar'} el acceso de{' '}
            <strong>
              {filaSeleccionada.persona_nombre} {filaSeleccionada.persona_apellido}
            </strong>{' '}
            ({filaSeleccionada.usuario_nombre}).
          </p>
        )}
      </ConfirmationModal>
 
      <ReemplazarUsuarioModal
        visible={!!reemplazarTarget}
        onHide={() => setReemplazarTarget(null)}
        usuarioObjetivo={reemplazarTarget}
      />
      <RetirarUsuarioModal
        visible={!!retirarTarget}
        onHide={() => setRetirarTarget(null)}
        usuarioObjetivo={retirarTarget}
      />
      <HistoricoRolesModal
        visible={!!historicoTarget}
        onHide={() => setHistoricoTarget(null)}
        usuario={historicoTarget}
      />
    </>
  );
};

export default PlatformUsersTable;