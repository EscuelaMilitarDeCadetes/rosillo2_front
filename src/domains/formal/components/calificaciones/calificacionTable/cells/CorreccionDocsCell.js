// src/domains/formal/components/calificaciones/calificacionTable/cells/CorreccionDocsCell.js
import React from 'react';
import { Tag } from 'primereact/tag';

const CorreccionDocsCell = ({ rowData }) => (
  <Tag
    severity={rowData.modificacion_documento_proyecto ? 'info' : 'secondary'}
    value={rowData.modificacion_documento_proyecto ? 'Corrección habilitada' : 'Corrección cerrada'}
  />
);

export default CorreccionDocsCell;