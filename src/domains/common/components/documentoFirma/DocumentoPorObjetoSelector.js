// src/domains/common/components/documentoFirma/DocumentoPorObjetoSelector.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import {
  fetchDocumentosPorObjeto,
  limpiarPorObjetoDocumento,
} from '../../../../features/documentoFirma/documentoFirmaSlice';

const ESTADO_LABEL = {
  BORRADOR: 'Borrador',
  EN_FIRMAS: 'En firmas',
  FIRMADO: 'Firmado',
  RECHAZADO: 'Rechazado',
};

const etiquetaDocumento = (d) =>
  d ? `${d.tipo_documento_nombre} v${d.version} — ${ESTADO_LABEL[d.estado] || d.estado}` : '';

/**
 * Dropdown reutilizable para elegir un DocumentoFirma ya existente y
 * vinculado a un objeto puntual del sistema.
 *
 * Props:
 *  - contentTypeAppLabel: string, 
 *  - contentTypeModel: string, 
 *  - objectId: id numérico del objeto dueño de los documentos,
 *  - value / onChange(documentoId),
 *  - soloFirmados: si true (default), solo muestra documentos en estado
 *    FIRMADO — un "documento soporte" normalmente debe estar finalizado,
 *    no en borrador ni en proceso de firmas.
 */
const DocumentoPorObjetoSelector = ({
  contentTypeAppLabel,
  contentTypeModel,
  objectId,
  value,
  onChange,
  soloFirmados = true,
  disabled = false,
  placeholder = 'Seleccione un documento',
}) => {
  const dispatch = useDispatch();
  const { porObjeto, loadingPorObjeto } = useSelector((state) => state.documentoFirma);

  useEffect(() => {
    if (objectId && contentTypeAppLabel && contentTypeModel) {
      dispatch(
        fetchDocumentosPorObjeto({ contentTypeAppLabel, contentTypeModel, objectId })
      );
    } else {
      dispatch(limpiarPorObjetoDocumento());
    }
  }, [dispatch, contentTypeAppLabel, contentTypeModel, objectId]);

  const opciones = (porObjeto || []).filter((d) => !soloFirmados || d.estado === 'FIRMADO');

  return (
    <Dropdown
      value={value}
      options={opciones}
      onChange={(e) => onChange(e.value)}
      optionLabel={etiquetaDocumento}
      optionValue="id"
      filter
      showClear
      loading={loadingPorObjeto}
      disabled={disabled || !objectId}
      placeholder={!objectId ? 'Seleccione primero el objeto relacionado' : placeholder}
      emptyMessage={
        soloFirmados
          ? 'No hay documentos firmados vinculados a este objeto.'
          : 'No hay documentos vinculados a este objeto.'
      }
      className="w-100"
    />
  );
};

export default DocumentoPorObjetoSelector;