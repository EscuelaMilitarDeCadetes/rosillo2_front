// src/domains/formal/components/proyectos/formatos/DetalleControlCambioModal.js
// Textos del "Formato Control de Cambios" (FO-JEMPP-CEDE7-982). Se guardan en
// el registro del cambio para que el borrador salga diligenciado y para que
// los formatos posteriores (Acta de Cierre, Informe Final) usen la nueva
// fecha de finalización.
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { actualizarDetalleControlCambio } from '../../../../../features/controlCambios/controlCambiosSlice';

const aFecha = (texto) => (texto ? new Date(`${texto}T00:00:00`) : null);
const aTexto = (fecha) =>
  fecha
    ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
    : null;

const DetalleControlCambioModal = ({ visible, onHide, proyectoId, control, readOnly = false }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (visible && control) {
      setForm({
        descripcion: control.descripcion || '',
        tiempo_otorgado_meses: control.tiempo_otorgado_meses ?? null,
        nueva_fecha_fin: aFecha(control.nueva_fecha_fin),
        propuesta_original: control.propuesta_original || '',
        nueva_propuesta: control.nueva_propuesta || '',
        detalle_personal: control.detalle_personal || '',
        detalle_costos: control.detalle_costos || '',
      });
    }
  }, [visible, control]);

  const cambiar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const guardar = () => {
    setGuardando(true);
    dispatch(
      actualizarDetalleControlCambio({
        controlCambioId: control.id,
        proyectoId,
        detalle: { ...form, nueva_fecha_fin: aTexto(form.nueva_fecha_fin) },
      })
    ).then((result) => {
      setGuardando(false);
      if (actualizarDetalleControlCambio.fulfilled.match(result)) onHide();
    });
  };

  const area = (campo, etiqueta, ayuda, filas = 3) => (
    <div className="field mb-3">
      <label htmlFor={campo}>{etiqueta}</label>
      <InputTextarea id={campo} value={form[campo] || ''} rows={filas} autoResize disabled={readOnly}
        onChange={(e) => cambiar(campo, e.target.value)} />
      {ayuda && <small className="p-text-secondary">{ayuda}</small>}
    </div>
  );

  const footer = (
    <div>
      <Button label="Cerrar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
      {!readOnly && <Button label="Guardar" icon="pi pi-check" loading={guardando} onClick={guardar} />}
    </div>
  );

  return (
    <Dialog header={`Detalle del formato — ${control?.tipo_cambio || ''}`} visible={visible}
      style={{ width: '55vw' }} breakpoints={{ '960px': '90vw' }} footer={footer} onHide={onHide}>
      <div className="p-fluid">
        {area('descripcion', 'Descripción del cambio', 'Justificación detallada y acción tomada frente al riesgo.', 4)}
        {control?.cambio_tiempo && (
          <div className="formgrid grid">
            <div className="field col-12 md:col-6">
              <label htmlFor="tiempo_otorgado_meses">Tiempo otorgado (meses)</label>
              <InputNumber inputId="tiempo_otorgado_meses" value={form.tiempo_otorgado_meses} min={0} max={240}
                disabled={readOnly} onValueChange={(e) => cambiar('tiempo_otorgado_meses', e.value)} />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="nueva_fecha_fin">Nueva fecha de finalización</label>
              <Calendar inputId="nueva_fecha_fin" value={form.nueva_fecha_fin} dateFormat="yy-mm-dd" showIcon
                disabled={readOnly} onChange={(e) => cambiar('nueva_fecha_fin', e.value)} />
            </div>
          </div>
        )}
        {control?.cambio_producto && (
          <>
            {area('propuesta_original', 'Propuesta original',
              'Si lo deja vacío, el borrador toma automáticamente título, objetivos y productos registrados.', 4)}
            {area('nueva_propuesta', 'Nueva propuesta', null, 4)}
          </>
        )}
        {control?.cambio_investigador && area('detalle_personal', 'Cambio en personal / institución')}
        {control?.cambio_costo && area('detalle_costos', 'Cambio en costos')}
      </div>
    </Dialog>
  );
};

export default DetalleControlCambioModal;
