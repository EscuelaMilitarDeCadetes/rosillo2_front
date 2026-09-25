// src/domains/formativa/components/procesoFormativo/ProcesoFormativoFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  crearProcesoFormativo,
  actualizarProcesoFormativo,
} from '../../../../features/procesoFormativo/procesoFormativoSlice';
import { fetchFlujosActivos } from '../../../../features/flujoProceso/flujoProcesoSlice';
import { fetchBancoIdeasDisponibles } from '../../../../features/bancoIdeas/bancoIdeasSlice';
import { fetchEntidadesExternas } from '../../../../features/crm/entidadExternaSlice';

const ESTADO_INICIAL = {
  flujo_version: null,
  titulo: '',
  observacion: '',
  fecha_inicio: null,
  fecha_fin: null,
  idea: null,
  entidad_externa: null,
  palabras_clave: '',
  requiere_sustentacion: false,
  permite_segunda_instancia: false,
};

const aFecha = (valor) => (valor ? new Date(valor) : null);
const aISO = (fecha) => (fecha ? fecha.toISOString().slice(0, 10) : null);


const ProcesoFormativoFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.procesoFormativo);
  const { items: flujos } = useSelector((state) => state.flujoProceso);
  const { items: ideasDisponibles } = useSelector((state) => state.bancoIdeas);
  const { items: entidadesExternas } = useSelector((state) => state.entidadExterna);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      if (!esEdicion) {
        dispatch(fetchFlujosActivos());
        dispatch(fetchBancoIdeasDisponibles());
        dispatch(fetchEntidadesExternas({ pageSize: 100 }));
      }
      setFormData(
        item
          ? {
              flujo_version: item.flujo_version ?? null,
              titulo: item.titulo ?? '',
              observacion: item.observacion ?? '',
              fecha_inicio: aFecha(item.fecha_inicio),
              fecha_fin: aFecha(item.fecha_fin),
              idea: item.idea ?? null,
              entidad_externa: item.entidad_externa ?? null,
              palabras_clave: item.palabras_clave ?? '',
              requiere_sustentacion: item.requiere_sustentacion ?? false,
              permite_segunda_instancia: item.permite_segunda_instancia ?? false,
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
    if (!esEdicion && !formData.flujo_version) {
      setValidationError('La versión de flujo es obligatoria.');
      return false;
    }
    if (!formData.titulo.trim()) {
      setValidationError('El título del proceso es obligatorio.');
      return false;
    }
    if (!formData.observacion.trim()) {
      setValidationError('El tema/área del proyecto es obligatorio.');
      return false;
    }
    if (!formData.fecha_inicio || !formData.fecha_fin) {
      setValidationError('Las fechas de inicio y fin son obligatorias.');
      return false;
    }
    if (formData.fecha_fin < formData.fecha_inicio) {
      setValidationError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const payloadComun = {
      titulo: formData.titulo,
      observacion: formData.observacion,
      fecha_inicio: aISO(formData.fecha_inicio),
      fecha_fin: aISO(formData.fecha_fin),
      idea: formData.idea,
      entidad_externa: formData.entidad_externa,
      palabras_clave: formData.palabras_clave || null,
      requiere_sustentacion: formData.requiere_sustentacion,
      permite_segunda_instancia: formData.permite_segunda_instancia,
    };
    const accion = esEdicion
      ? actualizarProcesoFormativo({ id: item.id, payload: payloadComun })
      : crearProcesoFormativo({ ...payloadComun, flujo_version: formData.flujo_version });
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
        label={esEdicion ? 'Guardar Cambios' : 'Crear Proceso'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Proceso Formativo' : 'Nuevo Proceso Formativo'}
      visible={visible}
      style={{ width: '50vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="flujo_version">Versión de Flujo *</label>
          {esEdicion ? (
            <span className="p-inputtext p-disabled">{item.flujo_version_nombre}</span>
          ) : (
            <Dropdown
              inputId="flujo_version"
              value={formData.flujo_version}
              options={flujos}
              optionLabel="nombre"
              optionValue="id"
              filter
              onChange={(e) => handleChange('flujo_version', e.value)}
              placeholder="Seleccione la versión de flujo"
            />
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="titulo">Título del Proceso *</label>
          <InputText id="titulo" value={formData.titulo} maxLength={500} onChange={(e) => handleChange('titulo', e.target.value)} />
        </div>
        <div className="field mb-3">
          <label htmlFor="observacion">Tema / Área del Proyecto *</label>
          <InputTextarea id="observacion" value={formData.observacion} rows={3} onChange={(e) => handleChange('observacion', e.target.value)} />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="fecha_inicio">Fecha Inicio *</label>
            <Calendar inputId="fecha_inicio" value={formData.fecha_inicio} onChange={(e) => handleChange('fecha_inicio', e.value)} dateFormat="yy-mm-dd" showIcon />
          </div>
          <div className="field mb-3 col">
            <label htmlFor="fecha_fin">Fecha Fin *</label>
            <Calendar inputId="fecha_fin" value={formData.fecha_fin} onChange={(e) => handleChange('fecha_fin', e.value)} dateFormat="yy-mm-dd" showIcon />
          </div>
        </div>
        {!esEdicion && (
          <div className="field mb-3">
            <label htmlFor="idea">Idea del Banco (opcional)</label>
            <Dropdown
              inputId="idea"
              value={formData.idea}
              options={ideasDisponibles}
              optionLabel="idea"
              optionValue="id"
              filter
              showClear
              onChange={(e) => handleChange('idea', e.value)}
              placeholder="Vincular una idea disponible del banco"
            />
          </div>
        )}
        <div className="field mb-3">
          <label htmlFor="entidad_externa">Entidad Externa (opcional)</label>
          <Dropdown
            inputId="entidad_externa"
            value={formData.entidad_externa}
            options={entidadesExternas}
            optionLabel="nombre"
            optionValue="id"
            filter
            showClear
            onChange={(e) => handleChange('entidad_externa', e.value)}
            placeholder="Vincular una entidad externa (convenio, empresa, etc.)"
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="palabras_clave">Palabras Clave</label>
          <InputText id="palabras_clave" value={formData.palabras_clave} maxLength={255} onChange={(e) => handleChange('palabras_clave', e.target.value)} />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col flex align-items-center gap-2">
            <Checkbox inputId="requiere_sustentacion" checked={formData.requiere_sustentacion} onChange={(e) => handleChange('requiere_sustentacion', e.checked)} />
            <label htmlFor="requiere_sustentacion">Requiere sustentación</label>
          </div>
          <div className="field mb-3 col flex align-items-center gap-2">
            <Checkbox inputId="permite_segunda_instancia" checked={formData.permite_segunda_instancia} onChange={(e) => handleChange('permite_segunda_instancia', e.checked)} />
            <label htmlFor="permite_segunda_instancia">Permite segunda instancia</label>
          </div>
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default ProcesoFormativoFormModal;