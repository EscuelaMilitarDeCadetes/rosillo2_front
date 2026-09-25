// src/domains/formal/components/proyectos/AddControlCambioModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { addControlCambio } from '../../../../features/controlCambios/controlCambiosSlice';

const AddControlCambioModal = ({ visible, onHide, proyectoId }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.controlCambios);
  const [tipoCambio, setTipoCambio] = useState('');
  const [fechaCambio, setFechaCambio] = useState(null);
  const [banderas, setBanderas] = useState({
    cambio_tiempo: false,
    cambio_investigador: false,
    cambio_costo: false,
    cambio_producto: false,
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!visible) {
      setTipoCambio('');
      setFechaCambio(null);
      setBanderas({
        cambio_tiempo: false,
        cambio_investigador: false,
        cambio_costo: false,
        cambio_producto: false,
      });
      setValidationError('');
    }
  }, [visible]);

  const algunaBanderaMarcada = Object.values(banderas).some(Boolean);

  const handleSubmit = () => {
    if (!tipoCambio.trim()) {
      setValidationError('Debe describir el tipo de cambio.');
      return;
    }
    if (!algunaBanderaMarcada) {
      setValidationError('Debe marcar al menos un tipo de afectación (tiempo, investigador, costo o producto).');
      return;
    }
    setValidationError('');
    dispatch(
      addControlCambio({
        proyectoId,
        data: {
          tipo_cambio: tipoCambio.trim(),
          fecha_cambio: fechaCambio ? fechaCambio.toISOString().split('T')[0] : null,
          ...banderas,
        },
      })
    ).then((result) => {
      if (addControlCambio.fulfilled.match(result)) {
        onHide();
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" onClick={handleSubmit} loading={loading} autoFocus />
    </div>
  );

  return (
    <Dialog header="Registrar Cambio del Proyecto" visible={visible} style={{ width: '40vw' }} footer={renderFooter} onHide={onHide}>
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="tipoCambio">Descripción del Cambio</label>
          <InputText id="tipoCambio" value={tipoCambio} onChange={(e) => setTipoCambio(e.target.value)} maxLength={255} />
        </div>
        <div className="field mb-3">
          <label htmlFor="fechaCambio">Fecha de aceptación del Cambio</label>
          <Calendar id="fechaCambio" value={fechaCambio} onChange={(e) => setFechaCambio(e.value)} dateFormat="yy-mm-dd" showIcon />
        </div>
        <div className="field mb-3">
          <label>¿A qué afecta este cambio? (mínimo uno)</label>
          <div className="d-flex flex-wrap gap-3 mt-2">
            <div className="d-flex align-items-center gap-2">
              <Checkbox inputId="cambioTiempo" checked={banderas.cambio_tiempo} onChange={(e) => setBanderas((b) => ({ ...b, cambio_tiempo: e.checked }))} />
              <label htmlFor="cambioTiempo">Tiempo</label>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Checkbox inputId="cambioInvestigador" checked={banderas.cambio_investigador} onChange={(e) => setBanderas((b) => ({ ...b, cambio_investigador: e.checked }))} />
              <label htmlFor="cambioInvestigador">Investigador</label>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Checkbox inputId="cambioCosto" checked={banderas.cambio_costo} onChange={(e) => setBanderas((b) => ({ ...b, cambio_costo: e.checked }))} />
              <label htmlFor="cambioCosto">Costo</label>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Checkbox inputId="cambioProducto" checked={banderas.cambio_producto} onChange={(e) => setBanderas((b) => ({ ...b, cambio_producto: e.checked }))} />
              <label htmlFor="cambioProducto">Producto</label>
            </div>
          </div>
        </div>
        {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </Dialog>
  );
};

export default AddControlCambioModal;