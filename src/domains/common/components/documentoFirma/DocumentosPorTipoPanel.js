// src/domains/common/components/documentoFirma/DocumentosPorTipoPanel.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';
import {
  fetchDocumentosPorTipoDocumento,
  fetchUltimaVersionDocumento,
  limpiarPorTipoDocumento,
} from '../../../../features/documentoFirma/documentoFirmaSlice';

const estadoSeverity = (estado) => {
  switch (estado) {
    case 'BORRADOR': return 'secondary';
    case 'EN_FIRMAS': return 'info';
    case 'FIRMADO': return 'success';
    case 'RECHAZADO': return 'danger';
    default: return 'secondary';
  }
};

const objetoTemplate = (rowData) =>
  rowData.objeto_descripcion ? `${rowData.objeto_tipo}: ${rowData.objeto_descripcion}` : 'Sin objeto asociado';

// Filtro y consulta de "versión vigente" por tipo de documento, transversal
// a cualquier proyecto/convocatoria (usa por-tipo-documento/ y
// ultima-version/, endpoints IsAuthenticated que hasta ahora no tenían
// ningún consumidor en el frontend). Útil para auditoría: "¿cuál es la
// última versión del Presupuesto que se ha subido en todo el sistema, y
// qué otras versiones existen?".
const DocumentosPorTipoPanel = () => {
  const dispatch = useDispatch();
  const { tiposDocumento, loading: cargandoMetadata } = useSelector((state) => state.metadata);
  const { porTipoDocumento, loadingPorTipo, ultimaVersion, loadingUltimaVersion, error } = useSelector(
    (state) => state.documentoFirma
  );
  const [tipoDocumentoId, setTipoDocumentoId] = useState(null);

  useEffect(() => {
    if (!tiposDocumento?.length) dispatch(fetchMetadata());
  }, [dispatch, tiposDocumento]);

  useEffect(() => {
    if (tipoDocumentoId) {
      dispatch(fetchDocumentosPorTipoDocumento(tipoDocumentoId));
      dispatch(fetchUltimaVersionDocumento(tipoDocumentoId));
    } else {
      dispatch(limpiarPorTipoDocumento());
    }
  }, [dispatch, tipoDocumentoId]);

  return (
    <div>
      <div className="field mb-3" style={{ maxWidth: '25rem' }}>
        <label htmlFor="tipoDocumentoFiltro" className="d-block mb-1">
          Tipo de Documento
        </label>
        <Dropdown
          inputId="tipoDocumentoFiltro"
          value={tipoDocumentoId}
          options={tiposDocumento}
          onChange={(e) => setTipoDocumentoId(e.value)}
          optionLabel="nombre_documento"
          optionValue="id"
          filter
          showClear
          placeholder="Seleccione un tipo de documento"
          disabled={cargandoMetadata}
          className="w-100"
        />
      </div>

      {error && <Message severity="error" className="mb-3 w-full" text={error} />}

      {!tipoDocumentoId ? (
        <span className="text-muted small">Seleccione un tipo de documento para ver sus versiones.</span>
      ) : (
        <>
          <div className="mb-3">
            {loadingUltimaVersion ? (
              <span className="text-muted small">Consultando versión vigente...</span>
            ) : ultimaVersion ? (
              <div className="d-flex align-items-center gap-2">
                <strong>Versión vigente:</strong>
                <span>v{ultimaVersion.version}</span>
                <Tag value={ultimaVersion.estado} severity={estadoSeverity(ultimaVersion.estado)} />
                <span className="text-muted small">{objetoTemplate(ultimaVersion)}</span>
              </div>
            ) : (
              <span className="text-muted small">No hay documentos registrados de este tipo.</span>
            )}
          </div>

          <DataTable
            value={porTipoDocumento}
            loading={loadingPorTipo}
            paginator
            rows={10}
            emptyMessage="No hay versiones registradas para este tipo de documento."
            responsiveLayout="scroll"
            header="Historial de versiones"
          >
            <Column field="version" header="Versión" sortable style={{ width: '7rem' }} />
            <Column header="Objeto relacionado" body={objetoTemplate} />
            <Column header="Estado" body={(r) => <Tag value={r.estado} severity={estadoSeverity(r.estado)} />} sortable field="estado" />
            <Column field="ruta_documento" header="Archivo" body={(r) => r.ruta_documento?.split(/[\\/]/).pop() || '—'} />
          </DataTable>
        </>
      )}
    </div>
  );
};

export default DocumentosPorTipoPanel;