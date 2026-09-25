// src/domains/institucional/components/personaXGrupo/TrasladarGrupoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { trasladarGrupo } from '../../../../features/personaXGrupo/personaXGrupoSlice';


const TrasladarGrupoModal = ({ visible, onHide, vinculo, onSuccess }) => {
  const dispatch = useDispatch();
  const { grupos } = useSelector((state) => state.metadata);
  const { saving, error } = useSelector((state) => state.personaXGrupo);
  const [nuevoGrupoId, setNuevoGrupoId] = useState(null);

  useEffect(() => {
    if (!visible) setNuevoGrupoId(null);
  }, [visible]);

  const handleTrasladar = () => {
    if (!nuevoGrupoId) return;
    dispatch(trasladarGrupo({ id: vinculo.id, nuevo_grupo_id: nuevoGrupoId })).then((result) => {
      if (trasladarGrupo.fulfilled.match(result)) {
        onSuccess?.(result.payload);
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Trasladar" icon="pi pi-arrow-right-arrow-left" onClick={handleTrasladar} loading={saving} disabled={!nuevoGrupoId} />
    </div>
  );

  return (
    <Dialog header="Trasladar a otro Grupo" visible={visible} style={{ width: '35vw' }} footer={footer} onHide={onHide}>
      {vinculo && (
        <>
          <p>
            <strong>{vinculo.persona_nombre}</strong> — grupo actual: <strong>{vinculo.grupo_nombre}</strong>
          </p>
          <div className="field">
            <label htmlFor="nuevoGrupo">Nuevo grupo</label>
            <Dropdown
              inputId="nuevoGrupo"
              value={nuevoGrupoId}
              options={grupos}
              onChange={(e) => setNuevoGrupoId(e.value)}
              optionLabel="nombre_grupo"
              optionValue="id"
              filter
              className="w-full"
              placeholder="Seleccione el grupo destino"
            />
          </div>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </>
      )}
    </Dialog>
  );
};

export default TrasladarGrupoModal;