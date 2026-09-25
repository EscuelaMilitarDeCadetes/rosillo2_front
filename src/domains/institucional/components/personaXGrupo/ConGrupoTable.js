// src/domains/institucional/components/personaXGrupo/ConGrupoTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { fetchConGrupo } from '../../../../features/personaXGrupo/personaXGrupoSlice';
import TrasladarGrupoModal from './TrasladarGrupoModal';
import TrasladarFacultadModal from './TrasladarFacultadModal';
import CambiarRolGrupoModal from './CambiarRolGrupoModal';


const ConGrupoTable = () => {
  const dispatch = useDispatch();
  const { conGrupo, conGrupoLoading } = useSelector((state) => state.personaXGrupo);
  const { rolesGrupo } = useSelector((state) => state.metadata);
  const [excluirRolGrupoId, setExcluirRolGrupoId] = useState(null);

  const [trasladarGrupoTarget, setTrasladarGrupoTarget] = useState(null);
  const [trasladarFacultadTarget, setTrasladarFacultadTarget] = useState(null);
  const [cambiarRolTarget, setCambiarRolTarget] = useState(null);

  const cargar = (excluir) => dispatch(fetchConGrupo({ excluirRolGrupoId: excluir }));

  useEffect(() => {
    cargar(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleFiltrar = (value) => {
    setExcluirRolGrupoId(value);
    cargar(value);
  };

  const accionesTemplate = (row) => (
    <div className="d-flex gap-2">
      <Button
        icon="pi pi-arrow-right-arrow-left"
        className="p-button-rounded p-button-sm p-button-secondary"
        tooltip="Trasladar de grupo"
        onClick={() => setTrasladarGrupoTarget(row)}
      />
      <Button
        icon="pi pi-building"
        className="p-button-rounded p-button-sm p-button-info"
        tooltip="Trasladar de facultad"
        onClick={() => setTrasladarFacultadTarget(row)}
      />
      <Button
        icon="pi pi-id-card"
        className="p-button-rounded p-button-sm p-button-warning"
        tooltip="Cambiar rol"
        onClick={() => setCambiarRolTarget(row)}
      />
    </div>
  );

  return (
    <>
      <div className="d-flex align-items-end gap-3 mb-3 flex-wrap">
        <h5 className="m-0">Vinculaciones con Grupo</h5>
        <div className="ms-auto" style={{ minWidth: 260 }}>
          <label htmlFor="excluirRol" className="d-block">
            Excluir rol (opcional)
          </label>
          <Dropdown
            inputId="excluirRol"
            value={excluirRolGrupoId}
            options={rolesGrupo}
            onChange={(e) => handleFiltrar(e.value)}
            optionLabel="cargo"
            optionValue="id"
            filter
            showClear
            placeholder="Sin filtro"
            className="w-full"
          />
        </div>
      </div>

      <DataTable value={conGrupo} loading={conGrupoLoading} paginator rows={15} emptyMessage="No hay vinculaciones con grupo." responsiveLayout="scroll" dataKey="id">
        <Column field="persona_nombre" header="Persona" sortable />
        <Column field="grupo_nombre" header="Grupo" sortable />
        <Column field="rol_grupo_nombre" header="Rol" sortable />
        <Column field="vinculacion" header="Vinculado desde" sortable />
        <Column header="Acciones" body={accionesTemplate} />
      </DataTable>

      <TrasladarGrupoModal visible={!!trasladarGrupoTarget} onHide={() => setTrasladarGrupoTarget(null)} vinculo={trasladarGrupoTarget} onSuccess={() => cargar(excluirRolGrupoId)} />
      <TrasladarFacultadModal visible={!!trasladarFacultadTarget} onHide={() => setTrasladarFacultadTarget(null)} vinculo={trasladarFacultadTarget} onSuccess={() => cargar(excluirRolGrupoId)} />
      <CambiarRolGrupoModal visible={!!cambiarRolTarget} onHide={() => setCambiarRolTarget(null)} vinculo={cambiarRolTarget} onSuccess={() => cargar(excluirRolGrupoId)} />
    </>
  );
};

export default ConGrupoTable;