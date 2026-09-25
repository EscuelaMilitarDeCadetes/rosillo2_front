// src/domains/formativa/components/eventoEvaluativo/EventoEvaluativoFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { crearEventoEvaluativo } from '../../../../features/eventoEvaluativo/eventoEvaluativoSlice';
import { fetchProcesosActivos } from '../../../../features/procesosInvFormativa/procesosInvFormativaSlice';
import UsuarioAutoComplete from '../../../usuarios/components/usuarioAdmin/UsuarioAutoComplete';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const ESTADO_INICIAL = {
  proceso_formativo: null,
  numero: null,
  es_obligatoria: true,
  fecha_sustentacion: null,
  lugar: '',
  usuario_revisor: null,
};


/**
 * Solo creación: reprogramar, registrar resultado y cargar acta son
 * transiciones específicas cubiertas por modales aparte.
 *
 * También se exige revisor solo si el ejecutor tiene rol FACULTAD.
 */
const EventoEvaluativoFormModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.eventoEvaluativo);
  const { items: procesos } = useSelector((state) => state.procesosInvFormativa);
  const [usuarioRevisorSeleccionado, setUsuarioRevisorSeleccionado] = useState(null);
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

  const validar = () => {
    if (!formData.proceso_formativo) {
      setValidationError('El proceso formativo es obligatorio.');
      return false;
    }
    if (!formData.numero || formData.numero < 1) {
      setValidationError('El número de sustentación debe ser mayor o igual a 1.');
      return false;
    }
    if (!formData.fecha_sustentacion) {
      setValidationError('La fecha de sustentación es obligatoria.');
      return false;
    }
    if (!formData.lugar.trim()) {
      setValidationError('El lugar de la sustentación es obligatorio.');
      return false;
    }
    if (esFacultad && !formData.usuario_revisor) {
      setValidationError('Como Facultad, debe seleccionar un revisor (Decano) para esta sustentación.');
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
    dispatch(
      crearEventoEvaluativo({
        ...formData,
        fecha_sustentacion: formData.fecha_sustentacion.toISOString(),
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
      <Button label="Programar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <Dialog
      header="Nueva Sustentación"
      visible={visible}
      style={{ width: '40vw' }}
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
            onChange={(e) => handleChange('proceso_formativo', e.value)}
            placeholder="Seleccione el proceso formativo"
          />
        </div>
        <div className="formgrid grid">
          <div className="field mb-3 col">
            <label htmlFor="numero">Número *</label>
            <InputNumber
              inputId="numero"
              value={formData.numero}
              onValueChange={(e) => handleChange('numero', e.value)}
              min={1}
              useGrouping={false}
            />
          </div>
          <div className="field mb-3 col flex align-items-end">
            <div className="flex align-items-center gap-2">
              <Checkbox
                inputId="es_obligatoria"
                checked={formData.es_obligatoria}
                onChange={(e) => handleChange('es_obligatoria', e.checked)}
              />
              <label htmlFor="es_obligatoria">Es obligatoria</label>
            </div>
          </div>
        </div>
        <div className="field mb-3">
          <label htmlFor="fecha_sustentacion">Fecha y Hora de Sustentación *</label>
          <Calendar
            inputId="fecha_sustentacion"
            value={formData.fecha_sustentacion}
            onChange={(e) => handleChange('fecha_sustentacion', e.value)}
            showTime
            hourFormat="24"
            dateFormat="yy-mm-dd"
            showIcon
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="lugar">Lugar *</label>
          <InputText
            id="lugar"
            value={formData.lugar}
            maxLength={255}
            placeholder="Ej: 'Sala de Juntas A' o 'Virtual vía Teams'"
            onChange={(e) => handleChange('lugar', e.target.value)}
          />
        </div>
        <div className="field mb-3">
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
              Programas esta sustentación como Facultad: el backend exige un revisor.
            </small>
          )}
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
          <li><strong>Número:</strong> {formData.numero ?? 'N/A'}</li>
          <li><strong>Lugar:</strong> {formData.lugar || 'N/A'}</li>
          <li><strong>Fecha:</strong> {formData.fecha_sustentacion?.toLocaleString() || 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default EventoEvaluativoFormModal;