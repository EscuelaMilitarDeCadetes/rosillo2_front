// src/domains/common/components/aprobacion/SolicitarAprobacionModal.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';
import { crearAprobacion, fetchAprobaciones, limpiarErrorAprobacion } from '../../../../features/aprobacion/aprobacionSlice';

const nombreUsuario = (u) => u.persona_actual_nombre || u.username;

// Formulario de creación (CRUD -> create). Reutiliza el catálogo de tipos de
// documento y el listado de usuarios ya cargados en metadataSlice (los mismos
// datos maestros que usan los demás formularios de la plataforma), evitando
// una llamada adicional al backend cuando ya están en memoria.
const SolicitarAprobacionModal = ({ visible, onHide, tipoDocumentoIdFijo, idDocumentoFijo }) => {
  const dispatch = useDispatch();
  const { tiposDocumento, usuarios, loading: cargandoMetadata } = useSelector((state) => state.metadata);
  const { creando, crearError } = useSelector((state) => state.aprobacion);

  const [tipoDocumentoId, setTipoDocumentoId] = useState(tipoDocumentoIdFijo ?? null);
  const [idDocumento, setIdDocumento] = useState(idDocumentoFijo ?? null);
  const [usuarioRevisorId, setUsuarioRevisorId] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible && (!tiposDocumento?.length || !usuarios?.length)) {
      dispatch(fetchMetadata());
    }
  }, [visible, dispatch, tiposDocumento, usuarios]);

  useEffect(() => {
    if (visible) {
      dispatch(limpiarErrorAprobacion());
      setTipoDocumentoId(tipoDocumentoIdFijo ?? null);
      setIdDocumento(idDocumentoFijo ?? null);
      setUsuarioRevisorId(null);
      setObservacion('');
      setValidationError('');
    }
  }, [visible, tipoDocumentoIdFijo, idDocumentoFijo, dispatch]);

  const handleSubmit = () => {
    if (!tipoDocumentoId || !idDocumento || !usuarioRevisorId) {
      setValidationError('Debe indicar el tipo de documento, el id del documento y el usuario revisor.');
      return;
    }
    setValidationError('');
    dispatch(
      crearAprobacion({
        usuarioRevisorId,
        tipoDocumentoId,
        idDocumento,
        observacion: observacion.trim() || undefined,
      })
    ).then((result) => {
      if (crearAprobacion.fulfilled.match(result)) {
        dispatch(fetchAprobaciones({ page: 1 }));
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
      <Button label="Solicitar" icon="pi pi-check" loading={creando} onClick={handleSubmit} />
    </div>
  );

  return (
    <Dialog header="Solicitar Aprobación" visible={visible} style={{ width: '30rem' }} footer={footer} onHide={onHide}>
      <div className="p-fluid">
        {(validationError || crearError) && (
          <Message severity="error" className="mb-3 w-full" text={validationError || crearError} />
        )}
        <div className="field mb-3">
          <label htmlFor="tipoDocumento">Tipo de Documento</label>
          <Dropdown
            inputId="tipoDocumento"
            value={tipoDocumentoId}
            options={tiposDocumento}
            onChange={(e) => setTipoDocumentoId(e.value)}
            optionLabel="nombre_documento"
            optionValue="id"
            filter
            placeholder="Seleccione un tipo"
            disabled={!!tipoDocumentoIdFijo || cargandoMetadata}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="idDocumento">ID del Documento</label>
          <InputNumber
            inputId="idDocumento"
            value={idDocumento}
            onValueChange={(e) => setIdDocumento(e.value)}
            useGrouping={false}
            disabled={!!idDocumentoFijo}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="usuarioRevisor">Usuario Revisor</label>
          <Dropdown
            inputId="usuarioRevisor"
            value={usuarioRevisorId}
            options={usuarios}
            onChange={(e) => setUsuarioRevisorId(e.value)}
            optionLabel={nombreUsuario}
            optionValue="id"
            filter
            placeholder="Seleccione un revisor"
            disabled={cargandoMetadata}
          />
        </div>
        <div className="field mb-0">
          <label htmlFor="observacion">Observación (opcional)</label>
          <InputTextarea
            inputId="observacion"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default SolicitarAprobacionModal;