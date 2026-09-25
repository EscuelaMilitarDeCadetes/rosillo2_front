// src/domains/formal/components/convocatorias/CargarDocumentoCorregidoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { subirDocumentoCorregidoProyecto } from '../../../../features/convocatorias/convocatoriasSlice';


const CargarDocumentoCorregidoModal = ({ visible, onHide, proyectoId }) => {
  const dispatch = useDispatch();
  const { tiposDocumento } = useSelector((state) => state.metadata);
  const { proyectosUsuarioLoading, proyectosUsuarioError } = useSelector((state) => state.convocatorias);
  const [tipoDocumentoId, setTipoDocumentoId] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!visible) {
      setTipoDocumentoId(null);
      setArchivo(null);
      setValidationError('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!tipoDocumentoId || !archivo) {
      setValidationError('Debe seleccionar el tipo de documento y el archivo.');
      return;
    }
    dispatch(subirDocumentoCorregidoProyecto({ proyectoId, tipoDocumentoId, archivo })).then((result) => {
      if (subirDocumentoCorregidoProyecto.fulfilled.match(result)) onHide();
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" onClick={handleSubmit} loading={proyectosUsuarioLoading} />
    </div>
  );

  return (
    <Dialog header="Cargue Corrección de Propuesta del proyecto" visible={visible} style={{ width: '35vw' }} footer={footer} onHide={onHide}>
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="tipoDocumento">Tipo de Documento</label>
          <Dropdown
            inputId="tipoDocumento"
            value={tipoDocumentoId}
            options={tiposDocumento}
            onChange={(e) => setTipoDocumentoId(e.value)}
            optionLabel="nombre_documento"
            optionValue="id"
            placeholder="Seleccione un tipo"
          />
        </div>
        <div className="field mb-3">
          <label>Documento corregido a cargar</label>
          <FileUpload
            name="fileDoc"
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
        {proyectosUsuarioError && <div className="alert alert-danger mt-3">{proyectosUsuarioError}</div>}
      </div>
    </Dialog>
  );
};

export default CargarDocumentoCorregidoModal;