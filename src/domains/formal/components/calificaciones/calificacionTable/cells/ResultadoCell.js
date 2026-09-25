// src/domains/formal/components/calificaciones/calificacionTable/cells/ResultadoCell.js
import React from 'react';
import { Tag } from 'primereact/tag';

const ResultadoCell = ({ rowData }) => {
  if (!rowData.calificacion_ultimo_filtro_calificacion) return '-';
  const aprobado = rowData.calificacion_ultimo_filtro_calificacion === 'APROBADO';
  return <Tag severity={aprobado ? 'success' : 'danger'} value={aprobado ? 'APROBADO' : 'NO APROBADO'} />;
};

export default ResultadoCell;