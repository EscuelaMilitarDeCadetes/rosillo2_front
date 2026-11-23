// src/domains/formal/components/proyectos/lineaTiempo/LineaTiempoDocumentosModal.js
//
// Línea de tiempo horizontal con los documentos cargados al proyecto
// (tipo de documento + fecha de cargue). Se puede:
//   - filtrar por tipo de documento y por rango de fechas de cargue,
//   - desplazar a izquierda/derecha arrastrando con el mouse, con la rueda,
//     con las flechas o con el dedo en celulares y tablets,
//   - dar clic a un documento para verlo en pantalla y descargarlo.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import axiosInstance from '../../../../../api/axiosInstance';
import VisorDocumentoModal from './VisorDocumentoModal';
import './LineaTiempoDocumentos.css';

const PALETA = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#db2777', '#65a30d', '#475569'];

const ESTADOS = {
  BORRADOR: { etiqueta: 'Borrador', severity: 'secondary' },
  EN_FIRMAS: { etiqueta: 'En firmas', severity: 'info' },
  FIRMADO: { etiqueta: 'Entregado', severity: 'success' },
  RECHAZADO: { etiqueta: 'Rechazado', severity: 'danger' },
};

const UMBRAL_ARRASTRE_PX = 5;

const colorPorTipo = (nombre = '') => {
  let h = 0;
  for (let i = 0; i < nombre.length; i += 1) h = (h * 31 + nombre.charCodeAt(i)) >>> 0;
  return PALETA[h % PALETA.length];
};

const aFechaISO = (fecha) => {
  if (!fecha) return null;
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
const formatoMes = new Intl.DateTimeFormat('es-CO', { month: 'short', year: 'numeric' });

const LineaTiempoDocumentosModal = ({ visible, onHide, proyectoId, tituloProyecto }) => {
  const [documentos, setDocumentos] = useState([]);
  const [opcionesTipo, setOpcionesTipo] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [rangoFechas, setRangoFechas] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [documentoAbierto, setDocumentoAbierto] = useState(null);

  const scrollRef = useRef(null);
  const arrastre = useRef({ activo: false, inicioX: 0, scrollInicial: 0, movido: false });
  const [arrastrando, setArrastrando] = useState(false);

  // ------- Carga de datos -------
  const [fechaDesde, fechaHasta] = useMemo(() => {
    if (!rangoFechas || !rangoFechas[0]) return [null, null];
    // Mientras el usuario solo ha elegido el primer día se filtra por ese día.
    return [aFechaISO(rangoFechas[0]), aFechaISO(rangoFechas[1] || rangoFechas[0])];
  }, [rangoFechas]);

  useEffect(() => {
    if (!visible || !proyectoId) return undefined;
    let cancelado = false;
    const params = {};
    if (tipoSeleccionado) params.tipo_documento = tipoSeleccionado;
    if (fechaDesde) params.fecha_desde = fechaDesde;
    if (fechaHasta) params.fecha_hasta = fechaHasta;
    const sinFiltros = Object.keys(params).length === 0;

    setCargando(true);
    setError(null);
    axiosInstance
      .get(`investigacion-formal/proyectos/${proyectoId}/linea-tiempo-documentos/`, {
        params,
        suppressErrorRedirect: true,
      })
      .then(({ data }) => {
        if (cancelado) return;
        setDocumentos(data);
        if (sinFiltros) {
          // Las opciones del filtro salen de los tipos que realmente tiene el proyecto.
          const vistos = new Map();
          data.forEach((d) => vistos.set(d.tipo_documento, d.tipo_documento_nombre));
          setOpcionesTipo(
            [...vistos.entries()]
              .map(([value, label]) => ({ value, label }))
              .sort((a, b) => a.label.localeCompare(b.label, 'es'))
          );
        }
      })
      .catch((err) => {
        if (cancelado) return;
        setDocumentos([]);
        setError(err.response?.data?.error || err.response?.data?.detail || 'No se pudo cargar la línea de tiempo.');
      })
      .finally(() => !cancelado && setCargando(false));
    return () => { cancelado = true; };
  }, [visible, proyectoId, tipoSeleccionado, fechaDesde, fechaHasta]);

  // Al cargar, se muestra el extremo derecho (los documentos más recientes).
  useEffect(() => {
    const el = scrollRef.current;
    if (el && documentos.length) el.scrollLeft = el.scrollWidth;
  }, [documentos]);

  // Rueda vertical del mouse => desplazamiento horizontal.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [visible, cargando]);

  // ------- Arrastre con mouse (el toque usa el scroll nativo con inercia) -------
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = scrollRef.current;
    arrastre.current = { activo: true, inicioX: e.clientX, scrollInicial: el.scrollLeft, movido: false };
  };

  const onPointerMove = (e) => {
    const a = arrastre.current;
    if (!a.activo) return;
    const dx = e.clientX - a.inicioX;
    if (!a.movido && Math.abs(dx) > UMBRAL_ARRASTRE_PX) {
      a.movido = true;
      setArrastrando(true);
      scrollRef.current.setPointerCapture?.(e.pointerId);
    }
    if (a.movido) scrollRef.current.scrollLeft = a.scrollInicial - dx;
  };

  const terminarArrastre = (e) => {
    const a = arrastre.current;
    if (!a.activo) return;
    a.activo = false;
    setArrastrando(false);
    if (scrollRef.current?.hasPointerCapture?.(e.pointerId)) {
      scrollRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // Si hubo arrastre, el clic que sigue no debe abrir el documento.
  const onClickCapture = (e) => {
    if (arrastre.current.movido) {
      e.stopPropagation();
      e.preventDefault();
      arrastre.current.movido = false;
    }
  };

  const desplazar = useCallback((sentido) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: sentido * el.clientWidth * 0.8, behavior: 'smooth' });
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') desplazar(-1);
    if (e.key === 'ArrowRight') desplazar(1);
  };

  // ------- Render -------
  const elementos = useMemo(() => {
    const salida = [];
    let mesAnterior = null;
    documentos.forEach((doc, idx) => {
      const fecha = new Date(doc.fecha_creacion);
      const claveMes = `${fecha.getFullYear()}-${fecha.getMonth()}`;
      if (claveMes !== mesAnterior) {
        salida.push({ tipo: 'mes', clave: `mes-${claveMes}`, etiqueta: formatoMes.format(fecha) });
        mesAnterior = claveMes;
      }
      salida.push({ tipo: 'doc', clave: `doc-${doc.id}`, doc, fecha, arriba: idx % 2 === 0 });
    });
    return salida;
  }, [documentos]);

  const limpiarFiltros = () => {
    setTipoSeleccionado(null);
    setRangoFechas(null);
  };

  const hayFiltros = tipoSeleccionado || rangoFechas;

  const cerrar = () => {
    limpiarFiltros();
    onHide();
  };

  return (
    <>
      <Dialog
        header={`Línea de tiempo de documentos${tituloProyecto ? ` — ${tituloProyecto}` : ''}`}
        visible={visible}
        onHide={cerrar}
        style={{ width: '95vw', maxWidth: '1400px' }}
        breakpoints={{ '768px': '100vw' }}
        maximizable
        dismissableMask
      >
        <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
          <div className="d-flex flex-column">
            <label htmlFor="lt-tipo" className="small fw-semibold mb-1">Tipo de documento</label>
            <Dropdown
              inputId="lt-tipo"
              value={tipoSeleccionado}
              options={opcionesTipo}
              onChange={(e) => setTipoSeleccionado(e.value)}
              placeholder="Todos los tipos"
              filter
              showClear
              style={{ minWidth: '240px' }}
            />
          </div>
          <div className="d-flex flex-column">
            <label htmlFor="lt-fechas" className="small fw-semibold mb-1">Fecha de cargue</label>
            <Calendar
              inputId="lt-fechas"
              value={rangoFechas}
              onChange={(e) => setRangoFechas(e.value)}
              selectionMode="range"
              readOnlyInput
              showButtonBar
              showIcon
              dateFormat="dd/mm/yy"
              placeholder="Desde – hasta"
              style={{ minWidth: '240px' }}
            />
          </div>
          {hayFiltros && (
            <Button label="Limpiar filtros" icon="pi pi-filter-slash" className="p-button-text" onClick={limpiarFiltros} />
          )}
          <span className="ms-auto small text-muted">
            {cargando ? 'Cargando…' : `${documentos.length} documento(s)`}
          </span>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {cargando && documentos.length === 0 ? (
          <div className="d-flex justify-content-center p-5"><ProgressSpinner /></div>
        ) : documentos.length === 0 && !error ? (
          <div className="text-center text-muted p-5">
            <i className="pi pi-inbox" style={{ fontSize: '2rem' }} />
            <p className="mt-2 mb-0">
              {hayFiltros ? 'Ningún documento coincide con los filtros.' : 'Este proyecto aún no tiene documentos cargados.'}
            </p>
          </div>
        ) : (
          <div className="lt-wrapper">
            <Button
              icon="pi pi-chevron-left"
              className="p-button-rounded p-button-outlined lt-flecha lt-izq"
              aria-label="Desplazar a la izquierda"
              onClick={() => desplazar(-1)}
            />
            <div
              ref={scrollRef}
              className={`lt-scroll${arrastrando ? ' lt-arrastrando' : ''}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={terminarArrastre}
              onPointerCancel={terminarArrastre}
              onPointerLeave={terminarArrastre}
              onClickCapture={onClickCapture}
              onKeyDown={onKeyDown}
              onDragStart={(e) => e.preventDefault()}
              tabIndex={0}
              role="region"
              aria-label="Línea de tiempo de documentos. Use las flechas del teclado para desplazarse."
            >
              <div className="lt-track">
                {elementos.map((el) =>
                  el.tipo === 'mes' ? (
                    <div key={el.clave} className="lt-mes"><span>{el.etiqueta}</span></div>
                  ) : (
                    <div key={el.clave} className={`lt-item ${el.arriba ? 'lt-arriba' : 'lt-abajo'}`}>
                      <div className="lt-conector" />
                      <div className="lt-punto" style={{ background: colorPorTipo(el.doc.tipo_documento_nombre) }} />
                      <button
                        type="button"
                        className="lt-tarjeta"
                        style={{ '--lt-color': colorPorTipo(el.doc.tipo_documento_nombre) }}
                        onClick={() => setDocumentoAbierto(el.doc)}
                        title={`Ver ${el.doc.tipo_documento_nombre}`}
                      >
                        <div className="lt-fecha"><i className="pi pi-calendar me-1" />{formatoFecha.format(el.fecha)}</div>
                        <div className="lt-tipo">{el.doc.tipo_documento_nombre}</div>
                        <div className="d-flex align-items-center justify-content-between gap-1">
                          <span className="lt-meta">v{el.doc.version}{el.doc.extension ? ` · ${el.doc.extension.toUpperCase()}` : ''}</span>
                          {ESTADOS[el.doc.estado] && (
                            <Tag value={ESTADOS[el.doc.estado].etiqueta} severity={ESTADOS[el.doc.estado].severity} style={{ fontSize: '0.65rem' }} />
                          )}
                        </div>
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
            <Button
              icon="pi pi-chevron-right"
              className="p-button-rounded p-button-outlined lt-flecha lt-der"
              aria-label="Desplazar a la derecha"
              onClick={() => desplazar(1)}
            />
          </div>
        )}
        <p className="small text-muted mt-2 mb-0">
          <i className="pi pi-info-circle me-1" />
          Arrastre con el mouse, use la rueda o deslice con el dedo para recorrer la línea de tiempo. Haga clic en un documento para verlo.
        </p>
      </Dialog>

      <VisorDocumentoModal
        documento={documentoAbierto}
        onHide={() => setDocumentoAbierto(null)}
      />
    </>
  );
};

export default LineaTiempoDocumentosModal;
