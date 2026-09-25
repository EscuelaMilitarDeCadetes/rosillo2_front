// src/domains/formal/components/proyectos/AddDocumentProjectModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Checkbox } from 'primereact/checkbox';
import {
  addDocumentoProyecto,
  fetchTiposDocumentoProyecto,
} from '../../../../features/proyectos/documentosSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

// AGREGAR arriba del componente (espera exactamente el set del backend
// en DocumentoFirmaViewSet — mismo criterio, sin exponerlo por API porque
// el catálogo de nombres es fijo, tal como se acordó).
const NOMBRES_TIPO_DOCUMENTO_CARGA_FACULTAD_GRUPO = new Set([
  'Control de cambios',
  'Control de cambios - tiempo',
  'Control de cambios - investigador',
  'Control de cambios - costo',
  'Control de cambios - producto',
  'Entregables',
  'Informe técnico',
  'Informe de supervisión',
  'Concepto técnico',
  'Informe final',
]);


const AddDocumentProjectModal = ({ visible, onHide, proyectoId, catalogoFacultadGrupo = false }) => {
  const dispatch = useDispatch();
  const { tiposDocumentoProyecto, loadingDocumentos, errorDocumentos } = useSelector(
    (state) => state.documentos
  );
  const [selectedTipoDoc, setSelectedTipoDoc] = useState(null);
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  // Reemplaza la antigua segregación automática por año de inicio del
  // proyecto: ahora es el propio usuario (FACULTAD/GRUPO/CINTERNO/CEXTERNO)
  // quien confirma si el PDF que sube ya viene firmado físicamente/fuera de
  // la plataforma, o si debe pasar por el circuito de firmas dentro de ella.
  const [yaFirmado, setYaFirmado] = useState(false);

  // Cuando el usuario solo puede cargar el los documentos presentes en el catalogo (FACULTAD/GRUPO),
  // el catálogo se reduce a ese único tipo y se preselecciona automáticamente
  // para que no tenga que elegir nada del listado completo.
  const opcionesTipoDoc = catalogoFacultadGrupo
    ? (tiposDocumentoProyecto || []).filter(
        (t) => t.es_informe_seguimiento || NOMBRES_TIPO_DOCUMENTO_CARGA_FACULTAD_GRUPO.has(t.nombre_documento)
      )
    : tiposDocumentoProyecto;

  useEffect(() => {
    if (visible) {
      dispatch(fetchTiposDocumentoProyecto());
    } else {
      setSelectedTipoDoc(null);
      setFile(null);
      setValidationError('');
      setYaFirmado(false);
    }
  }, [visible, dispatch]);

  useEffect(() => {
    if (catalogoFacultadGrupo && opcionesTipoDoc.length === 1 && !selectedTipoDoc) {
      setSelectedTipoDoc(opcionesTipoDoc[0].id);
    }
  }, [catalogoFacultadGrupo, opcionesTipoDoc, selectedTipoDoc]);

  const validateForm = () => {
    if (!selectedTipoDoc || !file) {
      setValidationError('Debe seleccionar un tipo de documento y un archivo.');
      return false;
    }
    if (file.type !== 'application/pdf') {
      setValidationError('Solo se aceptan archivos en formato PDF.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleShowConfirmation = () => {
    if (validateForm()) {
      setIsConfirmVisible(true);
    }
  };

  const handleConfirmAdd = () => {
    dispatch(
      addDocumentoProyecto({
        proyectoId,
        data: {
          tipo_documento: selectedTipoDoc,
          documento_file: file,
          // 'FIRMADO': el documento ya viene firmado fuera de la plataforma
          // (repositorio histórico o entrega física). 'undefined' deja que
          // el backend use su default 'BORRADOR' y el documento entra al
          // circuito de firmas dentro de la plataforma.
          estado: yaFirmado ? 'FIRMADO' : undefined,
        },
      })
    ).then((result) => {
      if (addDocumentoProyecto.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <>
      <Dialog header="Agregar Documento al Proyecto" visible={visible} style={{ width: '40vw' }} footer={renderFooter} onHide={onHide}>
        <div className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="tipo_documento">Tipo de Documento</label>
            <Dropdown
              inputId="tipo_documento"
              value={selectedTipoDoc}
              options={opcionesTipoDoc}
              onChange={(e) => setSelectedTipoDoc(e.value)}
              optionLabel="nombre_documento"
              optionValue="id"
              filter
              placeholder="Seleccione un tipo"
            />
            {catalogoFacultadGrupo && (
              <small className="p-text-secondary">
                Con su rol solo puede cargar estos tipos de documento de gestión del proyecto.
              </small>
            )}
          </div>
          <div className="field mb-3">
            <label>Archivo (solo PDF, máx. 15MB)</label>
            <FileUpload
              name="doc"
              customUpload
              uploadHandler={(e) => setFile(e.files[0])}
              chooseLabel="Seleccionar"
              mode="basic"
              auto
              accept=".pdf"
              maxFileSize={15000000}
            />
            {file && <small className="p-text-secondary ms-2">{file.name}</small>}
          </div>
          <div className="field-checkbox mb-3">
            <Checkbox
              inputId="yaFirmado"
              checked={yaFirmado}
              onChange={(e) => setYaFirmado(e.checked)}
            />
            <label htmlFor="yaFirmado" className="ml-2">
              Este documento ya viene firmado (no requiere firmas por la plataforma)
            </label>
          </div>
          {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
          {errorDocumentos && <div className="alert alert-danger mt-3">{errorDocumentos}</div>}
        </div>
      </Dialog>
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmAdd}
        header="Confirmar Adición de Documento"
        loading={loadingDocumentos}
      >
        <h6>Resumen del documento a agregar:</h6>
        <ul>
          <li><strong>Tipo:</strong> {opcionesTipoDoc.find((td) => td.id === selectedTipoDoc)?.nombre_documento || 'N/A'}</li>
          <li><strong>Archivo:</strong> {file?.name || 'N/A'}</li>
          <li><strong>¿Ya firmado?:</strong> {yaFirmado ? 'Sí' : 'No, requiere firmas en la plataforma'}</li>
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default AddDocumentProjectModal;