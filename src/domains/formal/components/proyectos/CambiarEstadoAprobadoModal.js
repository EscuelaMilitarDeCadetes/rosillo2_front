// src/domains/formal/components/proyectos/CambiarEstadoAprobadoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { cambiarEstadoAprobado } from '../../../../features/proyectos/proyectosSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const OPCIONES_ESTADO = [
  { label: 'Sin Calificar', value: 'SIN_CALIFICAR' },
  { label: 'Aprobado', value: 'APROBADO' },
  { label: 'No Aprobado', value: 'NO_APROBADO' },
];

const CambiarEstadoAprobadoModal = ({ visible, onHide, proyecto }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.proyectos);
  const [nuevoEstado, setNuevoEstado] = useState(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (visible) setNuevoEstado(proyecto?.estado_aprobado || null);
  }, [visible, proyecto]);

  const handleConfirmar = () => {
    dispatch(cambiarEstadoAprobado({ proyectoId: proyecto.id, estadoAprobado: nuevoEstado })).then((result) => {
      if (cambiarEstadoAprobado.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={() => setIsConfirmVisible(true)}
        disabled={!nuevoEstado || nuevoEstado === proyecto?.estado_aprobado}
      />
    </div>
  );

  return (
    <>
      <Dialog header="Cambiar Estado de Aprobación" visible={visible} style={{ width: '30vw' }} footer={footer} onHide={onHide}>
        <div className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="estadoAprobado">Nuevo Estado</label>
            <Dropdown inputId="estadoAprobado" value={nuevoEstado} options={OPCIONES_ESTADO} onChange={(e) => setNuevoEstado(e.value)} placeholder="Seleccione un estado" />
          </div>
          <Message
            severity="warn"
            className="w-100"
            text="Este cambio es un override manual sobre el estado de aprobación del proyecto, independiente del proceso de calificación por convocatoria."
          />
          {error && <Message severity="error" className="mt-3 w-100" text={typeof error === 'string' ? error : 'Error al cambiar el estado.'} />}
        </div>
      </Dialog>
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmar}
        header="Confirmar Cambio de Estado"
        loading={loading}
      >
        <p>
          ¿Confirma cambiar el estado de aprobación del proyecto <strong>{proyecto?.titulo}</strong> a{' '}
          <strong>{nuevoEstado}</strong>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default CambiarEstadoAprobadoModal;