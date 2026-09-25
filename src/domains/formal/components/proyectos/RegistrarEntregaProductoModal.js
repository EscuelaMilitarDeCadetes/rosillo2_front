// src/domains/formal/components/proyectos/RegistrarEntregaProductoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import {
  registrarEntregaProducto,
} from '../../../../features/proyectos/productosSlice';

// Registra la entrega de un producto ya asignado al proyecto: sube el
// archivo PDF del entregable y lo marca como entregado.
const RegistrarEntregaProductoModal = ({ visible, onHide, proyectoId, producto }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.productos);
  const [archivo, setArchivo] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!visible) {
      setArchivo(null);
      setValidationError('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!archivo) {
      setValidationError('Debe adjuntar el archivo PDF del entregable.');
      return;
    }
    setValidationError('');
    dispatch(
      registrarEntregaProducto({
        productoXProyectoId: producto.id,
        proyectoId,
        archivo,
      })
    ).then((result) => {
      if (registrarEntregaProducto.fulfilled.match(result)) {
        onHide();
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Registrar Entrega" icon="pi pi-check" onClick={handleSubmit} loading={loading} autoFocus />
    </div>
  );

  return (
    <Dialog header="Registrar Entrega de Producto" visible={visible} style={{ width: '40vw' }} footer={renderFooter} onHide={onHide}>
      {producto && (
        <p className="text-muted">
          Producto: <strong>{producto.producto_nombre}</strong> ({producto.categoria})
        </p>
      )}
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="archivoEntregable">Archivo del Entregable (PDF)</label>
          <FileUpload
            id="archivoEntregable"
            customUpload
            uploadHandler={(e) => setArchivo(e.files[0])}
            chooseLabel="Seleccionar Archivo"
            mode="basic"
            auto
            accept="application/pdf"
            maxFileSize={15000000}
          />
          {archivo && <small className="p-text-secondary ms-2">{archivo.name}</small>}
        </div>
        {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </Dialog>
  );
};

export default RegistrarEntregaProductoModal;