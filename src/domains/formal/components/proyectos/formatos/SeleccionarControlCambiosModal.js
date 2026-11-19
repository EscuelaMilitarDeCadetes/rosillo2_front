// src/domains/formal/components/proyectos/formatos/SeleccionarControlCambiosModal.js
// El formato de Control de Cambios se genera para UN cambio concreto (sus
// banderas, descripción, nueva fecha...). También se permite generarlo "en
// blanco" para una solicitud que todavía no se ha registrado.
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { fetchControlCambiosPorProyecto } from '../../../../../features/controlCambios/controlCambiosSlice';
import GenerarBorradorButton from './GenerarBorradorButton';

const SeleccionarControlCambiosModal = ({ visible, onHide, proyectoId, tipoDocumentoId }) => {
  const dispatch = useDispatch();
  const { registros } = useSelector((state) => state.controlCambios);
  const [controlId, setControlId] = useState(null);

  useEffect(() => {
    if (visible && proyectoId) dispatch(fetchControlCambiosPorProyecto(proyectoId));
    if (!visible) setControlId(null);
  }, [visible, proyectoId, dispatch]);

  const opciones = [
    { label: 'Solicitud nueva (sin cambio registrado)', value: null },
    ...(registros || []).map((r) => ({
      label: `${r.fecha_cambio || 'Sin fecha'} — ${r.tipo_cambio}`,
      value: r.id,
    })),
  ];

  return (
    <Dialog header="Generar borrador de Control de Cambios" visible={visible} style={{ width: '35vw' }} onHide={onHide}>
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="controlCambiosSel">¿Para qué cambio?</label>
          <Dropdown
            inputId="controlCambiosSel"
            value={controlId}
            options={opciones}
            onChange={(e) => setControlId(e.value)}
            placeholder="Seleccione"
          />
          <small className="p-text-secondary">
            Los textos del cambio (descripción, nueva fecha, propuesta nueva...) se editan en la pestaña
            "Control de Cambios" con el botón de detalle.
          </small>
        </div>
        <div className="d-flex justify-content-end">
          <GenerarBorradorButton
            proyectoId={proyectoId}
            tipoDocumentoId={tipoDocumentoId}
            controlCambiosId={controlId}
            label="Descargar borrador"
            className="p-button-sm"
            tooltip={null}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default SeleccionarControlCambiosModal;
