// src/domains/formativa/components/evaluacionProceso/EvaluacionProcesoFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { crearEvaluacionProceso } from '../../../../features/evaluacionProceso/evaluacionProcesoSlice';
import UsuarioAutoComplete from '../../../usuarios/components/usuarioAdmin/UsuarioAutoComplete';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';
import { fetchInstanciasPorProceso } from '../../../../features/instanciaEtapa/instanciaEtapaSlice';
import { fetchParticipantesPorProceso } from '../../../../features/participanteProceso/participanteProcesoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const ESTADO_INICIAL = {
  proceso_formativo: null,
  evaluador: null,
  instancia_etapa: null,
  concepto: '',
  aprobado: false,
  nota: null,
  tipo_evaluador: '',
  tipo_evaluacion: '',
  peso: null,
  resultado: '',
  es_tercer_evaluador: false,
  observaciones: '',
  rubrica_evaluacion: '',
  criterio_rubrica: '',
  resultado_criterio: '',
  usuario_revisor: null,
};

const etiquetaInstancia = (i) => `${i.etapa_nombre} — ${i.estado}`;
const etiquetaParticipante = (p) => `${p.persona_nombre_completo} (${p.rol_en_modalidad})`;

/**
 * EvaluacionProceso es append-only.
 *
 * evaluador e instancia_etapa se agrega con un selector de Proceso Formativo.
 * proceso_formativo es puramente un filtro de cliente: no viaja en el
 * payload.
 */
const EvaluacionProcesoFormModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.evaluacionProceso);
  const [usuarioRevisorSeleccionado, setUsuarioRevisorSeleccionado] = useState(null);
  const { items: procesos, loading: cargandoProcesos } = useSelector(
    (state) => state.procesosInvFormativa
  );
  const { items: instancias, loading: cargandoInstancias } = useSelector(
    (state) => state.instanciaEtapa
  );
  const { items: participantes, loading: cargandoParticipantes } = useSelector(
    (state) => state.participanteProceso
  );
  const { roles } = useSelector((state) => state.auth);
  const esFacultad = (roles || []).includes('FACULTAD');
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      dispatch(fetchProcesosActivos());
      setFormData(ESTADO_INICIAL);
      setUsuarioRevisorSeleccionado(null);
      setValidationError('');
    }
  }, [visible, dispatch]);  

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUsuarioRevisorChange = (usuario) => {
    setUsuarioRevisorSeleccionado(usuario);
    handleChange('usuario_revisor', usuario ? usuario.id : null);
  };

  const handleProcesoChange = (procesoId) => {
    setFormData((prev) => ({
      ...prev,
      proceso_formativo: procesoId,
      // Al cambiar de proceso, las opciones de instancia_etapa y evaluador
      // cambian por completo: se limpian las selecciones anteriores.
      instancia_etapa: null,
      evaluador: null,
    }));
    if (procesoId) {
      dispatch(fetchInstanciasPorProceso(procesoId));
      dispatch(fetchParticipantesPorProceso(procesoId));
    }
  };

  const validar = () => {
    if (!formData.proceso_formativo) {
      setValidationError('Seleccione primero el proceso formativo.');
      return false;
    }
    if (!formData.evaluador) {
      setValidationError('El evaluador es obligatorio.');
      return false;
    }
    if (!formData.instancia_etapa) {
      setValidationError('La instancia de etapa es obligatoria.');
      return false;
    }
    if (!formData.concepto.trim()) {
      setValidationError('El concepto de la evaluación es obligatorio.');
      return false;
    }
    if (formData.nota == null || formData.nota < 0 || formData.nota > 5) {
      setValidationError('La nota debe estar entre 0 y 5.');
      return false;
    }
    if (formData.aprobado && formData.nota < 3.5) {
      setValidationError('No se puede marcar como aprobado con una nota inferior a 3.5.');
      return false;
    }
    if (!formData.aprobado && formData.nota >= 3.5) {
      setValidationError('La nota registrada corresponde a una evaluación aprobada; revise el indicador.');
      return false;
    }
    if (formData.peso == null || formData.peso <= 0) {
      setValidationError('El peso debe ser mayor a 0.');
      return false;
    }
    if (!formData.tipo_evaluador.trim() || !formData.tipo_evaluacion.trim()) {
      setValidationError('El tipo de evaluador y el tipo de evaluación son obligatorios.');
      return false;
    }
    if (!formData.resultado.trim()) {
      setValidationError('El resultado de la evaluación es obligatorio.');
      return false;
    }
    if (esFacultad && !formData.usuario_revisor) {
      setValidationError('Como Facultad, debe seleccionar un revisor (Decano) para esta evaluación.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleShowConfirmation = () => {
    if (!validar()) return;
    setIsConfirmVisible(true);
  };

  const handleConfirm = () => {
    // proceso_formativo se descarta explícitamente: no es un campo del
    // payload de EvaluacionProceso, solo se usó para filtrar los dropdowns.
    const { proceso_formativo, ...payload } = formData;
    dispatch(
      crearEvaluacionProceso({
        ...payload,
        observaciones: formData.observaciones || null,
        usuario_revisor: formData.usuario_revisor || undefined,
      })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Registrar Evaluación" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <Dialog
      header="Nueva Evaluación de Proceso"
      visible={visible}
      style={{ width: '45vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="proceso_formativo">Proceso Formativo *</label>
          <Dropdown
            inputId="proceso_formativo"
            value={formData.proceso_formativo}
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
            <label htmlFor="evaluador">Evaluador (Participante) *</label>
            <Dropdown
              inputId="evaluador"
              value={formData.evaluador}
              options={participantes}
              optionLabel={etiquetaParticipante}
              optionValue="id"
              filter
              loading={cargandoParticipantes}
              disabled={!formData.proceso_formativo}
              onChange={(e) => handleChange('evaluador', e.value)}
              placeholder={
                formData.proceso_formativo
                  ? 'Seleccione el evaluador'
                  : 'Seleccione primero el proceso formativo'
              }
              emptyMessage="Este proceso no tiene participantes registrados."
            />
          </div>
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
              disabled={!formData.proceso_formativo}
              onChange={(e) => handleChange('instancia_etapa', e.value)}
              placeholder={
                formData.proceso_formativo
                  ? 'Seleccione la instancia de etapa'
                  : 'Seleccione primero el proceso formativo'
              }
              emptyMessage="Este proceso no tiene instancias de etapa registradas."
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="concepto">Concepto *</label>
          <InputText
            id="concepto"
            value={formData.concepto}
            maxLength={100}
            onChange={(e) => handleChange('concepto', e.target.value)}
          />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="nota">Nota (0 - 5) *</label>
            <InputNumber
              inputId="nota"
              value={formData.nota}
              onValueChange={(e) => handleChange('nota', e.value)}
              mode="decimal"
              minFractionDigits={1}
              min={0}
              max={5}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="peso">Peso *</label>
            <InputNumber
              inputId="peso"
              value={formData.peso}
              onValueChange={(e) => handleChange('peso', e.value)}
              mode="decimal"
              minFractionDigits={1}
              min={0.1}
            />
          </div>
          <div className="field mb-3 col-fixed flex align-items-end" style={{ width: '10rem' }}>
            <div className="flex align-items-center gap-2">
              <Checkbox
                inputId="aprobado"
                checked={formData.aprobado}
                onChange={(e) => handleChange('aprobado', e.checked)}
              />
              <label htmlFor="aprobado">Aprobado</label>
            </div>
          </div>
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="tipo_evaluador">Tipo de Evaluador *</label>
            <InputText
              id="tipo_evaluador"
              value={formData.tipo_evaluador}
              maxLength={100}
              placeholder="Ej: TUTOR, JURADO"
              onChange={(e) => handleChange('tipo_evaluador', e.target.value)}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="tipo_evaluacion">Tipo de Evaluación *</label>
            <InputText
              id="tipo_evaluacion"
              value={formData.tipo_evaluacion}
              maxLength={100}
              onChange={(e) => handleChange('tipo_evaluacion', e.target.value)}
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="resultado">Resultado *</label>
          <InputText
            id="resultado"
            value={formData.resultado}
            maxLength={100}
            onChange={(e) => handleChange('resultado', e.target.value)}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="observaciones">Observaciones</label>
          <InputTextarea
            id="observaciones"
            value={formData.observaciones}
            rows={2}
            onChange={(e) => handleChange('observaciones', e.target.value)}
          />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col-fixed flex align-items-end" style={{ width: '12rem' }}>
            <div className="flex align-items-center gap-2">
              <Checkbox
                inputId="es_tercer_evaluador"
                checked={formData.es_tercer_evaluador}
                onChange={(e) => handleChange('es_tercer_evaluador', e.checked)}
              />
              <label htmlFor="es_tercer_evaluador">Es tercer evaluador</label>
            </div>
          </div>
          <div className="field mb-3 col">
            <label htmlFor="usuario_revisor">
              Revisor (Decano) {esFacultad ? '*' : ''}
            </label>
            <UsuarioAutoComplete
              value={usuarioRevisorSeleccionado}
              onChange={handleUsuarioRevisorChange}
              placeholder={esFacultad ? 'Buscar revisor...' : 'Buscar revisor (opcional)...'}
            />
            {esFacultad && (
              <small className="text-muted">
                Registras esta evaluación como Facultad: el backend exige un revisor.
              </small>
            )}
          </div>
        </div>
        <div className="field mb-3">
          <label>Datos de rúbrica (opcional)</label>
          <div className="formgrid grid">
            <div className="field mb-0 col">
              <InputText
                value={formData.rubrica_evaluacion}
                placeholder="Rúbrica"
                onChange={(e) => handleChange('rubrica_evaluacion', e.target.value)}
              />
            </div>
            <div className="field mb-0 col">
              <InputText
                value={formData.criterio_rubrica}
                placeholder="Criterio"
                onChange={(e) => handleChange('criterio_rubrica', e.target.value)}
              />
            </div>
            <div className="field mb-0 col">
              <InputText
                value={formData.resultado_criterio}
                placeholder="Resultado del criterio"
                onChange={(e) => handleChange('resultado_criterio', e.target.value)}
              />
            </div>
          </div>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirm}
        header="¿Deseas confirmar la acción?"
        loading={saving}
      >
        <h6>Resumen:</h6>
        <ul>
          <li><strong>Concepto:</strong> {formData.concepto || 'N/A'}</li>
          <li><strong>Nota:</strong> {formData.nota ?? 'N/A'}</li>
          <li><strong>Resultado:</strong> {formData.resultado || 'N/A'} ({formData.aprobado ? 'Aprobado' : 'No aprobado'})</li>
        </ul>
        <Message severity="warn" text="Esta evaluación no podrá editarse ni eliminarse una vez registrada." />
      </ConfirmationModal>
    </Dialog>
  );
};

export default EvaluacionProcesoFormModal;