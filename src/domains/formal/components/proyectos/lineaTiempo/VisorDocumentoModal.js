// src/domains/formal/components/proyectos/lineaTiempo/VisorDocumentoModal.js
//
// Muestra en pantalla un DocumentoFirma (PDF o imagen) y permite descargarlo.
// El archivo se pide con el token del usuario (axiosInstance) y se muestra
// como blob, así no hace falta exponer la ruta del archivo en el servidor.
import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import axiosInstance from '../../../../../api/axiosInstance';

const TIPOS_MIME = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
};

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' });

const VisorDocumentoModal = ({ documento, onHide }) => {
  const [url, setUrl] = useState(null);
  const [mime, setMime] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documento) return undefined;
    let cancelado = false;
    let urlCreada = null;
    setCargando(true);
    setError(null);
    setUrl(null);
    axiosInstance
      .get(`common/documento-firma/${documento.id}/descargar/`, {
        responseType: 'blob',
        suppressErrorRedirect: true,
      })
      .then((response) => {
        if (cancelado) return;
        const tipo =
          TIPOS_MIME[documento.extension] ||
          response.headers['content-type'] ||
          'application/octet-stream';
        urlCreada = window.URL.createObjectURL(new Blob([response.data], { type: tipo }));
        setMime(tipo);
        setUrl(urlCreada);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(
          err.response?.status === 404
            ? 'El archivo no se encuentra en el servidor.'
            : 'No se pudo cargar el documento.'
        );
      })
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
      if (urlCreada) window.URL.revokeObjectURL(urlCreada);
    };
  }, [documento]);

  const descargar = () => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', documento.nombre_archivo || documento.tipo_documento_nombre || 'documento');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const esPdf = mime === 'application/pdf';
  const esImagen = mime?.startsWith('image/');

  const header = documento && (
    <div>
      <div>{documento.tipo_documento_nombre} <small className="text-muted">v{documento.version}</small></div>
      <div className="small fw-normal text-muted">
        Cargado el {formatoFecha.format(new Date(documento.fecha_creacion))}
        {documento.nombre_archivo ? ` · ${documento.nombre_archivo}` : ''}
      </div>
    </div>
  );

  const footer = (
    <div className="d-flex justify-content-between flex-wrap gap-2">
      {url && esPdf ? (
        <Button
          label="Abrir en otra pestaña"
          icon="pi pi-external-link"
          className="p-button-text"
          onClick={() => window.open(url, '_blank', 'noopener')}
        />
      ) : <span />}
      <div className="d-flex gap-2">
        <Button label="Cerrar" className="p-button-secondary" onClick={onHide} />
        <Button label="Descargar" icon="pi pi-download" onClick={descargar} disabled={!url} />
      </div>
    </div>
  );

  return (
    <Dialog
      header={header}
      footer={footer}
      visible={!!documento}
      onHide={onHide}
      style={{ width: '90vw', maxWidth: '1100px' }}
      breakpoints={{ '768px': '100vw' }}
      maximizable
    >
      {cargando && (
        <div className="d-flex justify-content-center p-5"><ProgressSpinner /></div>
      )}
      {error && <div className="alert alert-danger mb-0">{error}</div>}
      {url && esPdf && (
        <iframe className="lt-visor-frame" src={url} title={documento?.tipo_documento_nombre || 'Documento'} />
      )}
      {url && esImagen && (
        <div className="text-center">
          <img src={url} alt={documento?.tipo_documento_nombre || 'Documento'} style={{ maxWidth: '100%', maxHeight: '75vh' }} />
        </div>
      )}
      {url && !esPdf && !esImagen && (
        <div className="text-center text-muted p-5">
          <i className="pi pi-file" style={{ fontSize: '2.5rem' }} />
          <p className="mt-3 mb-0">
            La vista previa no está disponible para este tipo de archivo
            {documento?.extension ? ` (.${documento.extension})` : ''}. Use el botón <strong>Descargar</strong>.
          </p>
        </div>
      )}
    </Dialog>
  );
};

export default VisorDocumentoModal;
