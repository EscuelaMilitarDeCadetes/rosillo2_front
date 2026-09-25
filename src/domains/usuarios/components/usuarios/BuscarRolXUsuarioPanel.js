// src/domains/usuarios/components/usuarios/BuscarRolXUsuarioPanel.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { buscarRolXUsuario } from '../../../../features/usuarios/rolesUsuarioSlice';


const BuscarRolXUsuarioPanel = () => {
  const dispatch = useDispatch();
  const { platformUsers, buscandoRol, resultadosBusquedaRol, error } = useSelector((state) => state.rolesUsuario);
  const { roles } = useSelector((state) => state.metadata);

  const [usuarioId, setUsuarioId] = useState(null);
  const [rolId, setRolId] = useState(null);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const opcionesUsuario = Array.from(
    new Map((platformUsers || []).map((u) => [u.usuario_id, { id: u.usuario_id, nombre: u.usuario_nombre }])).values()
  );

  const handleBuscar = () => {
    dispatch(buscarRolXUsuario({ usuario_id: usuarioId, rol_id: rolId }));
    setBusquedaRealizada(true);
  };

  return (
    <>
      <h5 className="mb-3">Buscar Asignación de Rol</h5>
      <div className="d-flex align-items-end gap-3 mb-3 flex-wrap">
        <div style={{ minWidth: 240 }}>
          <label htmlFor="usuarioBuscar" className="d-block">
            Usuario
          </label>
          <Dropdown
            inputId="usuarioBuscar"
            value={usuarioId}
            options={opcionesUsuario}
            onChange={(e) => setUsuarioId(e.value)}
            optionLabel="nombre"
            optionValue="id"
            filter
            placeholder="Seleccione un usuario"
            className="w-full"
          />
        </div>
        <div style={{ minWidth: 240 }}>
          <label htmlFor="rolBuscar" className="d-block">
            Rol
          </label>
          <Dropdown
            inputId="rolBuscar"
            value={rolId}
            options={roles}
            onChange={(e) => setRolId(e.value)}
            optionLabel="nombre_rol"
            optionValue="id"
            filter
            placeholder="Seleccione un rol"
            className="w-full"
          />
        </div>
        <Button label="Buscar" icon="pi pi-search" onClick={handleBuscar} disabled={!usuarioId || !rolId} loading={buscandoRol} />
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      {busquedaRealizada && (
        <DataTable value={resultadosBusquedaRol} loading={buscandoRol} emptyMessage="Ese usuario no tiene ese rol asignado (activo o inactivo)." responsiveLayout="scroll">
          <Column field="usuario_nombre" header="Usuario" />
          <Column field="rol_nombre" header="Rol" />
          <Column field="persona_nombre" header="Persona" />
          <Column field="estado" header="Estado" body={(row) => (row.estado ? 'Activo' : 'Inactivo')} />
        </DataTable>
      )}
    </>
  );
};

export default BuscarRolXUsuarioPanel;