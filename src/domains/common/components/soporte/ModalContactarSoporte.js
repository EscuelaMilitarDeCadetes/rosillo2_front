// src/domains/common/components/soporte/ModalContactarSoporte.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { enviarSolicitudSoporte, limpiarEstadoSoporte } from '../../../../features/soporte/soporteSlice';

const ModalContactarSoporte = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { enviando, error, enviadoConExito } = useSelector((state) => state.soporte);
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (enviadoConExito) {
      setAsunto('');
      setMensaje('');
      const timeout = setTimeout(() => {
        dispatch(limpiarEstadoSoporte());
        onHide();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [enviadoConExito, dispatch, onHide]);

  const handleClose = () => {
    dispatch(limpiarEstadoSoporte());
    onHide();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(enviarSolicitudSoporte({ asunto, mensaje }));
  };

  return (
    <Dialog
      header="Comunicarse con soporte"
      visible={visible}
      style={{ width: '450px' }}
      onHide={handleClose}
    >
      <form onSubmit={handleSubmit}>
        {error && <Message severity="error" text={error} className="mb-3 w-100" />}
        {enviadoConExito && (
          <Message severity="success" text="Solicitud enviada correctamente." className="mb-3 w-100" />
        )}
        <div className="mb-3">
          <label htmlFor="asunto" className="form-label">Asunto:</label>
          <InputText
            id="asunto"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            className="w-100"
            required
            autoFocus
          />
        </div>
        <div className="mb-3">
          <label htmlFor="mensaje" className="form-label">Mensaje:</label>
          <InputTextarea
            id="mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={4}
            className="w-100"
            required
          />
        </div>
        <Button
          type="submit"
          label="Enviar"
          className="p-button-success"
          loading={enviando}
        />
      </form>
    </Dialog>
  );
};

export default ModalContactarSoporte;