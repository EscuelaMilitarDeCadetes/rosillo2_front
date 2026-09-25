// src/domains/formal/components/calificaciones/calificacionTable/cells/MontoAprobadoCell.js
import React from 'react';
import { Tag } from 'primereact/tag';

// Compartida entre "Pendientes" y "Calificados".
const MontoAprobadoCell = ({ rowData }) =>
  rowData.monto_aprobado != null
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(rowData.monto_aprobado)
    : <Tag severity="warning" value="Sin aprobar" />;

export default MontoAprobadoCell;