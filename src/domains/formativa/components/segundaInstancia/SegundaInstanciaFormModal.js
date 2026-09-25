// src/domains/formativa/components/segundaInstancia/SegundaInstanciaFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { crearSegundaInstancia } from '../../../../features/segundaInstancia/segundaInstanciaSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';
import { fetchInstanciasPorProceso } from '../../../../features/instanciaEtapa/instanciaEtapaSlice';
import { fetchEvaluacionesPorInstanciaEtapa } from '../../../../features/evaluacionProceso/evaluacionProcesoSlice';
import { fetchEtapasPorFlujo } from '../../../../features/etapaFlujo/etapaFlujoSlice';

const TIPOS_SEGUNDA_INSTANCIA = [
  { label: 'Tutor', value: 'TUTOR' },
  { label: 'Jurado', value: 'JURADO' },
  { label: 'Sustentación', value: 'SUSTENTACION' },
  { label: 'Antiplagio', value: 'ANTIPLAGIO' },
];

const ESTADO_INICIAL = {
  proceso: null,
  instancia_etapa: null,
  evaluacion: null,
  etapa_retorno: null,
  tipo: null,
  motivo: '',
  nota_maxima: 3.5,
};

const etiquetaInstancia = (i) => `${i.etapa_nombre} — ${i.estado}`;
const etiquetaEvaluacion = (e) => `${e.evaluador_persona_nombre || `Evaluador #${e.evaluador}`} — nota ${e.nota} (${e.resultado})`;


const SegundaInstanciaFormModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.segundaInstancia);
  const { items: procesos, loading: cargandoProcesos } = useSelector(
    (state) => state.procesosInvFormativa
  );
  const { items: instancias, loading: cargandoInstancias } = useSelector(
    (state) => state.instanciaEtapa
  );
  const { items: evaluaciones, loading: cargandoEvaluaciones } = useSelector(
    (state) => state.evaluacionProceso
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
    setFormData({
      ...ESTADO_INICIAL,
      proceso: procesoId,
      tipo: formData.tipo,
      motivo: formData.motivo,
      nota_maxima: formData.nota_maxima,
    });
    setFlujoVersionActual(proceso?.flujo_version ?? null);
    if (procesoId) dispatch(fetchInstanciasPorProceso(procesoId));
    if (proceso?.flujo_version) dispatch(fetchEtapasPorFlujo(proceso.flujo_version));
  };

  const handleInstanciaChange = (instanciaId) => {
    setFormData((prev) => ({ ...prev, instancia_etapa: instanciaId, evaluacion: null }));
    if (instanciaId) dispatch(fetchEvaluacionesPorInstanciaEtapa(instanciaId));
  };

  const handleChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const validar = () => {
    if (!formData.proceso) {
      setValidationError('El proceso formativo es obligatorio.');
      return false;
    }
    if (!formData.instancia_etapa) {
      setValidationError('La instancia de etapa es obligatoria.');
      return false;
    }
    if (!formData.evaluacion) {
      setValidationError('La evaluación que originó la segunda instancia es obligatoria.');
      return false;
    }
    if (!formData.etapa_retorno) {
      setValidationError('La etapa de retorno es obligatoria.');
      return false;
    }
    if (!formData.tipo) {
      setValidationError('El tipo de segunda instancia es obligatorio.');
      return false;
    }
    if (!formData.motivo.trim()) {
      setValidationError('El motivo es obligatorio.');
      return false;
    }
    if (!formData.nota_maxima || formData.nota_maxima <= 0 || formData.nota_maxima > 5) {
      setValidationError('La nota máxima debe estar entre 0 y 5.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    dispatch(
      crearSegundaInstancia({
        proceso: formData.proceso,
        instancia_etapa: formData.instancia_etapa,
        evaluacion: formData.evaluacion,
        etapa_retorno: formData.etapa_retorno,
        tipo: formData.tipo,
        motivo: formData.motivo,
        nota_maxima: formData.nota_maxima,
      })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') onHide();
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Registrar" icon="pi pi-check" onClick={handleSubmit} loading={saving} autoFocus />
    </div>
  );

  return (
    <Dialog header="Nueva Segunda Instancia" visible={visible} style={{ width: '45vw' }} footer={footer} onHide={onHide}>
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
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="instancia_etapa">Instancia de Etapa *</label>
            <Dropdown
              inputId="instancia_etapa"
              value={formData.instancia_etapa}
              options={instancias}
              optionLabel={etiquetaInstancia}
              optionValue="id"
              filter
              loading={cargandoInstancias}
              disabled={!formData.proceso}
              onChange={(e) => handleInstanciaChange(e.value)}
              placeholder={formData.proceso ? 'Seleccione la instancia' : 'Seleccione primero el proceso'}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="evaluacion">Evaluación que originó la segunda instancia *</label>
            <Dropdown
              inputId="evaluacion"
              value={formData.evaluacion}
              options={evaluaciones}
              optionLabel={etiquetaEvaluacion}
              optionValue="id"
              filter
              loading={cargandoEvaluaciones}
              disabled={!formData.instancia_etapa}
              onChange={(e) => handleChange('evaluacion', e.value)}
              placeholder={formData.instancia_etapa ? 'Seleccione la evaluación' : 'Seleccione primero la instancia'}
              emptyMessage="Esta instancia no tiene evaluaciones registradas."
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="etapa_retorno">Etapa de Retorno *</label>
          <Dropdown
            inputId="etapa_retorno"
            value={formData.etapa_retorno}
            options={etapas}
            optionLabel="nombre"
            optionValue="id"
            filter
            loading={cargandoEtapas}
            disabled={!flujoVersionActual}
            onChange={(e) => handleChange('etapa_retorno', e.value)}
            placeholder={flujoVersionActual ? 'Seleccione la etapa de retorno' : 'Seleccione primero el proceso'}
          />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="tipo">Tipo *</label>
            <Dropdown inputId="tipo" value={formData.tipo} options={TIPOS_SEGUNDA_INSTANCIA} onChange={(e) => handleChange('tipo', e.value)} placeholder="Seleccione" />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="nota_maxima">Nota Máxima *</label>
            <InputNumber inputId="nota_maxima" value={formData.nota_maxima} onValueChange={(e) => handleChange('nota_maxima', e.value)} min={0} max={5} mode="decimal" minFractionDigits={1} />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="motivo">Motivo *</label>
          <InputTextarea id="motivo" value={formData.motivo} rows={3} onChange={(e) => handleChange('motivo', e.target.value)} />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default SegundaInstanciaFormModal;