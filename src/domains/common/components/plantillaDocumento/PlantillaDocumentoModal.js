// src/domains/common/components/plantillaDocumento/PlantillaDocumentoModal.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { fetchTiposDocumento } from '../../../../features/metadata/metadataSlice';
import {
  crearPlantilla,
  actualizarPlantilla,
  limpiarErrorPlantillaDocumento,
} from '../../../../features/plantillaDocumento/plantillaDocumentoSlice';

// Crear o editar (CRUD -> create / update). ruta_documento es un CharField
// en el backend: se pide como texto (ruta o URL del archivo ya almacenado),
// no como un FileUpload, para ser fieles a lo que el servicio realmente
// acepta (PlantillaDocumentoService.crear/actualizar no procesan multipart).
const PlantillaDocumentoModal = ({ visible, onHide, plantilla }) => {
  const dispatch = useDispatch();
  const { tiposDocumento, loading: cargandoMetadata } = useSelector((state) => state.metadata);
  const { guardando, guardarError } = useSelector((state) => state.plantillaDocumento);

  const esEdicion = !!plantilla;
  const [tipoDocumentoId, setTipoDocumentoId] = useState(null);
  const [rutaDocumento, setRutaDocumento] = useState('');
  const [validationError, setValidationError] = useState('');

  // Se recargan SIEMPRE al abrir: el backend devuelve sólo los tipos de
  // documento del módulo con el que se inició sesión (formal/formativa), y
  // la lista guardada en Redux puede venir de una sesión anterior del otro módulo.
  useEffect(() => {
    if (visible) dispatch(fetchTiposDocumento());
  }, [visible, dispatch]);

  useEffect(() => {
    if (visible) {
      dispatch(limpiarErrorPlantillaDocumento());
      setTipoDocumentoId(plantilla?.tipo_documento ?? null);
      setRutaDocumento(plantilla?.ruta_documento ?? '');
      setValidationError('');
    }
  }, [visible, plantilla, dispatch]);

  const handleSubmit = () => {
    if ((!esEdicion && !tipoDocumentoId) || !rutaDocumento.trim()) {
      setValidationError('Debe indicar el tipo de documento y la ruta del archivo de la plantilla.');
      return;
    }
    setValidationError('');
    const accion = esEdicion
      ? actualizarPlantilla({ plantillaId: plantilla.id, rutaDocumento: rutaDocumento.trim() })
      : crearPlantilla({ tipoDocumentoId, rutaDocumento: rutaDocumento.trim() });
    dispatch(accion).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') onHide();
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
      <Button label="Guardar" icon="pi pi-check" loading={guardando} onClick={handleSubmit} />
    </div>
  );

  return (
    <Dialog
      header={esEdicion ? 'Editar Plantilla de Documento' : 'Nueva Plantilla de Documento'}
      visible={visible}
      style={{ width: '28rem' }}
      footer={footer}
      onHide={onHide}
    >
      {(validationError || guardarError) && (
        <Message severity="error" className="mb-3 w-full" text={validationError || guardarError} />
      )}
      <div className="field mb-3">
        <label htmlFor="tipoDocumentoPlantilla">Tipo de Documento</label>
        <Dropdown
          inputId="tipoDocumentoPlantilla"
          value={tipoDocumentoId}
          options={tiposDocumento}
          onChange={(e) => setTipoDocumentoId(e.value)}
          optionLabel="nombre_documento"
          optionValue="id"
          filter
          placeholder="Seleccione un tipo"
          disabled={cargandoMetadata || esEdicion}
          className="w-100"
        />
        {esEdicion && (
          <small className="text-muted">
            El tipo de documento no se puede cambiar (una plantilla es única por tipo).
          </small>
        )}
      </div>
      <div className="field mb-0">
        <label htmlFor="rutaDocumentoPlantilla">Ruta / URL del Archivo</label>
        <InputText
          id="rutaDocumentoPlantilla"
          value={rutaDocumento}
          onChange={(e) => setRutaDocumento(e.target.value)}
          className="w-100"
          placeholder="Ej: plantillas/informe_tecnico_v2.docx"
        />
      </div>
    </Dialog>
  );
};

export default PlantillaDocumentoModal;