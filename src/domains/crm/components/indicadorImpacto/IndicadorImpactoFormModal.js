// src/domains/crm/components/indicadorImpacto/IndicadorImpactoFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import {
  crearIndicador,
  actualizarIndicador,
  fetchProyectosOpciones,
} from '../../../../features/crm/indicadorImpactoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const ESTADO_INICIAL = { proyecto: null, kpi_nombre: '', valor_proyectado: null, valor_real: 0 };

/**
 * Modal de alta/edición completa para IndicadorImpacto. `item` = null
 * significa modo creación; un objeto significa edición (PATCH a
 * `crm/indicador-impacto/{id}/`). Para solo ajustar el avance (valor_real)
 * sin tocar la meta ni el proyecto/KPI, ver ActualizarAvanceModal.js, que
 * usa el atajo de negocio `actualizar-valor-real` del backend.
 */
const IndicadorImpactoFormModal = ({ visible, onHide, item }) => {
  const dispatch = useDispatch();
  const { saving, error, proyectosOpciones, proyectosOpcionesLoading } = useSelector(
    (state) => state.indicadorImpacto
  );
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const esEdicion = Boolean(item);

  useEffect(() => {
    if (visible && proyectosOpciones.length === 0) {
      dispatch(fetchProyectosOpciones());
    }
  }, [visible, dispatch, proyectosOpciones.length]);

  useEffect(() => {
    if (visible) {
      setFormData(
        item
          ? {
              proyecto: item.proyecto ?? null,
              kpi_nombre: item.kpi_nombre ?? '',
              valor_proyectado: item.valor_proyectado ?? null,
              valor_real: item.valor_real ?? 0,
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
    if (!formData.proyecto) {
      setValidationError('El proyecto es obligatorio.');
      return false;
    }
    if (!formData.kpi_nombre.trim()) {
      setValidationError('El nombre del KPI es obligatorio.');
      return false;
    }
    if (formData.valor_proyectado === null || formData.valor_proyectado === undefined) {
      setValidationError('El valor proyectado es obligatorio.');
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
    const payload = { ...formData };
    const accion = esEdicion
      ? actualizarIndicador({ id: item.id, payload })
      : crearIndicador(payload);
    dispatch(accion).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const tituloProyecto = (id) => proyectosOpciones.find((p) => p.id === id)?.titulo || 'N/A';

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
      header={esEdicion ? 'Editar Indicador de Impacto' : 'Nuevo Indicador de Impacto'}
      visible={visible}
      style={{ width: '40vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="proyecto">Proyecto *</label>
          <Dropdown
            inputId="proyecto"
            value={formData.proyecto}
            options={proyectosOpciones}
            optionLabel="titulo"
            optionValue="id"
            onChange={(e) => handleChange('proyecto', e.value)}
            filter
            placeholder="Seleccione el proyecto"
            loading={proyectosOpcionesLoading}
            emptyMessage="No hay proyectos disponibles."
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="kpi_nombre">Nombre del KPI *</label>
          <InputText
            id="kpi_nombre"
            value={formData.kpi_nombre}
            maxLength={100}
            onChange={(e) => handleChange('kpi_nombre', e.target.value)}
            placeholder="Ej: Beneficiarios impactados"
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="valor_proyectado">Valor Proyectado (meta) *</label>
          <InputNumber
            inputId="valor_proyectado"
            value={formData.valor_proyectado}
            onValueChange={(e) => handleChange('valor_proyectado', e.value)}
            minFractionDigits={0}
            maxFractionDigits={2}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="valor_real">Valor Real (avance actual)</label>
          <InputNumber
            inputId="valor_real"
            value={formData.valor_real}
            onValueChange={(e) => handleChange('valor_real', e.value)}
            minFractionDigits={0}
            maxFractionDigits={2}
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
          <li><strong>Proyecto:</strong> {tituloProyecto(formData.proyecto)}</li>
          <li><strong>KPI:</strong> {formData.kpi_nombre || 'N/A'}</li>
          <li><strong>Valor proyectado:</strong> {formData.valor_proyectado ?? 'N/A'}</li>
          <li><strong>Valor real:</strong> {formData.valor_real ?? 0}</li>
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default IndicadorImpactoFormModal;