// src/domains/usuarios/components/usuarioXPersona/ReasignarPersonaModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { reasignarPersona } from '../../../../features/usuarioXPersona/usuarioXPersonaSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';


const ReasignarPersonaModal = ({ visible, onHide, usuario }) => {
  const dispatch = useDispatch();
  const { personas } = useSelector((state) => state.metadata);
  const { saving, error } = useSelector((state) => state.usuarioXPersona);
  const [personaId, setPersonaId] = useState(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) setPersonaId(null);
  }, [visible]);

  const personaSeleccionada = personas?.find((p) => p.id === personaId);

  const handleShowConfirmation = () => {
    if (!personaId) return;
    setIsConfirmVisible(true);
  };

  const handleConfirmar = () => {
    dispatch(reasignarPersona({ usuario_id: usuario.usuario_id, persona_id: personaId })).then((result) => {
      if (reasignarPersona.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Reasignar" icon="pi pi-user-edit" onClick={handleShowConfirmation} disabled={!personaId} autoFocus />
    </div>
  );

  return (
    <>
      <Dialog header="Reasignar Persona" visible={visible} style={{ width: '40vw' }} footer={footer} onHide={onHide}>
        {usuario && (
          <Message
            severity="info"
            className="mb-3 w-full"
            text={`Cuenta: ${usuario.usuario_username}. Persona actual: ${usuario.persona_nombre}. Elige una persona ya existente en el sistema para reemplazarla (esto NO crea una persona nueva ni cambia el rol de plataforma).`}
          />
        )}
        <div className="field">
          <label htmlFor="persona">Nueva Persona</label>
          <Dropdown
            inputId="persona"
            value={personaId}
            options={personas}
            onChange={(e) => setPersonaId(e.value)}
            optionLabel={(p) => `${p.nombre} ${p.apellido} (${p.documento})`}
            optionValue="id"
            filter
            className="w-full"
            placeholder="Seleccione una persona"
          />
        </div>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </Dialog>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmar}
        header="Confirmar Reasignación"
        loading={saving}
      >
        Se cerrará la asignación activa de <strong>{usuario?.persona_nombre}</strong> a la cuenta{' '}
        <strong>{usuario?.usuario_username}</strong> y se abrirá una nueva con{' '}
        <strong>
          {personaSeleccionada?.nombre} {personaSeleccionada?.apellido}
        </strong>
        .
      </ConfirmationModal>
    </>
  );
};

export default ReasignarPersonaModal;