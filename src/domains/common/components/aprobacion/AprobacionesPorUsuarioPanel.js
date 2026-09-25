// src/domains/common/components/aprobacion/AprobacionesPorUsuarioPanel.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';
import AprobacionesPendientesTable from './AprobacionesPendientesTable';

const nombreUsuario = (u) => u.persona_actual_nombre || u.username;

// Gestión de turnos de aprobación de un tercero: permite a un supervisor o
// decano ver cuántas y cuáles solicitudes tiene pendientes cualquier
// revisor de la plataforma, reutilizando el mismo endpoint 'pendientes/'
// (que ya acepta usuario_revisor como filtro) que la vista de autoservicio.
const AprobacionesPorUsuarioPanel = () => {
  const dispatch = useDispatch();
  const { usuarios, loading: cargandoMetadata } = useSelector((state) => state.metadata);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    if (!usuarios?.length) dispatch(fetchMetadata());
  }, [dispatch, usuarios]);

  return (
    <div>
      <div className="field mb-3" style={{ maxWidth: '25rem' }}>
        <label htmlFor="revisor" className="d-block mb-1">
          Consultar turno pendiente de:
        </label>
        <Dropdown
          inputId="revisor"
          value={usuarioId}
          options={usuarios}
          onChange={(e) => setUsuarioId(e.value)}
          optionLabel={nombreUsuario}
          optionValue="id"
          filter
          showClear
          placeholder="Seleccione un usuario revisor"
          disabled={cargandoMetadata}
          className="w-100"
        />
      </div>
      {usuarioId ? (
        <AprobacionesPendientesTable usuarioId={usuarioId} soloLectura />
      ) : (
        <span className="text-muted small">Seleccione un usuario para ver sus solicitudes pendientes.</span>
      )}
    </div>
  );
};

export default AprobacionesPorUsuarioPanel;