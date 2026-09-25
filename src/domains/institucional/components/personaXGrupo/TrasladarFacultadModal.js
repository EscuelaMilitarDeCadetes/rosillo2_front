// src/domains/institucional/components/personaXGrupo/TrasladarFacultadModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { trasladarFacultad } from '../../../../features/personaXGrupo/personaXGrupoSlice';


const TrasladarFacultadModal = ({ visible, onHide, vinculo, onSuccess }) => {
  const dispatch = useDispatch();
  const { facultades } = useSelector((state) => state.metadata);
  const { saving, error } = useSelector((state) => state.personaXGrupo);
  const [nuevaFacultadId, setNuevaFacultadId] = useState(null);

  useEffect(() => {
    if (!visible) setNuevaFacultadId(null);
  }, [visible]);

  const handleTrasladar = () => {
    if (!nuevaFacultadId) return;
    dispatch(trasladarFacultad({ id: vinculo.id, nueva_facultad_id: nuevaFacultadId })).then((result) => {
      if (trasladarFacultad.fulfilled.match(result)) {
        onSuccess?.(result.payload);
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Trasladar" icon="pi pi-arrow-right-arrow-left" onClick={handleTrasladar} loading={saving} disabled={!nuevaFacultadId} />
    </div>
  );

  return (
    <Dialog header="Trasladar a otra Facultad" visible={visible} style={{ width: '35vw' }} footer={footer} onHide={onHide}>
      {vinculo && (
        <>
          <p>
            <strong>{vinculo.persona_nombre}</strong> — facultad actual: <strong>{vinculo.facultad_nombre}</strong>
          </p>
          <div className="field">
            <label htmlFor="nuevaFacultad">Nueva facultad</label>
            <Dropdown
              inputId="nuevaFacultad"
              value={nuevaFacultadId}
              options={facultades}
              onChange={(e) => setNuevaFacultadId(e.value)}
              optionLabel="nombre_facultad"
              optionValue="id"
              filter
              className="w-full"
              placeholder="Seleccione la facultad destino"
            />
          </div>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </>
      )}
    </Dialog>
  );
};

export default TrasladarFacultadModal;