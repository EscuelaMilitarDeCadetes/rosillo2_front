// src/domains/common/components/documentoFirma/AsignarFirmantesModal.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';
import { asignarVariosFirmantes, limpiarErrorDocumentoFirmante } from '../../../../features/documentoFirmante/documentoFirmanteSlice';

const nombreUsuario = (u) => u.persona_actual_nombre || u.username;

// Asignación masiva y ordenada de firmantes (documento-firmante/asignar-varios/).
// El orden en que el usuario los va agregando a la lista ES el orden de
// turno de firma que enviará al backend.
const AsignarFirmantesModal = ({ visible, onHide, documentoFirmaId }) => {
  const dispatch = useDispatch();
  const { usuarios, loading: cargandoMetadata } = useSelector((state) => state.metadata);
  const { asignando, asignarError } = useSelector((state) => state.documentoFirmante);

  const [seleccionActual, setSeleccionActual] = useState(null);
  const [ordenFirmantes, setOrdenFirmantes] = useState([]); // [{id, nombre}]

  useEffect(() => {
    if (visible && !usuarios?.length) dispatch(fetchMetadata());
  }, [visible, dispatch, usuarios]);

  useEffect(() => {
    if (visible) {
      dispatch(limpiarErrorDocumentoFirmante());
      setSeleccionActual(null);
      setOrdenFirmantes([]);
    }
  }, [visible, dispatch]);

  const agregarASecuencia = () => {
    if (!seleccionActual) return;
    if (ordenFirmantes.some((f) => f.id === seleccionActual)) return; // ya está
    const usuario = usuarios.find((u) => u.id === seleccionActual);
    setOrdenFirmantes((prev) => [...prev, { id: seleccionActual, nombre: nombreUsuario(usuario) }]);
    setSeleccionActual(null);
  };

  const quitarDeSecuencia = (id) => {
    setOrdenFirmantes((prev) => prev.filter((f) => f.id !== id));
  };

  const moverPosicion = (index, direccion) => {
    setOrdenFirmantes((prev) => {
      const copia = [...prev];
      const nuevoIndex = index + direccion;
      if (nuevoIndex < 0 || nuevoIndex >= copia.length) return prev;
      [copia[index], copia[nuevoIndex]] = [copia[nuevoIndex], copia[index]];
      return copia;
    });
  };

  const handleSubmit = () => {
    if (!ordenFirmantes.length) return;
    dispatch(
      asignarVariosFirmantes({
        documentoFirmaId,
        usuariosIds: ordenFirmantes.map((f) => f.id),
      })
    ).then((result) => {
      if (asignarVariosFirmantes.fulfilled.match(result)) onHide();
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
      <Button label="Asignar Firmantes" icon="pi pi-check" loading={asignando} disabled={!ordenFirmantes.length} onClick={handleSubmit} />
    </div>
  );

  return (
    <Dialog header="Asignar Firmantes (orden de turno)" visible={visible} style={{ width: '32rem' }} footer={footer} onHide={onHide}>
      {asignarError && <Message severity="error" className="mb-3 w-full" text={asignarError} />}
      <div className="d-flex gap-2 mb-3">
        <Dropdown
          value={seleccionActual}
          options={usuarios.filter((u) => !ordenFirmantes.some((f) => f.id === u.id))}
          onChange={(e) => setSeleccionActual(e.value)}
          optionLabel={nombreUsuario}
          optionValue="id"
          filter
          placeholder="Seleccione un usuario"
          disabled={cargandoMetadata}
          className="flex-grow-1"
        />
        <Button icon="pi pi-plus" onClick={agregarASecuencia} disabled={!seleccionActual} />
      </div>
      {ordenFirmantes.length === 0 ? (
        <span className="text-muted small">Agregue al menos un firmante. El orden de la lista será el orden de turno.</span>
      ) : (
        <ol className="ps-3">
          {ordenFirmantes.map((f, index) => (
            <li key={f.id} className="d-flex align-items-center justify-content-between mb-2">
              <span>{f.nombre}</span>
              <div className="d-flex gap-1">
                <Button icon="pi pi-arrow-up" className="p-button-text p-button-sm" disabled={index === 0} onClick={() => moverPosicion(index, -1)} />
                <Button icon="pi pi-arrow-down" className="p-button-text p-button-sm" disabled={index === ordenFirmantes.length - 1} onClick={() => moverPosicion(index, 1)} />
                <Button icon="pi pi-trash" className="p-button-text p-button-danger p-button-sm" onClick={() => quitarDeSecuencia(f.id)} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Dialog>
  );
};

export default AsignarFirmantesModal;