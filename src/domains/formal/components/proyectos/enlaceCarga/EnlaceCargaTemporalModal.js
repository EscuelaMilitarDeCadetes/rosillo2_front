// src/domains/formal/components/proyectos/enlaceCarga/EnlaceCargaTemporalModal.js
//
// Opción secundaria del coordinador (rol FACULTAD): generar un enlace de un
// solo uso para que un investigador del proyecto (sin cuenta) registre el
// AVANCE MENSUAL, y revisar (aprobar / devolver) lo que llegue por ese
// enlace. El avance enviado NO se aplica al proyecto hasta que el
// coordinador lo apruebe.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import axiosInstance from '../../../../../api/axiosInstance';

const URL_ENLACES = 'investigacion-formal/enlaces-carga/';
const DIAS_MAXIMOS = 5;
const OPCIONES_DIAS = Array.from({ length: DIAS_MAXIMOS }, (_, i) => ({
  label: `${i + 1} día${i ? 's' : ''}`,
  value: i + 1,
}));

const ESTADOS = {
  ACTIVO: { etiqueta: 'Activo (sin usar)', severity: 'info' },
  VENCIDO: { etiqueta: 'Vencido', severity: 'secondary' },
  PENDIENTE_REVISION: { etiqueta: 'Borrador por revisar', severity: 'warning' },
  APROBADO: { etiqueta: 'Aprobado', severity: 'success' },
  RECHAZADO: { etiqueta: 'Devuelto', severity: 'danger' },
  REVOCADO: { etiqueta: 'Revocado', severity: 'secondary' },
};

const fecha = (valor) => (valor ? new Date(valor).toLocaleString('es-CO') : '—');
const capitalizar = (texto) => (texto ? texto.charAt(0) + texto.slice(1).toLowerCase() : '');

const EnlaceCargaTemporalModal = ({ visible, onHide, proyectoId, onCambio }) => {
  const [email, setEmail] = useState('');
  const [dias, setDias] = useState(DIAS_MAXIMOS);
  const [generando, setGenerando] = useState(false);
  const [urlGenerada, setUrlGenerada] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [enlaces, setEnlaces] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [accionId, setAccionId] = useState(null);
  const [enlaceDevolver, setEnlaceDevolver] = useState(null);
  const [observacion, setObservacion] = useState('');
  const inputUrlRef = useRef(null);

  const cargarEnlaces = useCallback(async () => {
    if (!proyectoId) return;
    setCargando(true);
    try {
      const { data } = await axiosInstance.get(URL_ENLACES, {
        params: { proyecto: proyectoId },
        suppressErrorRedirect: true,
      });
      setEnlaces(data || []);
    } catch {
      setEnlaces([]);
    } finally {
      setCargando(false);
    }
  }, [proyectoId]);

  useEffect(() => {
    if (visible) {
      cargarEnlaces();
    } else {
      setEmail('');
      setDias(DIAS_MAXIMOS);
      setUrlGenerada('');
      setCopiado(false);
    }
  }, [visible, cargarEnlaces]);

  const refrescar = () => {
    cargarEnlaces();
    if (onCambio) onCambio();
  };

  const handleGenerar = async () => {
    setGenerando(true);
    setUrlGenerada('');
    setCopiado(false);
    try {
      const { data } = await axiosInstance.post(URL_ENLACES, {
        proyecto: proyectoId,
        email_destino: email.trim(),
        dias,
      });
      setUrlGenerada(data.url);
      setEmail('');
      refrescar();
    } catch {
      // axiosInstance ya muestra el error en un toast
    } finally {
      setGenerando(false);
    }
  };

  const handleCopiar = async () => {
    try {
      // navigator.clipboard solo existe en contextos seguros (https/localhost).
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(urlGenerada);
      } else if (inputUrlRef.current) {
        inputUrlRef.current.select();
        document.execCommand('copy');
      }
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  const ejecutar = async (enlace, accion, cuerpo = {}) => {
    setAccionId(`${accion}-${enlace.id}`);
    try {
      await axiosInstance.post(`${URL_ENLACES}${enlace.id}/${accion}/`, cuerpo);
      refrescar();
      return true;
    } catch {
      return false;
    } finally {
      setAccionId(null);
    }
  };

  const handleConfirmarDevolucion = async () => {
    const ok = await ejecutar(enlaceDevolver, 'rechazar', { observacion: observacion.trim() });
    if (ok) {
      setEnlaceDevolver(null);
      setObservacion('');
    }
  };

  const estadoTemplate = (row) => {
    const estado = ESTADOS[row.estado_efectivo] || { etiqueta: row.estado_efectivo, severity: 'secondary' };
    return <Tag value={estado.etiqueta} severity={estado.severity} />;
  };

  const reporteTemplate = (row) => {
    if (!row.fecha_carga) {
      return <span className="text-muted">Sin enviar · vence {fecha(row.fecha_expiracion)}</span>;
    }
    return (
      <div>
        <div>
          <strong>{row.nombre_remitente}</strong> · {capitalizar(row.mes_avance)} {row.anio_avance}
          <span className="text-muted small"> (enviado {fecha(row.fecha_carga)})</span>
        </div>
        <ul className="small mb-1 ps-3">
          {(row.avances || []).map((a) => (
            <li key={a.punto_control_id}>
              <strong>{a.punto_control}</strong>: {a.avance_anterior}% → <strong>{a.avance}%</strong>
              {' — '}{a.descripcion_avance}
            </li>
          ))}
        </ul>
        {row.comentario_remitente && <div className="small fst-italic">“{row.comentario_remitente}”</div>}
        {row.observacion_revision && (
          <div className="small text-danger">Observación: {row.observacion_revision}</div>
        )}
      </div>
    );
  };

  const accionesTemplate = (row) => (
    <div className="d-flex gap-2">
      {row.estado === 'PENDIENTE_REVISION' && (
        <>
          <Button
            icon="pi pi-check"
            className="p-button-rounded p-button-success p-button-sm"
            tooltip="Aprobar: el avance queda registrado en el proyecto"
            loading={accionId === `aprobar-${row.id}`}
            onClick={() => ejecutar(row, 'aprobar')}
          />
          <Button
            icon="pi pi-replay"
            className="p-button-rounded p-button-warning p-button-sm"
            tooltip="Devolver con observaciones"
            onClick={() => { setEnlaceDevolver(row); setObservacion(''); }}
          />
        </>
      )}
      {row.estado_efectivo === 'ACTIVO' && (
        <Button
          icon="pi pi-ban"
          className="p-button-rounded p-button-secondary p-button-sm"
          tooltip="Revocar enlace"
          loading={accionId === `revocar-${row.id}`}
          onClick={() => ejecutar(row, 'revocar')}
        />
      )}
    </div>
  );

  return (
    <>
      <Dialog
        header="Enlace temporal para reportar avance"
        visible={visible}
        onHide={onHide}
        style={{ width: '75vw' }}
        breakpoints={{ '960px': '95vw' }}
      >
        <p className="small text-muted mb-3">
          Genere un enlace de un solo uso para que un investigador del proyecto reporte el avance mensual
          de los puntos de control. Lo que envíe llegará como <strong>borrador a su nombre</strong> y solo
          quedará registrado en el proyecto cuando usted lo apruebe. Generar un enlace nuevo anula el que
          siga activo.
        </p>

        <div className="row g-2 align-items-end mb-3">
          <div className="col-md-6">
            <label htmlFor="enlace-email" className="form-label">Correo del investigador</label>
            <InputText
              id="enlace-email"
              type="email"
              className="w-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@dominio.com"
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="enlace-dias" className="form-label">Vigencia</label>
            <Dropdown
              inputId="enlace-dias"
              className="w-100"
              value={dias}
              options={OPCIONES_DIAS}
              onChange={(e) => setDias(e.value)}
            />
          </div>
          <div className="col-md-3">
            <Button
              label="Generar y enviar"
              icon="pi pi-link"
              className="w-100"
              loading={generando}
              disabled={!email.trim()}
              onClick={handleGenerar}
            />
          </div>
        </div>

        {urlGenerada && (
          <div className="alert alert-success">
            <div className="mb-2">
              Enlace enviado por correo. Si no le llega al investigador, puede copiarlo y compartirlo usted
              (solo se muestra esta vez):
            </div>
            <div className="d-flex gap-2">
              <InputText ref={inputUrlRef} value={urlGenerada} readOnly className="w-100" onFocus={(e) => e.target.select()} />
              <Button
                icon={copiado ? 'pi pi-check' : 'pi pi-copy'}
                label={copiado ? 'Copiado' : 'Copiar'}
                className="p-button-outlined"
                onClick={handleCopiar}
              />
            </div>
          </div>
        )}

        <DataTable
          value={enlaces}
          loading={cargando}
          paginator
          rows={5}
          emptyMessage="Aún no ha generado enlaces para este proyecto."
          responsiveLayout="scroll"
        >
          <Column field="email_destino" header="Correo" />
          <Column header="Estado" body={estadoTemplate} />
          <Column header="Reporte de avance" body={reporteTemplate} style={{ minWidth: '22rem' }} />
          <Column header="Generado" body={(row) => fecha(row.fecha_creacion)} />
          <Column header="Acciones" body={accionesTemplate} />
        </DataTable>
      </Dialog>

      <Dialog
        header="Devolver reporte de avance"
        visible={!!enlaceDevolver}
        onHide={() => setEnlaceDevolver(null)}
        style={{ width: '35vw' }}
        breakpoints={{ '960px': '90vw' }}
        footer={(
          <div>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setEnlaceDevolver(null)} />
            <Button
              label="Devolver"
              icon="pi pi-replay"
              className="p-button-warning"
              disabled={!observacion.trim()}
              loading={accionId === `rechazar-${enlaceDevolver?.id}`}
              onClick={handleConfirmarDevolucion}
            />
          </div>
        )}
      >
        <p className="small">
          Se enviará un correo a <strong>{enlaceDevolver?.email_destino}</strong> con estas observaciones.
          Para que vuelva a reportar deberá generarle un nuevo enlace.
        </p>
        <InputTextarea
          className="w-100"
          rows={4}
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          placeholder="¿Qué se debe corregir?"
        />
      </Dialog>
    </>
  );
};

export default EnlaceCargaTemporalModal;
