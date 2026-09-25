// src/domains/formativa/components/postulacionProceso/PostulacionProcesoFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import {
  crearPostulacion,
  actualizarPostulacion,
} from '../../../../features/postulacionProceso/postulacionProcesoSlice';
import { fetchEstudiantes } from '../../../../features/estudiante/estudianteSlice';
import { fetchModalidadesXFacultad } from '../../../../features/modalidadXFacultad/modalidadXFacultadSlice';

const ESTADO_INICIAL = { estudiante: null, modalidad: null, promedio_actual: null };

/**
 * Modal de alta/edición para PostulacionProceso. `item` = null significa
 * creación; un objeto significa edición (PUT). En edición solo
 * promedio_actual es editable, y solo si la postulación está en BORRADOR —
 * la tabla ya filtra esa condición antes de abrir el modal. estudiante y
 * modalidad son inmutables tras la creación.
 */
const PostulacionProcesoFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.postulacionProceso);
  const { items: estudiantes, loading: cargandoEstudiantes } = useSelector((state) => state.estudiante);
  const { items: modalidadesFacultad, loading: cargandoModalidades } = useSelector(
    (state) => state.modalidadXFacultad
  );
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible) {
      if (!esEdicion) {
        dispatch(fetchEstudiantes({ pageSize: 100 }));
        dispatch(fetchModalidadesXFacultad({ pageSize: 100 }));
      }
      setFormData(
        item
          ? {
              estudiante: item.estudiante ?? null,
              modalidad: item.modalidad ?? null,
              promedio_actual: item.promedio_actual ?? null,
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
    if (!esEdicion && !formData.estudiante) {
      setValidationError('El estudiante es obligatorio.');
      return false;
    }
    if (!esEdicion && !formData.modalidad) {
      setValidationError('La modalidad es obligatoria.');
      return false;
    }
    if (formData.promedio_actual == null || formData.promedio_actual < 0 || formData.promedio_actual > 5) {
      setValidationError('El promedio actual debe estar entre 0.0 y 5.0.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    const accion = esEdicion
      ? actualizarPostulacion({ id: item.id, promedioActual: formData.promedio_actual })
      : crearPostulacion(formData);
    dispatch(accion).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onHide();
      }
    });
  };

  const estudianteLabel = (id) => {
    const est = estudiantes.find((e) => e.id === id);
    return est ? est.persona_nombre_completo : 'N/A';
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button
        label={esEdicion ? 'Guardar Cambios' : 'Postular'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Postulación' : 'Nueva Postulación'}
      visible={visible}
      style={{ width: '35vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="estudiante">Estudiante *</label>
          {esEdicion ? (
            <span className="p-inputtext p-disabled">{estudianteLabel(formData.estudiante)}</span>
          ) : (
            <Dropdown
              inputId="estudiante"
              value={formData.estudiante}
              options={estudiantes.map((e) => ({
                id: e.id,
                label: `${e.persona_nombre_completo} (${e.persona_documento})`,
              }))}
              optionLabel="label"
              optionValue="id"
              filter
              onChange={(e) => handleChange('estudiante', e.value)}
              placeholder="Seleccione el estudiante"
              disabled={cargandoEstudiantes}
            />
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="modalidad">Modalidad (por Facultad) *</label>
          {esEdicion ? (
            <span className="p-inputtext p-disabled">
              {modalidadesFacultad.find((m) => m.id === formData.modalidad)?.modalidad_nombre || 'N/A'}
            </span>
          ) : (
            <Dropdown
              inputId="modalidad"
              value={formData.modalidad}
              options={modalidadesFacultad.map((m) => ({
                id: m.id,
                label: `${m.modalidad_nombre} — ${m.facultad_nombre}`,
              }))}
              optionLabel="label"
              optionValue="id"
              filter
              onChange={(e) => handleChange('modalidad', e.value)}
              placeholder="Seleccione la modalidad"
              disabled={cargandoModalidades}
            />
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="promedio_actual">Promedio Académico Actual *</label>
          <InputNumber
            inputId="promedio_actual"
            value={formData.promedio_actual}
            onValueChange={(e) => handleChange('promedio_actual', e.value)}
            min={0}
            max={5}
            mode="decimal"
            minFractionDigits={1}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {error && <Message severity="error" className="mt-3 w-full" text={error} />}
      </div>
    </Dialog>
  );
};

export default PostulacionProcesoFormModal;