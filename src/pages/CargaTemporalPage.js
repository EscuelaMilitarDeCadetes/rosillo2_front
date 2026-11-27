// src/pages/CargaTemporalPage.js
//
// Página pública (sin iniciar sesión) a la que llega un investigador desde
// el enlace temporal que le envió el coordinador, para reportar el AVANCE
// MENSUAL del proyecto: mismos campos que "Agregar avance" (punto de control
// de un objetivo específico, descripción, % de avance, mes y año), pero
// pudiendo reportar varios puntos de control en un solo envío.
//
// Usa un axios propio SIN el token de sesión: si en este navegador hay una
// sesión vencida, no debe interferir.
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/';
const MAX_DESCRIPCION = 255;

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
].map((m) => ({ label: m.charAt(0) + m.slice(1).toLowerCase(), value: m }));

const mensajeError = (error, porDefecto) => {
  const data = error?.response?.data;
  if (!data) return 'No hay conexión con el servidor. Intente de nuevo en unos minutos.';
  if (typeof data.detail === 'string') return data.detail;
  const primero = Object.values(data).flat().find((v) => typeof v === 'string');
  return primero || porDefecto;
};

const CargaTemporalPage = () => {
  const { token } = useParams();
  const urlEnlace = `${API_BASE_URL}investigacion-formal/carga-temporal/${encodeURIComponent(token)}/`;
  const hoy = new Date();
  const [info, setInfo] = useState(null);
  const [errorEnlace, setErrorEnlace] = useState('');
  const [cargandoInfo, setCargandoInfo] = useState(true);
  const [nombre, setNombre] = useState('');
  const [mes, setMes] = useState(MESES[hoy.getMonth()].value);
  const [anio, setAnio] = useState(hoy.getFullYear());
  // { [punto_control_id]: { incluir, avance, descripcion } }
  const [reporte, setReporte] = useState({});
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    let activo = true;
    axios.get(urlEnlace)
      .then(({ data }) => { if (activo) setInfo(data); })
      .catch((error) => { if (activo) setErrorEnlace(mensajeError(error, 'El enlace no es válido.')); })
      .finally(() => { if (activo) setCargandoInfo(false); });
    return () => { activo = false; };
  }, [urlEnlace]);

  const puntosPorId = useMemo(() => {
    const mapa = {};
    (info?.objetivos || []).forEach((o) => o.puntos.forEach((p) => { mapa[p.punto_control_id] = p; }));
    return mapa;
  }, [info]);

  const actualizar = (puntoId, cambios) => {
    setReporte((prev) => {
      const actual = prev[puntoId] || { incluir: false, avance: puntosPorId[puntoId]?.avance_actual ?? 0, descripcion: '' };
      return { ...prev, [puntoId]: { ...actual, ...cambios } };
    });
  };

  const filasIncluidas = Object.entries(reporte).filter(([, f]) => f.incluir);

  const validar = () => {
    if (nombre.trim().length < 3) return 'Escriba su nombre completo.';
    if (!mes || !anio) return 'Seleccione el mes y el año del avance.';
    if (filasIncluidas.length === 0) return 'Marque al menos un punto de control y reporte su avance.';
    for (const [puntoId, fila] of filasIncluidas) {
      const control = puntosPorId[puntoId]?.control;
      if (!fila.descripcion.trim()) return `Describa el avance de "${control}".`;
      if (fila.avance == null || fila.avance < 0 || fila.avance > 100) return `El avance de "${control}" debe estar entre 0 y 100.`;
    }
    return '';
  };

  const handleEnviar = async () => {
    const error = validar();
    setErrorEnvio(error);
    if (error) return;
    setEnviando(true);
    try {
      await axios.post(urlEnlace, {
        nombre_remitente: nombre.trim(),
        mes_avance: mes,
        anio_avance: anio,
        comentario: comentario.trim(),
        avances: filasIncluidas.map(([puntoId, fila]) => ({
          punto_control_id: Number(puntoId),
          descripcion_avance: fila.descripcion.trim(),
          avance: fila.avance,
        })),
      });
      setEnviado(true);
    } catch (err) {
      setErrorEnvio(mensajeError(err, 'No se pudo enviar el avance.'));
    } finally {
      setEnviando(false);
    }
  };

  const renderPunto = (punto) => {
    const fila = reporte[punto.punto_control_id];
    const incluir = !!fila?.incluir;
    const idBase = `ct-punto-${punto.punto_control_id}`;
    return (
      <div key={punto.punto_control_id} className="border rounded p-3 mb-2">
        <div className="d-flex align-items-start gap-2">
          <Checkbox
            inputId={idBase}
            checked={incluir}
            onChange={(e) => actualizar(punto.punto_control_id, { incluir: e.checked })}
          />
          <label htmlFor={idBase} className="flex-grow-1" style={{ cursor: 'pointer' }}>
            <strong>{punto.control}</strong>
            <div className="small text-muted">
              Avance actual: {punto.avance_actual}% ({punto.mes_avance} {punto.anio_avance})
              {punto.descripcion_actual ? ` — ${punto.descripcion_actual}` : ''}
            </div>
          </label>
        </div>
        {incluir && (
          <div className="row g-2 mt-2">
            <div className="col-md-3">
              <label htmlFor={`${idBase}-avance`} className="form-label small">Avance en %</label>
              <InputNumber
                inputId={`${idBase}-avance`}
                className="w-100"
                value={fila.avance}
                onValueChange={(e) => actualizar(punto.punto_control_id, { avance: e.value })}
                min={0}
                max={100}
                suffix="%"
              />
            </div>
            <div className="col-md-9">
              <label htmlFor={`${idBase}-desc`} className="form-label small">
                Descripción del avance ({fila.descripcion.length}/{MAX_DESCRIPCION})
              </label>
              <InputTextarea
                id={`${idBase}-desc`}
                className="w-100"
                rows={2}
                maxLength={MAX_DESCRIPCION}
                value={fila.descripcion}
                onChange={(e) => actualizar(punto.punto_control_id, { descripcion: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  let contenido;
  if (cargandoInfo) {
    contenido = <div className="text-center"><ProgressSpinner /></div>;
  } else if (errorEnlace) {
    contenido = (
      <div className="alert alert-warning mb-0">
        <i className="pi pi-exclamation-triangle me-2" />{errorEnlace}
      </div>
    );
  } else if (enviado) {
    contenido = (
      <div className="alert alert-success mb-0">
        <i className="pi pi-check-circle me-2" />
        Avance recibido. Quedó como borrador y el coordinador fue notificado para revisarlo.
        Recibirá un correo cuando lo apruebe o si necesita correcciones. Ya puede cerrar esta página.
      </div>
    );
  } else {
    contenido = (
      <>
        <p className="mb-1"><strong>Proyecto:</strong> {info.proyecto_titulo}</p>
        <p className="mb-1"><strong>Solicitado por:</strong> {info.coordinador}</p>
        <p className="small text-muted mb-4">
          Enlace para {info.email_destino}. Es de un solo uso y vence el{' '}
          {new Date(info.fecha_expiracion).toLocaleString('es-CO')}.
        </p>

        <div className="row g-2 mb-4">
          <div className="col-md-6">
            <label htmlFor="ct-nombre" className="form-label">Su nombre completo *</label>
            <InputText id="ct-nombre" className="w-100" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label htmlFor="ct-mes" className="form-label">Mes del avance *</label>
            <Dropdown inputId="ct-mes" className="w-100" value={mes} options={MESES} onChange={(e) => setMes(e.value)} />
          </div>
          <div className="col-md-3">
            <label htmlFor="ct-anio" className="form-label">Año *</label>
            <InputNumber
              inputId="ct-anio"
              className="w-100"
              value={anio}
              onValueChange={(e) => setAnio(e.value)}
              useGrouping={false}
              min={2000}
              max={hoy.getFullYear()}
            />
          </div>
        </div>

        <h6 className="mb-2">Marque los puntos de control que avanzaron este mes</h6>
        {(info.objetivos || []).map((objetivo) => (
          <div key={objetivo.objetivo_id} className="mb-4">
            <div className="fw-semibold mb-2">Objetivo específico: {objetivo.objetivo}</div>
            {objetivo.puntos.map(renderPunto)}
          </div>
        ))}

        <div className="mb-3">
          <label htmlFor="ct-comentario" className="form-label">Comentario para el coordinador (opcional)</label>
          <InputTextarea
            id="ct-comentario"
            className="w-100"
            rows={3}
            maxLength={2000}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </div>
        {errorEnvio && <div className="alert alert-danger py-2">{errorEnvio}</div>}
        <Button
          label={`Enviar avance${filasIncluidas.length ? ` (${filasIncluidas.length})` : ''}`}
          icon="pi pi-send"
          className="w-100"
          loading={enviando}
          onClick={handleEnviar}
        />
      </>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 820 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h4 className="mb-1">Reporte de avance mensual</h4>
          <p className="text-muted mb-4">Plataforma Rosillo · Departamento I+D+i</p>
          {contenido}
        </div>
      </div>
      <p className="text-center small text-muted mt-3">
        ¿Problemas con el enlace? Escriba a soporte.rosillo@esmic.edu.co
      </p>
    </div>
  );
};

export default CargaTemporalPage;
