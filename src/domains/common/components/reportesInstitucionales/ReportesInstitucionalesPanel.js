// src/domains/common/components/reportesInstitucionales/ReportesInstitucionalesPanel.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Message } from 'primereact/message';
import { TabView, TabPanel } from 'primereact/tabview';
import {
  fetchFacultadPorUsuario,
  fetchGrupoPorUsuario,
  fetchFacultadesPorGrupo,
  limpiarReportePorUsuario,
} from '../../../../features/reportesInstitucionales/reportesInstitucionalesSlice';

/**
 * Dos reportes de solo lectura (IsAuthenticated, sin rol específico):
 * 1) "Facultad / Grupo por Usuario": dado un usuario_id, consulta EN
 *    PARALELO su facultad activa y su grupo activo 
 * 2) "Facultades por Grupo": Dropdown de grupo -> lista de facultades vinculadas
 *    a ese grupo. `grupo_id` es obligatorio: el botón está deshabilitado sin
 *    selección, porque el backend responde 400 si se omite.
 */
const ReportesInstitucionalesPanel = () => {
  const dispatch = useDispatch();
  const { grupos } = useSelector((state) => state.metadata);
  const {
    facultadPorUsuario,
    facultadPorUsuarioLoading,
    facultadPorUsuarioError,
    grupoPorUsuario,
    grupoPorUsuarioLoading,
    grupoPorUsuarioError,
    facultadesPorGrupo,
    facultadesPorGrupoLoading,
  } = useSelector((state) => state.reportesInstitucionales);

  const [usuarioId, setUsuarioId] = useState(null);
  const [grupoIdFiltro, setGrupoIdFiltro] = useState(null);
  const [consultaRealizada, setConsultaRealizada] = useState(false);

  const handleConsultarPorUsuario = () => {
    if (!usuarioId) return;
    dispatch(limpiarReportePorUsuario());
    dispatch(fetchFacultadPorUsuario(usuarioId));
    dispatch(fetchGrupoPorUsuario(usuarioId));
    setConsultaRealizada(true);
  };

  const handleConsultarPorGrupo = () => {
    if (!grupoIdFiltro) return;
    dispatch(fetchFacultadesPorGrupo(grupoIdFiltro));
  };

  const renderErrorPorUsuario = (err) =>
    err && (
      <Message
        severity={err.ambiguo ? 'warn' : 'error'}
        className="w-full mt-2"
        text={
          err.ambiguo
            ? `Inconsistencia de datos: ${err.mensaje} (el usuario tiene más de una vinculación activa; hay que corregirlo en PersonaXGrupo).`
            : err.mensaje
        }
      />
    );

  return (
    <TabView>
      <TabPanel header="Facultad / Grupo por Usuario">
        <div className="d-flex align-items-end gap-3 mb-3 flex-wrap">
          <div>
            <label htmlFor="usuarioIdReporte" className="d-block">
              ID de Usuario
            </label>
            <InputNumber id="usuarioIdReporte" value={usuarioId} onValueChange={(e) => setUsuarioId(e.value)} useGrouping={false} />
          </div>
          <Button label="Consultar" icon="pi pi-search" onClick={handleConsultarPorUsuario} disabled={!usuarioId} loading={facultadPorUsuarioLoading || grupoPorUsuarioLoading} />
        </div>

        {consultaRealizada && (
          <div className="d-flex gap-4 flex-wrap">
            <div style={{ minWidth: 260 }}>
              <div className="text-muted small">Facultad activa</div>
              {facultadPorUsuarioLoading ? (
                <span>Cargando...</span>
              ) : facultadPorUsuarioError ? (
                renderErrorPorUsuario(facultadPorUsuarioError)
              ) : (
                <strong>{facultadPorUsuario ? `${facultadPorUsuario.nombre_facultad} (${facultadPorUsuario.abreviatura})` : 'Ninguna'}</strong>
              )}
            </div>
            <div style={{ minWidth: 260 }}>
              <div className="text-muted small">Grupo activo</div>
              {grupoPorUsuarioLoading ? (
                <span>Cargando...</span>
              ) : grupoPorUsuarioError ? (
                renderErrorPorUsuario(grupoPorUsuarioError)
              ) : (
                <strong>{grupoPorUsuario ? `${grupoPorUsuario.nombre_grupo} (${grupoPorUsuario.sigla_grupo})` : 'Ninguno'}</strong>
              )}
            </div>
          </div>
        )}
      </TabPanel>

      <TabPanel header="Facultades por Grupo">
        <div className="d-flex align-items-end gap-3 mb-3 flex-wrap">
          <div style={{ minWidth: 260 }}>
            <label htmlFor="grupoFiltro" className="d-block">
              Grupo
            </label>
            <Dropdown
              inputId="grupoFiltro"
              value={grupoIdFiltro}
              options={grupos}
              onChange={(e) => setGrupoIdFiltro(e.value)}
              optionLabel="nombre_grupo"
              optionValue="id"
              filter
              className="w-full"
              placeholder="Seleccione un grupo"
            />
          </div>
          <Button label="Consultar" icon="pi pi-search" onClick={handleConsultarPorGrupo} disabled={!grupoIdFiltro} loading={facultadesPorGrupoLoading} />
        </div>

        <DataTable value={facultadesPorGrupo} loading={facultadesPorGrupoLoading} emptyMessage="Sin resultados." responsiveLayout="scroll" dataKey="id">
          <Column field="nombre_facultad" header="Facultad" />
          <Column field="abreviatura" header="Abreviatura" />
        </DataTable>
      </TabPanel>
    </TabView>
  );
};

export default ReportesInstitucionalesPanel;