// src/domains/formal/components/proyectos/formatos/GenerarBorradorButton.js
// Descarga un borrador .docx del formato, ya diligenciado con los datos que
// el sistema tiene del proyecto (propuesta confirmada, controles de cambio,
// montos...). El usuario completa lo nuevo y luego sube el PDF final.
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { descargarBorradorFormato } from '../../../../../features/formatos/formatosSlice';
import { mostrarToast } from '../../../../../utils/notificador';

const leerErrorBlob = async (error) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const texto = await data.text();
      const json = JSON.parse(texto);
      return json.detail || json.error || Object.values(json).flat().join(' ');
    } catch (e) {
      return null;
    }
  }
  return null;
};

const GenerarBorradorButton = ({
  proyectoId,
  tipoDocumentoId,
  controlCambiosId = null,
  label = null,
  tooltip = 'Generar borrador (.docx) con los datos del proyecto',
  className = 'p-button-rounded p-button-secondary p-button-sm',
  onAntesDeGenerar = null,
}) => {
  const [generando, setGenerando] = useState(false);

  const handleClick = async () => {
    if (onAntesDeGenerar) {
      // p. ej. abrir un selector de control de cambios en lugar de descargar
      onAntesDeGenerar();
      return;
    }
    setGenerando(true);
    try {
      const nombre = await descargarBorradorFormato({ proyectoId, tipoDocumentoId, controlCambiosId });
      mostrarToast({
        severity: 'success',
        summary: 'Borrador generado',
        detail: `${nombre}: revise y complete los campos nuevos antes de cargar el PDF definitivo.`,
      });
    } catch (error) {
      const detalle = (await leerErrorBlob(error)) || 'No fue posible generar el borrador.';
      mostrarToast({ severity: 'error', summary: 'Error', detail: detalle });
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Button
      icon="pi pi-file-word"
      label={label || undefined}
      className={className}
      tooltip={tooltip}
      tooltipOptions={{ position: 'top' }}
      loading={generando}
      onClick={handleClick}
    />
  );
};

export default GenerarBorradorButton;
