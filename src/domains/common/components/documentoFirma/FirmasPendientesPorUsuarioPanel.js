// src/domains/common/components/documentoFirma/FirmasPendientesPorUsuarioPanel.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';
import MisFirmasPendientesTable from './MisFirmasPendientesTable';

const nombreUsuario = (u) => u.persona_actual_nombre || u.username;

// Visibilidad ampliada para consultar el turno de firma de un tercero,
// según el backend (roles_con_visibilidad_ampliada en
// DocumentoFirmanteViewSet.pendientes_por_usuario): SOPORTE, CINTERNO,
// FACULTAD, GRUPO, CEXTERNO.
const FirmasPendientesPorUsuarioPanel = () => {
  const dispatch = useDispatch();
  const { usuarios, loading: cargandoMetadata } = useSelector((state) => state.metadata);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    if (!usuarios?.length) dispatch(fetchMetadata());
  }, [dispatch, usuarios]);

  return (
    <div>
      <div className="field mb-3" style={{ maxWidth: '25rem' }}>
        <label htmlFor="firmanteConsulta" className="d-block mb-1">
          Consultar firmas pendientes de:
        </label>
        <Dropdown
          inputId="firmanteConsulta"
          value={usuarioId}
          options={usuarios}
          onChange={(e) => setUsuarioId(e.value)}
          optionLabel={nombreUsuario}
          optionValue="id"
          filter
          showClear
          placeholder="Seleccione un usuario"
          disabled={cargandoMetadata}
          className="w-100"
        />
      </div>
      {usuarioId ? (
        <MisFirmasPendientesTable usuarioId={usuarioId} soloLectura />
      ) : (
        <span className="text-muted small">Seleccione un usuario para ver sus firmas pendientes.</span>
      )}
    </div>
  );
};

export default FirmasPendientesPorUsuarioPanel;