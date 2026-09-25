// src/domains/institucional/components/gerentes/NewGerenteModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { crearGerente } from '../../../../features/gerentes/gerentesSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';


const NewGerenteModal = ({ visible, onHide, gerenteActual }) => {
  const dispatch = useDispatch();
  const { personas } = useSelector((state) => state.metadata);
  const { saving, error } = useSelector((state) => state.gerentes);
  const [personaId, setPersonaId] = useState(null);
  const [fechaIngreso, setFechaIngreso] = useState(new Date());
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPersonaId(null);
      setFechaIngreso(new Date());
      setValidationError('');
    }
  }, [visible]);

  const personaSeleccionada = personas?.find((p) => p.id === personaId);

  const formatDate = (d) => {
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleShowConfirmation = () => {
    if (!personaId || !fechaIngreso) {
      setValidationError('Debe seleccionar la persona y la fecha de ingreso.');
      return;
    }
    setValidationError('');    
    setIsConfirmVisible(true);
  };

  const handleConfirmCreate = () => {
    dispatch(crearGerente({ persona: personaId, fecha_ingreso: formatDate(fechaIngreso) })).then((result) => {
      if (crearGerente.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Asignar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <>
      <Dialog header="Asignar Nuevo Gerente" visible={visible} style={{ width: '40vw' }} footer={footer} onHide={onHide}>
        {gerenteActual && (
          <div className="alert alert-warning">
            Actualmente <strong>{gerenteActual.persona_nombre}</strong> es el gerente vigente. Al asignar uno
            nuevo, su periodo se cerrará automáticamente con fecha de salida igual a la fecha de ingreso del
            nuevo gerente.
          </div>
        )}
        <div className="p-fluid formgrid grid">
          <div className="field col-12">
            <label htmlFor="persona">Persona</label>
            <Dropdown
              inputId="persona"
              value={personaId}
              options={personas}
              onChange={(e) => setPersonaId(e.value)}
              optionLabel={(p) => `${p.nombre} ${p.apellido} (${p.documento})`}
              optionValue="id"
              filter
              placeholder="Seleccione una persona"
            />
          </div>
          <div className="field col-12">
            <label htmlFor="fechaIngreso">Fecha de Ingreso</label>
            <Calendar
              id="fechaIngreso"
              value={fechaIngreso}
              onChange={(e) => setFechaIngreso(e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
        </div>
        {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </Dialog>
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmCreate}
        header="Confirmar Asignación de Gerente"
        loading={saving}
      >
        <h6>Resumen:</h6>
        <ul>
          <li>
            <strong>Persona:</strong> {personaSeleccionada ? `${personaSeleccionada.nombre} ${personaSeleccionada.apellido}` : ''}
          </li>
          <li>
            <strong>Fecha de ingreso:</strong> {formatDate(fechaIngreso)}
          </li>
          {gerenteActual && (
            <li>
              <strong>Efecto:</strong> se cerrará la gerencia actual de {gerenteActual.persona_nombre}.
            </li>
          )}
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default NewGerenteModal;