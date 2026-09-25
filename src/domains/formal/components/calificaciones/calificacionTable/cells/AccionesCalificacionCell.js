// src/domains/formal/components/calificaciones/calificacionTable/cells/AccionesCalificacionCell.js
import React from 'react';
import { Button } from 'primereact/button';

/**
 * Celda de acciones reutilizada entre "Pendientes" y "Calificados".
 * variante="pendiente": botón calificar + (opcional) toggle de corrección + ver documentos.
 * variante="calificado": botón ver resultados + ver documentos.
 */
const AccionesCalificacionCell = ({
  rowData, variante, puedeCalificar, puedeGestionarCorreccion,
  accionLoadingId, onCalificar, onToggleCorreccion, onVerDocumentos,
}) => (
  <div className="d-flex gap-2 flex-wrap">
    {variante === 'pendiente' && puedeCalificar && (
      <Button
        icon="pi pi-check-square"
        className="p-button-rounded p-button-warning p-button-sm"
        tooltip="Calificar proyecto"
        onClick={() => onCalificar(rowData)}
      />
    )}
    {variante === 'calificado' && (
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-info p-button-sm"
        tooltip="Ver resultados de calificación"
        onClick={() => onCalificar(rowData)}
      />
    )}
    {variante === 'pendiente' && puedeGestionarCorreccion && (
      <Button
        icon={rowData.modificacion_documento_proyecto ? 'pi pi-lock' : 'pi pi-lock-open'}
        className={`p-button-rounded p-button-sm ${
          rowData.modificacion_documento_proyecto ? 'p-button-secondary' : 'p-button-help'
        }`}
        tooltip={
          rowData.modificacion_documento_proyecto
            ? 'Deshabilitar corrección de documentos'
            : 'Habilitar corrección de documentos'
        }
        loading={accionLoadingId === rowData.id}
        onClick={() => onToggleCorreccion(rowData)}
      />
    )}
    <Button
      icon="pi pi-folder-open"
      className="p-button-rounded p-button-secondary p-button-sm"
      tooltip="Ver documentos de participación"
      onClick={() => onVerDocumentos(rowData)}
    />
  </div>
);

export default AccionesCalificacionCell;