// src/domains/formativa/components/validacionAntiplagio/ValidacionAntiplagioFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  crearValidacionAntiplagio,
  actualizarValidacionAntiplagio,
} from '../../../../features/validacionAntiplagio/validacionAntiplagioSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';
import { fetchInstanciasPorProceso } from '../../../../features/instanciaEtapa/instanciaEtapaSlice';
import DocumentoPorObjetoSelector from '../../../common/components/documentoFirma/DocumentoPorObjetoSelector';

const ESTADO_INICIAL = { instancia_etapa: null, documento: null, porcentaje: null, aprobado: true };
const etiquetaInstancia = (i) => `${i.etapa_nombre} — ${i.estado}`;


const ValidacionAntiplagioFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.validacionAntiplagio);
  const { items: procesos, loading: cargandoProcesos } = useSelector((state) => state.procesosInvFormativa);
  const { items: instancias, loading: cargandoInstancias } = useSelector((state) => state.instanciaEtapa);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [procesoFiltro, setProcesoFiltro] = useState(null);
  const [validationError, setValidationError] = useState('');
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      if (!esEdicion) {
        dispatch(fetchProcesosActivos());
      }
      setFormData(
        item
          ? {
              instancia_etapa: item.instancia_etapa ?? null,
              documento: item.documento ?? null,
              porcentaje: item.porcentaje ?? null,
              aprobado: item.aprobado ?? true,
            }
          : ESTADO_INICIAL
      );
      setProcesoFiltro(null);
      setValidationError('');
    }
  }, [visible, item, dispatch]); 

  const handleChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleProcesoChange = (procesoId) => {
    setProcesoFiltro(procesoId);
    setFormData((prev) => ({ ...prev, instancia_etapa: null, documento: null }));
    if (procesoId) {
      dispatch(fetchInstanciasPorProceso(procesoId));
    }
  };

  const handleInstanciaChange = (instanciaEtapaId) => {
    setFormData((prev) => ({ ...prev, instancia_etapa: instanciaEtapaId, documento: null }));
  };

  const validar = () => {
    if (!esEdicion && (!formData.instancia_etapa || !formData.documento)) {
      setValidationError('La instancia de etapa y el documento son obligatorios.');
      return false;
    }
    if (formData.porcentaje == null || formData.porcentaje < 0 || formData.porcentaje > 100) {
      setValidationError('El porcentaje debe estar entre 0 y 100.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const payloadComun = { porcentaje: formData.porcentaje, aprobado: formData.aprobado };
    const accion = esEdicion
      ? actualizarValidacionAntiplagio({ id: item.id, payload: payloadComun })
      : crearValidacionAntiplagio({
          ...payloadComun,
          instancia_etapa: formData.instancia_etapa,
          documento: formData.documento,
        });
    dispatch(accion).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label={esEdicion ? 'Guardar Cambios' : 'Registrar'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Validación de Antiplagio' : 'Nueva Validación de Antiplagio'}
      visible={visible}
      style={{ width: '35vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        {esEdicion ? (
          <div className="formgrid grid">
            <div className="field mb-3 col">
              <label>Instancia de Etapa</label>
              <span className="p-inputtext p-disabled">
                {item.instancia_etapa_etapa || `#${item.instancia_etapa}`}
              </span>
            </div>
            <div className="field mb-3 col">
              <label>Documento</label>
              <span className="p-inputtext p-disabled">
                {item.documento_nombre_documento || `#${item.documento}`}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="field mb-3">
              <label htmlFor="proceso_filtro">Proceso Formativo</label>
              <Dropdown
                inputId="proceso_filtro"
                value={procesoFiltro}
                options={procesos}
                optionLabel="titulo"
                optionValue="id"
                filter
                onChange={(e) => handleProcesoChange(e.value)}
                placeholder="Seleccione el proceso formativo"
                loading={cargandoProcesos}
              />
              <small className="text-muted">Filtro de cliente, solo para ubicar la instancia de etapa.</small>
            </div>
            <div className="field mb-3">
              <label htmlFor="instancia_etapa">Instancia de Etapa *</label>
              <Dropdown
                inputId="instancia_etapa"
                value={formData.instancia_etapa}
                options={instancias}
                optionLabel={etiquetaInstancia}
                optionValue="id"
                filter
                onChange={(e) => handleInstanciaChange(e.value)}
                placeholder={procesoFiltro ? 'Seleccione la instancia de etapa' : 'Seleccione primero el proceso'}
                disabled={!procesoFiltro || cargandoInstancias}
                loading={cargandoInstancias}
              />
            </div>
            <div className="field mb-3">
              <label htmlFor="documento">Documento *</label>
              <DocumentoPorObjetoSelector
                contentTypeAppLabel="investigacion_formativa"
                contentTypeModel="instanciaetapa"
                objectId={formData.instancia_etapa}
                value={formData.documento}
                onChange={(documentoId) => handleChange('documento', documentoId)}
                soloFirmados={false}
                placeholder="Seleccione el documento a validar"
              />
            </div>
          </>
        )}
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="porcentaje">Porcentaje de Similitud *</label>
            <InputNumber inputId="porcentaje" value={formData.porcentaje} onValueChange={(e) => handleChange('porcentaje', e.value)} min={0} max={100} suffix="%" mode="decimal" minFractionDigits={1} />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="aprobado">Resultado *</label>
            <Dropdown
              inputId="aprobado"
              value={formData.aprobado}
              options={[{ label: 'Aprobado', value: true }, { label: 'No Aprobado', value: false }]}
              onChange={(e) => handleChange('aprobado', e.value)}
            />
          </div>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default ValidacionAntiplagioFormModal;