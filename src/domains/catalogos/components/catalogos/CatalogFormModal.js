// src/domains/catalogos/components/catalogos/CatalogFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { crearCatalogoItem, actualizarCatalogoItem } from '../../../../features/catalogos/catalogosSlice';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

/**
 * Modal de alta/edición genérico para cualquier catálogo de
 * catalogosConfig.js. `item` = null significa modo creación; un objeto
 * significa edición (se hace PATCH a `${endpoint}${item.id}/`).
 */
const CatalogFormModal = ({ visible, onHide, config, item }) => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((state) => state.catalogos[config.key]);
  const metadata = useSelector((state) => state.metadata);
  const [formData, setFormData] = useState({});
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const esEdicion = Boolean(item);

  // Si algún campo es 'select', sus opciones viven en metadata (grupos,
  // facultades, etc.) — se cargan una sola vez si todavía no están.
  useEffect(() => {
    const necesitaMetadata = config.campos.some((c) => c.type === 'select');
    if (visible && necesitaMetadata && metadata.grados.length === 0) {
      dispatch(fetchMetadata());
    }
  }, [visible, dispatch, config.campos, metadata.grados.length]);  

  useEffect(() => {
    if (visible) {
      const inicial = {};
      config.campos.forEach((campo) => {
        if (campo.type === 'checkbox') {
          inicial[campo.name] = item ? Boolean(item[campo.name]) : false;
        } else {
          inicial[campo.name] = item ? item[campo.name] ?? '' : '';
        }
      });
      setFormData(inicial);
      setValidationError('');
    }
  }, [visible, item, config.campos]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    for (const campo of config.campos) {
      if (campo.type === 'checkbox') continue; // false es un valor válido, nunca "vacío"
      if (campo.required && !String(formData[campo.name] ?? '').trim()) {
        setValidationError(`El campo '${campo.label}' es obligatorio.`);
        return false;
      }
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
      ? actualizarCatalogoItem({ catalogKey: config.key, id: item.id, payload })
      : crearCatalogoItem({ catalogKey: config.key, payload });
    dispatch(accion).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setIsConfirmVisible(false);
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
        onClick={handleShowConfirmation}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? `Editar ${config.tituloSingular}` : `Nuevo ${config.tituloSingular}`}
      visible={visible}
      style={{ width: '40vw' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        {config.avisoPermiso && (
          <Message severity="info" className="mb-3 w-full" text={config.avisoPermiso} />
        )}        
        {config.campos.map((campo) => (
          <div className="field mb-3" key={campo.name}>
            <label htmlFor={campo.name}>{campo.label}{campo.required ? ' *' : ' (opcional)'}</label>
            {campo.type === 'select' ? (
              <Dropdown
                inputId={campo.name}
                value={formData[campo.name] || null}
                options={metadata[campo.optionsSource] || []}
                optionLabel={campo.optionLabel}
                optionValue={campo.optionValue}
                onChange={(e) => handleChange(campo.name, e.value)}
                filter
                placeholder={`Seleccione ${campo.label.toLowerCase()}`}
                loading={metadata.loading}
              />
            ) : campo.type === 'checkbox' ? (
              <div className="mt-2">
                <Checkbox
                  inputId={campo.name}
                  checked={Boolean(formData[campo.name])}
                  onChange={(e) => handleChange(campo.name, e.checked)}
                />
              </div>
            ) : campo.type === 'number' ? (
              <InputNumber
                inputId={campo.name}
                value={formData[campo.name] === '' ? null : formData[campo.name]}
                onValueChange={(e) => handleChange(campo.name, e.value)}
                useGrouping={false}
              />              
            ) : (
              <InputText
                id={campo.name}
                value={formData[campo.name] || ''}
                maxLength={campo.maxLength}
                onChange={(e) => handleChange(campo.name, e.target.value)}
              />
            )}            
          </div>
        ))}
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
          {config.campos.map((campo) => {
            let valorMostrado = formData[campo.name] || 'N/A';
            if (campo.type === 'checkbox') {
              valorMostrado = formData[campo.name] ? 'Sí' : 'No';
            }            
            if (campo.type === 'select' && formData[campo.name]) {
              const opcion = (metadata[campo.optionsSource] || []).find(
                (o) => o[campo.optionValue] === formData[campo.name]
              );
              valorMostrado = opcion ? opcion[campo.optionLabel] : 'N/A';
            }
            return (
              <li key={campo.name}>
                <strong>{campo.label}:</strong> {valorMostrado}
              </li>
            );
          })}          
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default CatalogFormModal;