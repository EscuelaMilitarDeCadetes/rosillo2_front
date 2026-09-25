// src/domains/crm/components/indicadorImpacto/ActualizarAvanceModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { actualizarValorReal } from '../../../../features/crm/indicadorImpactoSlice';

/**
 * Atajo de negocio: solo actualiza `valor_real` (el avance) de un
 * indicador, sin abrir el formulario completo ni tocar la meta, el
 * proyecto o el KPI. Refleja `actualizar_valor_real` en
 * apps/crm/services/indicador_impacto_service.py, expuesto como
 * `POST crm/indicador-impacto/{id}/actualizar-valor-real/`.
 */
const ActualizarAvanceModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { actualizandoAvanceId, error } = useSelector((state) => state.indicadorImpacto);
  const [valorReal, setValorReal] = useState(0);

  useEffect(() => {
    if (visible && item) {
      setValorReal(item.valor_real ?? 0);
    }
  }, [visible, item]);

  const handleConfirm = () => {
    if (valorReal === null || valorReal === undefined) return;
    dispatch(actualizarValorReal({ id: item.id, valor_real: valorReal })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label="Guardar Avance"
        icon="pi pi-check"
        onClick={handleConfirm}
        loading={actualizandoAvanceId === item?.id}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={`Actualizar avance: ${item?.kpi_nombre || ''}`}
      visible={visible}
      style={{ width: '30vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <p className="text-muted">
          Meta (valor proyectado): <strong>{item?.valor_proyectado ?? 'N/A'}</strong>
        </p>
        <div className="field mb-3">
          <label htmlFor="valor_real_rapido">Nuevo valor real</label>
          <InputNumber
            inputId="valor_real_rapido"
            value={valorReal}
            onValueChange={(e) => setValorReal(e.value)}
            minFractionDigits={0}
            maxFractionDigits={2}
            autoFocus
          />
        </div>
        {error && <Message severity="error" className="mt-2 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default ActualizarAvanceModal;