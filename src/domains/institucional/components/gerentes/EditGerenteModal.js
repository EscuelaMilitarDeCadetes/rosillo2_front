// src/domains/institucional/components/gerentes/EditGerenteModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { actualizarGerente } from '../../../../features/gerentes/gerentesSlice';


const EditGerenteModal = ({ visible, onHide, gerente }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.gerentes);
  const [fechaIngreso, setFechaIngreso] = useState(null);
  const [fechaSalida, setFechaSalida] = useState(null);

  useEffect(() => {
    if (visible && gerente) {
      setFechaIngreso(gerente.fecha_ingreso ? new Date(gerente.fecha_ingreso) : null);
      setFechaSalida(gerente.fecha_salida ? new Date(gerente.fecha_salida) : null);
    }
  }, [visible, gerente]);

  const formatDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSave = () => {
    dispatch(
      actualizarGerente({
        id: gerente.id,
        fecha_ingreso: formatDate(fechaIngreso),
        fecha_salida: formatDate(fechaSalida),
      })
    ).then((result) => {
      if (actualizarGerente.fulfilled.match(result)) onHide();
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" onClick={handleSave} loading={saving} />
    </div>
  );

  return (
    <Dialog header="Editar Fechas de Gerencia" visible={visible} style={{ width: '35vw' }} footer={footer} onHide={onHide}>
      {gerente && (
        <>
          <p>
            <strong>Persona:</strong> {gerente.persona_nombre}
          </p>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6">
              <label htmlFor="fechaIngresoEdit">Fecha de Ingreso</label>
              <Calendar id="fechaIngresoEdit" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.value)} dateFormat="yy-mm-dd" showIcon />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="fechaSalidaEdit">Fecha de Salida</label>
              <Calendar
                id="fechaSalidaEdit"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.value)}
                dateFormat="yy-mm-dd"
                showIcon
                showButtonBar
              />
            </div>
          </div>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </>
      )}
    </Dialog>
  );
};

export default EditGerenteModal;