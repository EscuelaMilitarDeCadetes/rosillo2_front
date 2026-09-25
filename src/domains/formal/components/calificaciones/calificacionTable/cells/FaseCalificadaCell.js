// src/domains/formal/components/calificaciones/calificacionTable/cells/FaseCalificadaCell.js
import React from 'react';

const FaseCalificadaCell = ({ rowData }) =>
  rowData.ultimo_filtro_calificacion || <span className="text-muted">Sin iniciar</span>;

export default FaseCalificadaCell;