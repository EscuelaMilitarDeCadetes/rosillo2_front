// src/domains/crm/components/interaccion/InteraccionFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import {
  crearInteraccion,
  actualizarInteraccion,
  fetchEntidadesOpciones,
  fetchProyectosOpciones,
} from '../../../../features/crm/interaccionSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

// Debe coincidir exactamente con MEDIOS_VALIDOS en
// apps/crm/validators/interaccion_validator.py
const MEDIOS = [
  { label: 'Reunión', value: 'REUNION' },
  { label: 'Firma Convenio', value: 'CONVENIO' },
];

const ESTADO_INICIAL = { entidad: null, proyecto_asociado: null, medio: '', resumen: '' };

/**
 * Modal de alta/edición para Interaccion. `item` = null significa modo
 * creación; un objeto significa edición (PATCH a `crm/interaccion/{id}/`).
 * La entidad externa se selecciona con el mismo listado que usa
 * EntidadExternaTable (crm/entidad-externa/), cargado bajo demanda aquí.
 */
const InteraccionFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const {
    saving,
    error,
    entidadesOpciones,
    entidadesOpcionesLoading,
    proyectosOpciones,
    proyectosOpcionesLoading,
  } = useSelector((state) => state.interaccion);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      if (entidadesOpciones.length === 0) dispatch(fetchEntidadesOpciones());
      if (proyectosOpciones.length === 0) dispatch(fetchProyectosOpciones());
    }
  }, [visible, dispatch, entidadesOpciones.length, proyectosOpciones.length]);

  useEffect(() => {
    if (visible) {
      setFormData(
        item
          ? {
              entidad: item.entidad ?? null,
              proyecto_asociado: item.proyecto_asociado ?? null,
              medio: item.medio ?? '',
              resumen: item.resumen ?? '',
            }
          : ESTADO_INICIAL
      );
      setValidationError('');
    }
  }, [visible, item]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!formData.entidad) {
      setValidationError('La entidad externa es obligatoria.');
      return false;
    }
    if (!formData.medio) {
      setValidationError('El medio de la interacción es obligatorio.');
      return false;
    }
    if (!formData.resumen.trim()) {
      setValidationError('El resumen de la interacción es obligatorio.');
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
    // proyecto_asociado es opcional (null=True en el modelo); se envía
    // explícitamente en null si no se seleccionó ninguno.
    const payload = { ...formData, proyecto_asociado: formData.proyecto_asociado || null };
    const accion = esEdicion
      ? actualizarInteraccion({ id: item.id, payload })
      : crearInteraccion(payload);
    dispatch(accion).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const nombreEntidad = (id) => entidadesOpciones.find((e) => e.id === id)?.nombre || 'N/A';
  const tituloProyecto = (id) => proyectosOpciones.find((p) => p.id === id)?.titulo || 'Ninguno';
  const medioLabel = (valor) => MEDIOS.find((m) => m.value === valor)?.label || 'N/A';

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label={esEdicion ? 'Guardar Cambios' : 'Registrar'}
        icon="pi pi-check"
        onClick={handleShowConfirmation}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Interacción' : 'Nueva Interacción'}
      visible={visible}
      style={{ width: '40vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="entidad">Entidad Externa *</label>
          <Dropdown
            inputId="entidad"
            value={formData.entidad}
            options={entidadesOpciones}
            optionLabel="nombre"
            optionValue="id"
            onChange={(e) => handleChange('entidad', e.value)}
            filter
            placeholder="Seleccione la entidad externa"
            loading={entidadesOpcionesLoading}
            emptyMessage="No hay entidades externas registradas."
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="proyecto_asociado">Proyecto Asociado (opcional)</label>
          <Dropdown
            inputId="proyecto_asociado"
            value={formData.proyecto_asociado}
            options={proyectosOpciones}
            optionLabel="titulo"
            optionValue="id"
            onChange={(e) => handleChange('proyecto_asociado', e.value)}
            filter
            showClear
            placeholder="Sin proyecto asociado"
            loading={proyectosOpcionesLoading}
            emptyMessage="No hay proyectos disponibles."
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="medio">Medio *</label>
          <Dropdown
            inputId="medio"
            value={formData.medio || null}
            options={MEDIOS}
            onChange={(e) => handleChange('medio', e.value)}
            placeholder="Seleccione el medio"
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="resumen">Resumen *</label>
          <InputTextarea
            id="resumen"
            value={formData.resumen}
            onChange={(e) => handleChange('resumen', e.target.value)}
            rows={4}
            autoResize
          />
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
          <li><strong>Entidad:</strong> {nombreEntidad(formData.entidad)}</li>
          <li><strong>Proyecto asociado:</strong> {tituloProyecto(formData.proyecto_asociado)}</li>
          <li><strong>Medio:</strong> {medioLabel(formData.medio)}</li>
          <li><strong>Resumen:</strong> {formData.resumen || 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default InteraccionFormModal;