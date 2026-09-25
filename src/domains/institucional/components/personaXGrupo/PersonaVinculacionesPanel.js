// src/domains/institucional/components/personaXGrupo/PersonaVinculacionesPanel.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { InputSwitch } from 'primereact/inputswitch';
import {
  fetchPerfilInstitucionalPersona,
  fetchPorPersona,
  limpiarPerfilPersona,
} from '../../../../features/personaXGrupo/personaXGrupoSlice';

/**
 * Panel de consulta "Perfil institucional de una Persona": agrupa en una
 * sola vista los sub-endpoints persona/{id}/tipo|facultad|grupo|activas y
 * por-persona/{id}, que por separado solo devuelven datos sueltos sin
 * contexto. 
 */
const PersonaVinculacionesPanel = () => {
  const dispatch = useDispatch();
  const { personas } = useSelector((state) => state.metadata);
  const { tipo, facultadActiva, grupoActivo, activas, porPersona, perfilLoading } = useSelector(
    (state) => state.personaXGrupo
  );

  const [personaId, setPersonaId] = useState(null);
  const [soloActivos, setSoloActivos] = useState(true);

  useEffect(() => {
    if (personaId) {
      dispatch(fetchPerfilInstitucionalPersona(personaId));
    } else {
      dispatch(limpiarPerfilPersona());
    }
  }, [personaId, dispatch]);

  const handleToggleSoloActivos = (value) => {
    setSoloActivos(value);
    if (personaId) dispatch(fetchPorPersona({ personaId, soloActivos: value }));
  };

  const tipoSeverity = { ADMINISTRATIVO: 'warning', INVESTIGADOR: 'success', FACULTAD: 'info' };

  const estadoBodyTemplate = (rowData) => (
    <Tag severity={rowData.estado ? 'success' : 'secondary'} value={rowData.estado ? 'Activo' : 'Desvinculado'} />
  );

  return (
    <>
      <h5 className="mb-3">Perfil Institucional por Persona</h5>
      <div className="field" style={{ maxWidth: 420 }}>
        <label htmlFor="persona">Persona</label>
        <Dropdown
          inputId="persona"
          value={personaId}
          options={personas}
          onChange={(e) => setPersonaId(e.value)}
          optionLabel={(p) => `${p.nombre} ${p.apellido} (${p.documento})`}
          optionValue="id"
          filter
          showClear
          className="w-full"
          placeholder="Buscar persona..."
        />
      </div>

      {personaId && (
        <>
          <div className="d-flex gap-4 my-3 flex-wrap">
            <div>
              <div className="text-muted small">Tipo</div>
              {tipo ? <Tag severity={tipoSeverity[tipo] || 'info'} value={tipo} /> : <span>—</span>}
            </div>
            <div>
              <div className="text-muted small">Facultad activa</div>
              <strong>{facultadActiva ? `${facultadActiva.nombre} (${facultadActiva.abreviatura})` : 'Ninguna'}</strong>
            </div>
            <div>
              <div className="text-muted small">Grupo activo</div>
              <strong>{grupoActivo ? `${grupoActivo.nombre} (${grupoActivo.sigla})` : 'Ninguno'}</strong>
            </div>
            <div>
              <div className="text-muted small">Vinculaciones activas</div>
              <strong>{activas?.length ?? 0}</strong>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 mb-2">
            <InputSwitch inputId="soloActivos" checked={soloActivos} onChange={(e) => handleToggleSoloActivos(e.value)} />
            <label htmlFor="soloActivos">Mostrar solo vinculaciones activas</label>
          </div>

          <DataTable value={porPersona} loading={perfilLoading} paginator rows={10} emptyMessage="Sin vinculaciones registradas." responsiveLayout="scroll" dataKey="id">
            <Column field="grupo_nombre" header="Grupo" />
            <Column field="facultad_nombre" header="Facultad" />
            <Column field="rol_grupo_nombre" header="Rol" />
            <Column field="vinculacion" header="Vinculado desde" sortable />
            <Column field="desvinculacion" header="Desvinculado" sortable />
            <Column header="Estado" body={estadoBodyTemplate} />
          </DataTable>
        </>
      )}
    </>
  );
};

export default PersonaVinculacionesPanel;