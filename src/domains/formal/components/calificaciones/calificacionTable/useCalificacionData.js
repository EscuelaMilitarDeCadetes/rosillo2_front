// src/domains/formal/components/calificaciones/calificacionTable/useCalificacionData.js
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProyectosSinCalificar,
  fetchProyectosCalificados,
  habilitarCorreccionDocumento,
  deshabilitarCorreccionDocumento,
  fetchDocumentosParticipacion,
  limpiarDocumentosParticipacion,
} from '../../../../../features/calificaciones/calificacionSlice';
import { habilitarDocumentoParaFirma } from '../../../../../features/documentoFirma/documentoFirmaSlice';

/**
 * Encapsula el estado de filtros, la carga de datos (Redux) y las acciones
 * sobre proyectos pendientes/calificados, independiente de cómo se
 * rendericen las tablas o los filtros.
 */
export default function useCalificacionData() {
  const dispatch = useDispatch();
  const toast = useRef(null);
  const { roles } = useSelector((state) => state.auth);
  const {
    pendientes, loadingPendientes, calificados, loadingCalificados,
    accionLoadingId, documentosParticipacion, loadingDocumentos, descargandoDocumentoId,
  } = useSelector((state) => state.calificaciones);

  const puedeGestionarCorreccion = roles?.includes('CINTERNO');
  const puedeCalificar = roles?.includes('CINTERNO');

  const [tabIndex, setTabIndex] = useState(0);
  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [filtroConvocatoria, setFiltroConvocatoria] = useState('');
  const [filtroResponsable, setFiltroResponsable] = useState('');
  const [filtroFinanciado, setFiltroFinanciado] = useState(null);
  const [filtroResultado, setFiltroResultado] = useState(null);
  const [filtroFase, setFiltroFase] = useState('');
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalProyectoTitulo, setDocModalProyectoTitulo] = useState('');
  const [docModalProyectoId, setDocModalProyectoId] = useState(null);
  const [enviandoFirmaId, setEnviandoFirmaId] = useState(null);

  useEffect(() => {
    dispatch(fetchProyectosSinCalificar());
  }, [dispatch]);

  useEffect(() => {
    if (tabIndex === 1) {
      dispatch(fetchProyectosCalificados(filtroResultado));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, tabIndex, filtroResultado]);

  const aplicarFiltrosTexto = (lista) =>
    lista.filter((item) => {
      const coincideTitulo = filtroTitulo
        ? item.proyecto_titulo?.toLowerCase().includes(filtroTitulo.toLowerCase())
        : true;
      const coincideConvocatoria = filtroConvocatoria
        ? item.convocatoria_nombre?.toLowerCase().includes(filtroConvocatoria.toLowerCase())
        : true;
      const coincideResponsable = filtroResponsable
        ? item.responsable?.toLowerCase().includes(filtroResponsable.toLowerCase())
        : true;
      const coincideFase = filtroFase ? item.ultimo_filtro_calificacion === filtroFase : true;
      const coincideFinanciado =
        filtroFinanciado === null
          ? true
          : filtroFinanciado
            ? item.monto_aprobado !== null
            : item.monto_aprobado === null;
      return coincideTitulo && coincideConvocatoria && coincideResponsable && coincideFase && coincideFinanciado;
    });

  const pendientesFiltrados = useMemo(
    () => aplicarFiltrosTexto(pendientes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendientes, filtroTitulo, filtroConvocatoria, filtroResponsable, filtroFinanciado, filtroFase]
  );
  const calificadosFiltrados = useMemo(
    () => aplicarFiltrosTexto(calificados),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calificados, filtroTitulo, filtroConvocatoria, filtroResponsable, filtroFinanciado, filtroFase]
  );

  const opcionesFase = useMemo(() => {
    const valores = new Set(
      [...pendientes, ...calificados].map((item) => item.ultimo_filtro_calificacion).filter(Boolean)
    );
    return [{ label: 'Todas', value: '' }, ...Array.from(valores).sort().map((v) => ({ label: v, value: v }))];
  }, [pendientes, calificados]);

  const handleVerDocumentos = (rowData) => {
    setDocModalProyectoTitulo(rowData.proyecto_titulo);
    setDocModalProyectoId(rowData.proyecto);
    setDocModalVisible(true);
    dispatch(fetchDocumentosParticipacion(rowData.proyecto));
  };

  const handleCerrarDocModal = () => {
    setDocModalVisible(false);
    dispatch(limpiarDocumentosParticipacion());
  };

  const handleToggleCorreccion = (rowData) => {
    const accion = rowData.modificacion_documento_proyecto
      ? deshabilitarCorreccionDocumento
      : habilitarCorreccionDocumento;
    dispatch(accion(rowData.id)).then((result) => {
      if (accion.rejected.match(result)) {
        toast.current?.show({
          severity: 'error',
          summary: 'No se pudo actualizar',
          detail: result.payload || 'Error al cambiar el estado de corrección.',
          life: 5000,
        });
      }
    });
  };

  const handleEnviarAFirmaParticipacion = (documentoId) => {
    setEnviandoFirmaId(documentoId);
    dispatch(habilitarDocumentoParaFirma(documentoId)).then((result) => {
      setEnviandoFirmaId(null);
      if (habilitarDocumentoParaFirma.fulfilled.match(result) && docModalProyectoId) {
        dispatch(fetchDocumentosParticipacion(docModalProyectoId));
      }
    });
  };

  return {
    toast,
    puedeGestionarCorreccion, puedeCalificar,
    tabIndex, setTabIndex,
    filtroTitulo, setFiltroTitulo,
    filtroConvocatoria, setFiltroConvocatoria,
    filtroResponsable, setFiltroResponsable,
    filtroFinanciado, setFiltroFinanciado,
    filtroResultado, setFiltroResultado,
    filtroFase, setFiltroFase,
    opcionesFase,
    pendientesFiltrados, loadingPendientes,
    calificadosFiltrados, loadingCalificados,
    accionLoadingId,
    docModalVisible, docModalProyectoTitulo,
    documentosParticipacion, loadingDocumentos, descargandoDocumentoId,
    handleVerDocumentos, handleCerrarDocModal, handleToggleCorreccion,
    enviandoFirmaId, handleEnviarAFirmaParticipacion,
  };
}