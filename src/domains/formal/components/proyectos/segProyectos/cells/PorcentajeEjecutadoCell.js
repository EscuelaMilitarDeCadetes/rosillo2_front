// src/domains/formal/components/proyectos/segProyectos/cells/PorcentajeEjecutadoCell.js
import React from "react";

const PorcentajeEjecutadoCell = ({ cargando, ejecutado, montoAprobado }) => {
  if (cargando || ejecutado == null || !montoAprobado) return "N/A";
  const pct = (ejecutado * 100) / montoAprobado;
  return `${(pct >= 0 ? pct : 0).toFixed(2)}%`;
};

export default PorcentajeEjecutadoCell;