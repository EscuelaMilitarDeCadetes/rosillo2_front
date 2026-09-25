// src/domains/formal/components/proyectos/EditProjectDatesModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { editarFechaCierre } from '../../../../features/proyectos/proyectosSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const EditProjectDatesModal = ({ visible, onHide, proyecto }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.proyectos);

  const [fechaFin, setFechaFin] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (visible && proyecto?.fecha_fin) {
      setFechaFin(new Date(proyecto.fecha_fin));
    } else if (!visible) {
      setFechaFin(null);
      setValidationError('');
    }
  }, [visible, proyecto]);

  const validateForm = () => {
    if (!fechaFin) {
      setValidationError('La fecha de finalización es obligatoria.');
      return false;
    }
    if (proyecto?.fecha_inicio && fechaFin < new Date(proyecto.fecha_inicio)) {
      setValidationError('La fecha de finalización no puede ser anterior a la fecha de inicio.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleShowConfirmation = () => {
    if (validateForm()) {
      setIsConfirmVisible(true);
    }
  };

  const handleConfirmUpdate = () => {
    const formattedFechaFin = fechaFin ? fechaFin.toISOString().split('T')[0] : null;
    dispatch(editarFechaCierre({ proyectoId: proyecto.id, fechaFin: formattedFechaFin })).then((result) => {
      if (editarFechaCierre.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <>
      <Dialog header={`Modificar Cierre de Proyecto: ${proyecto?.titulo}`} visible={visible} style={{ width: '40vw' }} footer={renderFooter} onHide={onHide}>
        <div className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="fechaFin">Fecha de Finalización</label>
            <Calendar id="fechaFin" value={fechaFin} onChange={(e) => setFechaFin(e.value)} dateFormat="yy-mm-dd" showIcon />
          </div>
          {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </Dialog>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmUpdate}
        header="Confirmar Modificación de Fecha"
        loading={loading}
      >
        <h6>Resumen de la modificación:</h6>
        <ul>
          <li><strong>Proyecto:</strong> {proyecto?.titulo}</li>
          <li><strong>Nueva Fecha de Cierre:</strong> {fechaFin ? fechaFin.toLocaleDateString() : 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default EditProjectDatesModal;