// src/domains/common/components/aprobacion/EstadoAprobacionResumen.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tag } from 'primereact/tag';
import { fetchUltimaAprobacionPorDocumento, limpiarUltimaAprobacion } from '../../features/aprobacion/aprobacionSlice';

const severidadPorEstado = { PENDIENTE: 'warning', APROBADO: 'success', RECHAZADO: 'danger' };

// Badge compacto para celdas de tabla o encabezados de página que solo
// necesitan saber el estado MÁS RECIENTE de aprobación de un documento
// (ej: columna "Aprobación" en un listado de proyectos), sin cargar el
// historial completo como AprobacionesPorDocumentoPanel. Usa el endpoint
// ultima-por-documento/, dedicado exactamente a este caso de uso.
const EstadoAprobacionResumen = ({ tipoDocumentoId, idDocumento }) => {
  const dispatch = useDispatch();
  const { ultimaPorDocumento, loadingUltima } = useSelector((state) => state.aprobacion);

  useEffect(() => {
    if (tipoDocumentoId && idDocumento) {
      dispatch(fetchUltimaAprobacionPorDocumento({ tipoDocumentoId, idDocumento }));
    }
    return () => {
      dispatch(limpiarUltimaAprobacion());
    };
  }, [dispatch, tipoDocumentoId, idDocumento]);

  if (loadingUltima) return <span className="text-muted small">...</span>;
  if (!ultimaPorDocumento) return <Tag value="Sin aprobación" severity="secondary" />;

  return (
    <Tag
      value={ultimaPorDocumento.estado}
      severity={severidadPorEstado[ultimaPorDocumento.estado] || 'secondary'}
      title={ultimaPorDocumento.usuario_revisor}
    />
  );
};

export default EstadoAprobacionResumen;