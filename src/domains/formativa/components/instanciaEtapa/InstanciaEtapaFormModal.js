// src/domains/formativa/components/instanciaEtapa/InstanciaEtapaFormModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { crearInstanciaEtapa } from '../../../../features/instanciaEtapa/instanciaEtapaSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';
import { fetchEtapasPorFlujo } from '../../../../features/etapaFlujo/etapaFlujoSlice';

const ESTADO_INICIAL = { proceso: null, etapa: null };


const InstanciaEtapaFormModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { saving, error, items: instanciasExistentes } = useSelector((state) => state.instanciaEtapa);
  const { items: procesos, loading: cargandoProcesos } = useSelector(
    (state) => state.procesosInvFormativa
  );
  const { items: etapas, loading: cargandoEtapas } = useSelector((state) => state.etapaFlujo);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [flujoVersionActual, setFlujoVersionActual] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      dispatch(fetchProcesosActivos());
      setFormData(ESTADO_INICIAL);
      setFlujoVersionActual(null);
      setValidationError('');
    }
  }, [visible, dispatch]);

  const handleProcesoChange = (procesoId) => {
    const proceso = procesos.find((p) => p.id === procesoId);
    setFormData({ proceso: procesoId, etapa: null });
    setFlujoVersionActual(proceso?.flujo_version ?? null);
    if (proceso?.flujo_version) {
      dispatch(fetchEtapasPorFlujo(proceso.flujo_version));
    }
  };

  const etapasYaInstanciadas = useMemo(
    () =>
      new Set(
        instanciasExistentes
          .filter((i) => i.proceso === formData.proceso)
          .map((i) => i.etapa)
      ),
    [instanciasExistentes, formData.proceso]
  );

  const etapasDisponibles = useMemo(
    () => etapas.filter((e) => !etapasYaInstanciadas.has(e.id)),
    [etapas, etapasYaInstanciadas]
  );

  const validar = () => {
    if (!formData.proceso) {
      setValidationError('El proceso formativo es obligatorio.');
      return false;
    }
    if (!formData.etapa) {
      setValidationError('La etapa a instanciar es obligatoria.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    dispatch(crearInstanciaEtapa({ proceso: formData.proceso, etapa: formData.etapa })).then(
      (result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          onHide();
        }
      }
    );
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Crear Instancia" icon="pi pi-check" onClick={handleSubmit} loading={saving} autoFocus />
    </div>
  );

  return (
    <Dialog
      header="Nueva Instancia de Etapa"
      visible={visible}
      style={{ width: '35vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="proceso">Proceso Formativo *</label>
          <Dropdown
            inputId="proceso"
            value={formData.proceso}
            options={procesos}
            optionLabel="titulo"
            optionValue="id"
            filter
            loading={cargandoProcesos}
            onChange={(e) => handleProcesoChange(e.value)}
            placeholder="Seleccione el proceso formativo"
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="etapa">Etapa *</label>
          <Dropdown
            inputId="etapa"
            value={formData.etapa}
            options={etapasDisponibles}
            optionLabel="nombre"
            optionValue="id"
            filter
            loading={cargandoEtapas}
            disabled={!flujoVersionActual}
            onChange={(e) => setFormData((prev) => ({ ...prev, etapa: e.value }))}
            placeholder={
              flujoVersionActual ? 'Seleccione la etapa' : 'Seleccione primero el proceso formativo'
            }
            emptyMessage="Todas las etapas de este flujo ya tienen una instancia para este proceso."
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default InstanciaEtapaFormModal;