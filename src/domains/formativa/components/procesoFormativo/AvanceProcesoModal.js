// src/domains/formativa/components/procesoFormativo/AvanceProcesoModal.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';
import { Message } from 'primereact/message';
import {
  fetchAvanceProceso,
  limpiarAvanceProceso,
} from '../../../../features/procesoFormativo/procesoFormativoSlice';

// Muestra lo que devuelva ProcesoFormativoSelector.obtener_avance(); el
// formato exacto del payload no está fijado en el código revisado más allá
// de ser un resumen del proceso, así que se renderiza de forma genérica.
const AvanceProcesoModal = ({ visible, onHide, proceso }) => {
  const dispatch = useDispatch();
  const { avance, cargandoAvance, error } = useSelector((state) => state.procesoFormativo);

  useEffect(() => {
    if (visible && proceso) {
      dispatch(fetchAvanceProceso(proceso.id));
    }
    return () => {
      dispatch(limpiarAvanceProceso());
    };
  }, [visible, proceso, dispatch]);

  return (
    <Dialog header={`Avance del proceso — ${proceso?.titulo ?? ''}`} visible={visible} style={{ width: '35vw' }} onHide={onHide}>
      {cargandoAvance && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
      {error && <Message severity="error" className="w-full" text={error} />}
      {!cargandoAvance && avance && (
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
          {JSON.stringify(avance, null, 2)}
        </pre>
      )}
    </Dialog>
  );
};

export default AvanceProcesoModal;