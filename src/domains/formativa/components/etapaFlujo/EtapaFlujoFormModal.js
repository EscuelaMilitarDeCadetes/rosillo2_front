// src/domains/formativa/components/etapaFlujo/EtapaFlujoFormModal.js
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
import {
  crearEtapaFlujo,
  actualizarEtapaFlujo,
} from '../../../../features/etapaFlujo/etapaFlujoSlice';
import { fetchFlujosActivos } from '../../../../features/flujoProceso/flujoProcesoSlice';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';

const TIPOS_ETAPA = [
  { label: 'Inicio', value: 'INICIO' },
  { label: 'Carga de Documento', value: 'CARGA_DOC' },
  { label: 'Aprobación', value: 'APROBACION' },
  { label: 'Evaluación', value: 'EVALUACION' },
  { label: 'Revisión', value: 'REVISION' },
  { label: 'Seguimiento', value: 'SEGUIMIENTO' },
  { label: 'Sustentación', value: 'SUSTENTACION' },
  { label: 'Cierre', value: 'CIERRE' },
  { label: 'Otro', value: 'OTRO' },
];
const ROLES_RESPONSABLE = [
  { label: 'Estudiante', value: 'ESTUDIANTE' },
  { label: 'Tutor', value: 'TUTOR' },
  { label: 'Jurado', value: 'JURADO' },
  { label: 'Facultad', value: 'FACULTAD' },
];

const ESTADO_INICIAL = {
  flujo: null,
  documento_requerido: null,
  nombre: '',
  descripcion: '',
  orden: null,
  codigo: '',
  tipo_etapa: 'OTRO',
  rol_responsable: 'ESTUDIANTE',
  es_obligatoria: true,
  permite_paralelismo: true,
  permite_reversion: true,
  permite_salto: true,
  requiere_aprobacion: true,
  requiere_documento: true,
  requiere_firma: true,
  requiere_evaluacion: true,
  es_final: false,
  permite_reintentos: true,
};

const BOOLEANOS_DEFAULT_TRUE = [
  ['permite_paralelismo', 'Permite paralelismo'],
  ['permite_reversion', 'Permite reversión'],
  ['permite_salto', 'Permite salto'],
  ['requiere_aprobacion', 'Requiere aprobación'],
  ['requiere_documento', 'Requiere documento'],
  ['requiere_firma', 'Requiere firma'],
  ['requiere_evaluacion', 'Requiere evaluación'],
  ['permite_reintentos', 'Permite reintentos'],
];


const EtapaFlujoFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.etapaFlujo);
  const { items: flujos, loading: cargandoFlujos } = useSelector((state) => state.flujoProceso);
  const { tiposDocumento, loading: cargandoMetadata } = useSelector((state) => state.metadata);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      if (!esEdicion) {
        dispatch(fetchFlujosActivos());
      }
      dispatch(fetchMetadata());
      setFormData(
        item
          ? {
              flujo: item.flujo ?? null,
              documento_requerido: item.documento_requerido ?? null,
              nombre: item.nombre ?? '',
              descripcion: item.descripcion ?? '',
              orden: item.orden ?? null,
              codigo: item.codigo ?? '',
              tipo_etapa: item.tipo_etapa ?? 'OTRO',
              rol_responsable: item.rol_responsable ?? 'ESTUDIANTE',
              es_obligatoria: item.es_obligatoria ?? true,
              permite_paralelismo: item.permite_paralelismo ?? true,
              permite_reversion: item.permite_reversion ?? true,
              permite_salto: item.permite_salto ?? true,
              requiere_aprobacion: item.requiere_aprobacion ?? true,
              requiere_documento: item.requiere_documento ?? true,
              requiere_firma: item.requiere_firma ?? true,
              requiere_evaluacion: item.requiere_evaluacion ?? true,
              es_final: item.es_final ?? false,
              permite_reintentos: item.permite_reintentos ?? true,
            }
          : ESTADO_INICIAL
      );
      setValidationError('');
    }
  }, [visible, item, esEdicion, dispatch]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!esEdicion && !formData.flujo) {
      setValidationError('El flujo de proceso es obligatorio.');
      return false;
    }
    if (!formData.nombre.trim()) {
      setValidationError('El nombre de la etapa es obligatorio.');
      return false;
    }
    if (!formData.orden || formData.orden < 1) {
      setValidationError('El orden debe ser mayor o igual a 1.');
      return false;
    }
    if (!formData.codigo.trim()) {
      setValidationError('El código de la etapa es obligatorio.');
      return false;
    }
    if (formData.requiere_documento && !formData.documento_requerido) {
      setValidationError(
        'Esta etapa requiere documento; debe seleccionar el tipo de documento esperado.'
      );
      return false;
    }
    if (formData.es_final && formData.permite_salto) {
      setValidationError('Una etapa final no puede permitir salto a una etapa posterior.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const payloadComun = {
      documento_requerido: formData.documento_requerido,
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      orden: formData.orden,
      codigo: formData.codigo,
      tipo_etapa: formData.tipo_etapa,
      rol_responsable: formData.rol_responsable,
      es_obligatoria: formData.es_obligatoria,
      permite_paralelismo: formData.permite_paralelismo,
      permite_reversion: formData.permite_reversion,
      permite_salto: formData.permite_salto,
      requiere_aprobacion: formData.requiere_aprobacion,
      requiere_documento: formData.requiere_documento,
      requiere_firma: formData.requiere_firma,
      requiere_evaluacion: formData.requiere_evaluacion,
      es_final: formData.es_final,
      permite_reintentos: formData.permite_reintentos,
    };
    const accion = esEdicion
      ? actualizarEtapaFlujo({ id: item.id, payload: payloadComun })
      : crearEtapaFlujo({ ...payloadComun, flujo: formData.flujo });
    dispatch(accion).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const flujoLabel = (id) => flujos.find((f) => f.id === id)?.nombre || `ID ${id}`;

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label={esEdicion ? 'Guardar Cambios' : 'Crear Etapa'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Etapa de Flujo' : 'Nueva Etapa de Flujo'}
      visible={visible}
      style={{ width: '50vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="flujo">Flujo de Proceso *</label>
          {esEdicion ? (
            <InputText value={flujoLabel(formData.flujo)} disabled />
          ) : (
            <Dropdown
              inputId="flujo"
              value={formData.flujo}
              options={flujos}
              optionLabel="nombre"
              optionValue="id"
              filter
              loading={cargandoFlujos}
              onChange={(e) => handleChange('flujo', e.value)}
              placeholder="Seleccione el flujo de proceso"
            />
          )}
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="nombre">Nombre *</label>
            <InputText
              id="nombre"
              value={formData.nombre}
              maxLength={150}
              onChange={(e) => handleChange('nombre', e.target.value)}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="codigo">Código *</label>
            <InputText
              id="codigo"
              value={formData.codigo}
              maxLength={100}
              onChange={(e) => handleChange('codigo', e.target.value)}
            />
          </div>
          <div className="field mb-3 col-fixed" style={{ width: '8rem' }}>
            <label htmlFor="orden">Orden *</label>
            <InputNumber
              inputId="orden"
              value={formData.orden}
              onValueChange={(e) => handleChange('orden', e.value)}
              min={1}
              useGrouping={false}
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="descripcion">Descripción</label>
          <InputTextarea
            id="descripcion"
            value={formData.descripcion}
            rows={2}
            onChange={(e) => handleChange('descripcion', e.target.value)}
          />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="tipo_etapa">Tipo de Etapa *</label>
            <Dropdown
              inputId="tipo_etapa"
              value={formData.tipo_etapa}
              options={TIPOS_ETAPA}
              onChange={(e) => handleChange('tipo_etapa', e.value)}
            />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="rol_responsable">Rol Responsable *</label>
            <Dropdown
              inputId="rol_responsable"
              value={formData.rol_responsable}
              options={ROLES_RESPONSABLE}
              onChange={(e) => handleChange('rol_responsable', e.value)}
            />
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="documento_requerido">
            Tipo de Documento Requerido {formData.requiere_documento ? '*' : ''}
          </label>
          <Dropdown
            inputId="documento_requerido"
            value={formData.documento_requerido}
            options={tiposDocumento}
            optionLabel="nombre_documento"
            optionValue="id"
            filter
            showClear
            loading={cargandoMetadata}
            onChange={(e) => handleChange('documento_requerido', e.value)}
            placeholder="Seleccione el tipo de documento"
          />
        </div>
        <div className="field mb-3">
          <div className="flex align-items-center gap-2">
            <Checkbox
              inputId="es_obligatoria"
              checked={formData.es_obligatoria}
              onChange={(e) => handleChange('es_obligatoria', e.checked)}
            />
            <label htmlFor="es_obligatoria">Es obligatoria</label>
          </div>
        </div>
        <div className="field mb-3">
          <label>Comportamiento de la etapa</label>
          <div className="grid">
            {BOOLEANOS_DEFAULT_TRUE.map(([campo, etiqueta]) => (
              <div key={campo} className="col-6 md:col-3 mb-2">
                <div className="flex align-items-center gap-2">
                  <Checkbox
                    inputId={campo}
                    checked={formData[campo]}
                    onChange={(e) => handleChange(campo, e.checked)}
                  />
                  <label htmlFor={campo}>{etiqueta}</label>
                </div>
              </div>
            ))}
            <div className="col-6 md:col-3 mb-2">
              <div className="flex align-items-center gap-2">
                <Checkbox
                  inputId="es_final"
                  checked={formData.es_final}
                  onChange={(e) => handleChange('es_final', e.checked)}
                />
                <label htmlFor="es_final">Es etapa final</label>
              </div>
            </div>
          </div>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default EtapaFlujoFormModal;