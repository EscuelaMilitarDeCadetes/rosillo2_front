// src/domains/common/components/notificacion/EnviarRecordatoriosPanel.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { enviarRecordatoriosTareas, limpiarResultadoRecordatorios } from '../../../../features/notificaciones/notificacionesSlice';

// Disparo manual del envío masivo de recordatorios de tareas
// (notificacion/enviar-recordatorios/). El backend ya corre esto
// automáticamente cada día vía Celery beat (enviar_recordatorios_tareas_task);
// este panel es para forzar una corrida puntual (ej: tras cambiar fechas
// límite en bloque) sin esperar al próximo ciclo programado.
// Solo visible/funcional para usuarios is_staff (permiso IsAdminUser).
const EnviarRecordatoriosPanel = () => {
  const dispatch = useDispatch();
  const { enviandoRecordatorios, recordatoriosError, ultimoResultadoRecordatorios } = useSelector(
    (state) => state.notificaciones
  );
  const [diasAnticipacion, setDiasAnticipacion] = useState(3);

  const handleEnviar = () => {
    dispatch(limpiarResultadoRecordatorios());
    dispatch(enviarRecordatoriosTareas(diasAnticipacion));
  };

  return (
    <div>
      <p className="text-muted small">
        Genera notificaciones para tareas vencidas y para tareas próximas a vencer dentro del
        número de días indicado. Esta misma lógica corre automáticamente todos los días; use este
        panel solo para forzar una corrida inmediata.
      </p>
      <div className="d-flex align-items-end gap-3 mb-3">
        <div className="field mb-0">
          <label htmlFor="diasAnticipacion" className="d-block mb-1">
            Días de anticipación
          </label>
          <InputNumber
            inputId="diasAnticipacion"
            value={diasAnticipacion}
            onValueChange={(e) => setDiasAnticipacion(e.value)}
            min={1}
            max={30}
            showButtons
          />
        </div>
        <Button
          label="Enviar Recordatorios Ahora"
          icon="pi pi-send"
          loading={enviandoRecordatorios}
          onClick={handleEnviar}
        />
      </div>
      {recordatoriosError && <Message severity="error" className="w-full" text={recordatoriosError} />}
      {ultimoResultadoRecordatorios && (
        <Message
          severity="success"
          className="w-full"
          text={`Se generaron ${ultimoResultadoRecordatorios.notificaciones_creadas} notificaciones de recordatorio.`}
        />
      )}
    </div>
  );
};

export default EnviarRecordatoriosPanel;