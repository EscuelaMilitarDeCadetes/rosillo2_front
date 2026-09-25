// src/domains/usuarios/components/usuarioAdmin/AdminDashboardPanel.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchAdminDashboard } from '../../../../features/usuarioAdmin/usuarioAdminSlice';


const AdminDashboardPanel = () => {
  const dispatch = useDispatch();
  const { dashboard, dashboardLoading } = useSelector((state) => state.usuarioAdmin);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  if (dashboardLoading || !dashboard) {
    return (
      <div className="d-flex justify-content-center p-5">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <Card className="flex-grow-1" style={{ minWidth: 200 }}>
          <div className="text-muted small">Usuarios activos</div>
          <div className="fs-2 fw-bold text-success">{dashboard.usuarios_activos.length}</div>
        </Card>
        <Card className="flex-grow-1" style={{ minWidth: 200 }}>
          <div className="text-muted small">Usuarios inactivos</div>
          <div className="fs-2 fw-bold text-danger">{dashboard.usuarios_inactivos.length}</div>
        </Card>
        <Card className="flex-grow-1" style={{ minWidth: 200 }}>
          <div className="text-muted small">Roles disponibles</div>
          <div className="fs-2 fw-bold">{dashboard.roles_disponibles.length}</div>
        </Card>
      </div>

      <h6>Roles disponibles en la plataforma</h6>
      <DataTable value={dashboard.roles_disponibles} emptyMessage="Sin roles configurados." responsiveLayout="scroll">
        <Column field="nombre_rol" header="Nombre del Rol" />
      </DataTable>
    </>
  );
};

export default AdminDashboardPanel;