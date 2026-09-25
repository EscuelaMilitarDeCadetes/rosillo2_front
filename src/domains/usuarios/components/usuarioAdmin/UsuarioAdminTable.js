// src/domains/usuarios/components/usuarioAdmin/UsuarioAdminTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { fetchUsuarios } from '../../../../features/usuarioAdmin/usuarioAdminSlice';
import RolesActivosModal from './RolesActivosModal';

const PAGE_SIZE = 10;


const UsuarioAdminTable = () => {
  const dispatch = useDispatch();
  const { items, total, loading } = useSelector((state) => state.usuarioAdmin);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: PAGE_SIZE, page: 1 });
  const [rolesTarget, setRolesTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchUsuarios({ page: lazyParams.page, pageSize: lazyParams.rows }));
  }, [dispatch, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const estadoTemplate = (row) => <Tag severity={row.is_active ? 'success' : 'danger'} value={row.is_active ? 'Activo' : 'Inactivo'} />;

  const accionesTemplate = (row) => (
    <Button icon="pi pi-id-card" className="p-button-rounded p-button-secondary p-button-sm" tooltip="Ver roles activos" onClick={() => setRolesTarget(row)} />
  );

  return (
    <>
      <h5 className="mb-3">Usuarios (todos)</h5>
      <DataTable
        value={items}
        loading={loading}
        lazy
        paginator
        rows={PAGE_SIZE}
        totalRecords={total}
        first={lazyParams.first}
        onPage={onPage}
        emptyMessage="No se encontraron usuarios."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="username" header="Usuario" sortable />
        <Column field="persona_actual_nombre" header="Persona actual" />
        <Column field="persona_actual_documento" header="Documento" />
        <Column field="email" header="Correo" />
        <Column header="Estado" body={estadoTemplate} />
        <Column header="Acciones" body={accionesTemplate} />
      </DataTable>

      <RolesActivosModal visible={!!rolesTarget} onHide={() => setRolesTarget(null)} usuario={rolesTarget} />
    </>
  );
};

export default UsuarioAdminTable;