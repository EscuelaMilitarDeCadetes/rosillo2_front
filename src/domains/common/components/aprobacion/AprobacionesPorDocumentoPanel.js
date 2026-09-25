// src/domains/common/components/aprobacion/AprobacionesPorDocumentoPanel.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tag } from 'primereact/tag';
import { fetchAprobacionesPorDocumento } from '../../features/aprobacion/aprobacionSlice';

const severidadPorEstado = { PENDIENTE: 'warning', APROBADO: 'success', RECHAZADO: 'danger' };

// Panel embebible en cualquier pantalla dueña de un documento
// (ej: detalle de convocatoria, producto Minciencias) que necesite
// mostrar el historial de aprobaciones asociado a un tipo_documento + id_documento.
const AprobacionesPorDocumentoPanel = ({ tipoDocumentoId, idDocumento }) => {
  const dispatch = useDispatch();
  const { porDocumento, loading } = useSelector((state) => state.aprobacion);

  useEffect(() => {
    if (tipoDocumentoId && idDocumento) {
      dispatch(fetchAprobacionesPorDocumento({ tipoDocumentoId, idDocumento }));
    }
  }, [dispatch, tipoDocumentoId, idDocumento]);

  if (loading) return <span className="text-muted small">Cargando aprobaciones...</span>;
  if (!porDocumento.length) return <span className="text-muted small">Sin solicitudes de aprobación registradas.</span>;

  return (
    <ul className="list-unstyled small">
      {porDocumento.map((a) => (
        <li key={a.id} className="d-flex align-items-center gap-2 mb-1">
          <Tag value={a.estado} severity={severidadPorEstado[a.estado] || 'secondary'} />
          {/* El endpoint por-documento ya ordena por -fecha_revision, así que
              la primera solicitud en estado PENDIENTE es el turno vigente. */}
          {a.estado === 'PENDIENTE' && <Tag value="Turno actual" severity="info" className="p-tag-rounded" />}
          <span>{a.usuario_revisor}</span>
          {a.observacion && <span className="text-muted">— {a.observacion}</span>}
        </li>
      ))}
    </ul>
  );
};

export default AprobacionesPorDocumentoPanel;