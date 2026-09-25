// src/domains/formal/components/proyectos/EditMontoAprobadoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { editarValorAprobado } from '../../../../features/proyectos/montoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const EditMontoAprobadoModal = ({ visible, onHide, monto, proyectoId }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.montos);

  const [aprobado, setAprobado] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (visible && monto) {
      setAprobado(monto.aprobado || 0);
    } else if (!visible) {
      setAprobado(0);
      setValidationError('');
    }
  }, [visible, monto]);

  const validateForm = () => {
    if (aprobado <= 0) {
      setValidationError('El monto aprobado debe ser un valor positivo.');
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
    dispatch(editarValorAprobado({ montoId: monto.id, aprobado, proyectoId })).then((result) => {
      if (editarValorAprobado.fulfilled.match(result)) {
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
      <Dialog header={`Modificar Monto Aprobado: ${monto?.proyecto_details?.titulo || ''}`} visible={visible} style={{ width: '30vw' }} footer={renderFooter} onHide={onHide}>
        <div className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="aprobado">Nuevo Monto Aprobado</label>
            <InputNumber id="aprobado" value={aprobado} onValueChange={(e) => setAprobado(e.value)} mode="currency" currency="COP" locale="es-CO" min={0} />
          </div>
          {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </Dialog>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmUpdate}
        header="Confirmar Modificación de Monto"
        loading={loading}
      >
        <h6>Resumen de la modificación:</h6>
        <ul>
          <li><strong>Proyecto:</strong> {monto?.proyecto_details?.titulo || 'N/A'}</li>
          <li><strong>Monto Anterior:</strong> {monto?.aprobado?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) || 'N/A'}</li>
          <li><strong>Nuevo Monto Aprobado:</strong> {aprobado.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</li>
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default EditMontoAprobadoModal;
