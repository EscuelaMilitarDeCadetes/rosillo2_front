// src/domains/common/pages/TareasPage.js
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import {
  fetchTareas,
  fetchTareasPorUsuario,
  fetchTareasVencidas,
  fetchTareasProximasAVencer,
} from '../../../features/tarea/tareaSlice';
import TareasTable from '../components/tarea/TareasTable';
import AsignarTareaModal from '../components/tarea/AsignarTareaModal';

// El backend no permite a SOPORTE ver tareas (permission_classes excluye a
// EsSoporte de todas las acciones de TareaViewSet); solo Decano, Supervisor,
// Facultad, Grupo, CInterno y CExterno. La creación queda restringida a
// Facultad/Grupo/CInterno/CExterno (dueños de objetos), por eso el botón
// "Nueva Tarea" solo aparece para esos roles.
const ROLES_MODULO = ['DECANO', 'SUPERVISOR', 'FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO'];
const ROLES_CREACION = ['FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO'];

const TareasPage = () => {
  const dispatch = useDispatch();
  const { user, roles } = useSelector((state) => state.auth);
  const {
    items, loading,
    porUsuario, loadingPorUsuario,
    vencidas, loadingVencidas,
    proximasAVencer, loadingProximas,
  } = useSelector((state) => state.tarea);

  const [page] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  const tieneAcceso = roles?.some((r) => ROLES_MODULO.includes(r));
  const puedeCrear = roles?.some((r) => ROLES_CREACION.includes(r));

  const recargar = useCallback(() => {
    dispatch(fetchTareas({ page }));
    dispatch(fetchTareasPorUsuario({ usuarioId: user.id }));
    dispatch(fetchTareasVencidas());
    dispatch(fetchTareasProximasAVencer(3));
  }, [dispatch, page, user?.id]);

  useEffect(() => {
    if (!tieneAcceso) return;
    recargar();
  }, [tieneAcceso, recargar]);

  if (!tieneAcceso) {
    return (
      <div className="container-fluid mt-4">
        <Message severity="warn" text="No tiene permisos para acceder al módulo de tareas." />
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Tareas</h5>
          {puedeCrear && (
            <Button label="Nueva Tarea" icon="pi pi-plus" className="p-button-sm" onClick={() => setModalVisible(true)} />
          )}
        </div>
        <TabView>
          <TabPanel header="Mis Tareas">
            <TareasTable tareas={porUsuario} loading={loadingPorUsuario} puedeGestionar={false} emptyMessage="No tiene tareas asignadas." />
          </TabPanel>
          <TabPanel header="Próximas a Vencer">
            <TareasTable tareas={proximasAVencer} loading={loadingProximas} puedeGestionar={puedeCrear} emptyMessage="No hay tareas próximas a vencer." />
          </TabPanel>
          <TabPanel header="Vencidas">
            <TareasTable tareas={vencidas} loading={loadingVencidas} puedeGestionar={puedeCrear} emptyMessage="No hay tareas vencidas." />
          </TabPanel>
          <TabPanel header="Todas las Tareas">
            <TareasTable tareas={items} loading={loading} puedeGestionar={puedeCrear} emptyMessage="No hay tareas registradas." />
          </TabPanel>
        </TabView>
      </div>

      {/* Modal en modo genérico: pide manualmente el objeto relacionado,
          ya que esta página no tiene un contexto de objeto fijo. */}
      <AsignarTareaModal visible={modalVisible} onHide={() => setModalVisible(false)} onCreada={recargar} />
    </div>
  );
};

export default TareasPage;