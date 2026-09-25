// src/domains/usuarios/components/usuarios/RetirarUsuarioModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { retirarUsuario } from '../../../../features/usuarios/usuarioLifecycleSlice';


const RetirarUsuarioModal = ({ visible, onHide, usuarioObjetivo }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.usuarioLifecycle);
  const [fechaRetiro, setFechaRetiro] = useState(null);

  useEffect(() => {
    if (!visible) setFechaRetiro(null);
  }, [visible]);

  const formatDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleRetirar = () => {
    dispatch(
      retirarUsuario({
        usuario_id: usuarioObjetivo.usuario_id,
        fecha_retiro: formatDate(fechaRetiro),
      })
    ).then((result) => {
      if (retirarUsuario.fulfilled.match(result)) onHide();
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Retirar" icon="pi pi-user-minus" className="p-button-danger" onClick={handleRetirar} loading={loading} />
    </div>
  );

  return (
    <Dialog header="Retirar Usuario" visible={visible} style={{ width: '35vw' }} footer={footer} onHide={onHide}>
      {usuarioObjetivo && (
        <>
          <div className="alert alert-warning">
            Se retirará a <strong>{usuarioObjetivo.persona_nombre} {usuarioObjetivo.persona_apellido}</strong>{' '}
            (cuenta <strong>{usuarioObjetivo.usuario_nombre}</strong>). Esto desactiva la cuenta, cierra su
            vinculación a Persona y todas sus vinculaciones activas a grupo/facultad. La Persona permanece como
            registro histórico y nada se elimina — puede reactivarse más adelante desde el histórico
            correspondiente.
          </div>
          <div className="field">
            <label htmlFor="fechaRetiro">Fecha de retiro (opcional — por defecto, hoy)</label>
            <Calendar id="fechaRetiro" value={fechaRetiro} onChange={(e) => setFechaRetiro(e.value)} dateFormat="yy-mm-dd" showIcon showButtonBar className="w-full" />
          </div>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </>
      )}
    </Dialog>
  );
};

export default RetirarUsuarioModal;