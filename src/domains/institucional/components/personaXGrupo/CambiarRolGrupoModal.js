// src/domains/institucional/components/personaXGrupo/CambiarRolGrupoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { cambiarRolGrupo } from '../../../../features/personaXGrupo/personaXGrupoSlice';


const CambiarRolGrupoModal = ({ visible, onHide, vinculo, onSuccess }) => {
  const dispatch = useDispatch();
  const { rolesGrupo } = useSelector((state) => state.metadata);
  const { saving, error } = useSelector((state) => state.personaXGrupo);
  const [nuevoRolGrupoId, setNuevoRolGrupoId] = useState(null);

  useEffect(() => {
    if (!visible) setNuevoRolGrupoId(null);
  }, [visible]);

  const handleCambiar = () => {
    if (!nuevoRolGrupoId) return;
    dispatch(cambiarRolGrupo({ id: vinculo.id, nuevo_rol_grupo_id: nuevoRolGrupoId })).then((result) => {
      if (cambiarRolGrupo.fulfilled.match(result)) {
        onSuccess?.(result.payload);
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Cambiar Rol" icon="pi pi-id-card" onClick={handleCambiar} loading={saving} disabled={!nuevoRolGrupoId} />
    </div>
  );

  return (
    <Dialog header="Cambiar Rol dentro del Grupo/Facultad" visible={visible} style={{ width: '35vw' }} footer={footer} onHide={onHide}>
      {vinculo && (
        <>
          <p>
            <strong>{vinculo.persona_nombre}</strong> — rol actual: <strong>{vinculo.rol_grupo_nombre}</strong>
          </p>
          <div className="field">
            <label htmlFor="nuevoRolGrupo">Nuevo rol</label>
            <Dropdown
              inputId="nuevoRolGrupo"
              value={nuevoRolGrupoId}
              options={rolesGrupo}
              onChange={(e) => setNuevoRolGrupoId(e.value)}
              optionLabel="cargo"
              optionValue="id"
              filter
              className="w-full"
              placeholder="Seleccione el nuevo rol"
            />
          </div>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </>
      )}
    </Dialog>
  );
};

export default CambiarRolGrupoModal;