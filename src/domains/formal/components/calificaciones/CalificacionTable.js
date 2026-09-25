// src/domains/formal/components/calificaciones/CalificacionTable.js
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { descargarDocumentoParticipacion } from '../../../../features/calificaciones/calificacionSlice';
import useCalificacionData from './calificacionTable/useCalificacionData';
import CalificacionFiltros from './calificacionTable/CalificacionFiltros';
import DocumentosParticipacionModal from './calificacionTable/DocumentosParticipacionModal';
import MontoAprobadoCell from './calificacionTable/cells/MontoAprobadoCell';
import FaseCalificadaCell from './calificacionTable/cells/FaseCalificadaCell';
import ResultadoCell from './calificacionTable/cells/ResultadoCell';
import CorreccionDocsCell from './calificacionTable/cells/CorreccionDocsCell';
import AccionesCalificacionCell from './calificacionTable/cells/AccionesCalificacionCell';

const CalificacionTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
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
  } = useCalificacionData();

  const irACalificar = (rowData) => navigate(`/calificar/${rowData.id}`);

  return (
    <>
      <Toast ref={toast} />
      <div className="p-3">
        <h5 className="mb-3">Calificación de Proyectos</h5>
        <CalificacionFiltros
          tabIndex={tabIndex}
          filtroTitulo={filtroTitulo} onFiltroTitulo={setFiltroTitulo}
          filtroConvocatoria={filtroConvocatoria} onFiltroConvocatoria={setFiltroConvocatoria}
          filtroResponsable={filtroResponsable} onFiltroResponsable={setFiltroResponsable}
          filtroFinanciado={filtroFinanciado} onFiltroFinanciado={setFiltroFinanciado}
          filtroFase={filtroFase} onFiltroFase={setFiltroFase} opcionesFase={opcionesFase}
          filtroResultado={filtroResultado} onFiltroResultado={setFiltroResultado}
        />
        <TabView activeIndex={tabIndex} onTabChange={(e) => setTabIndex(e.index)}>
          <TabPanel header="Pendientes por calificar">
            <DataTable
              value={pendientesFiltrados}
              loading={loadingPendientes}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 20, 50]}
              emptyMessage="No hay proyectos pendientes de calificación."
              responsiveLayout="scroll"
            >
              <Column field="proyecto_titulo" header="Título del Proyecto" sortable />
              <Column field="convocatoria_nombre" header="Convocatoria" sortable />
              <Column header="Monto Aprobado" body={(row) => <MontoAprobadoCell rowData={row} />} />
              <Column field="responsable" header="Responsable" sortable />
              <Column header="Última Fase Calificada" body={(row) => <FaseCalificadaCell rowData={row} />} />
              <Column header="Corrección Docs." body={(row) => <CorreccionDocsCell rowData={row} />} />
              <Column
                header="Acciones"
                body={(row) => (
                  <AccionesCalificacionCell
                    rowData={row}
                    variante="pendiente"
                    puedeCalificar={puedeCalificar}
                    puedeGestionarCorreccion={puedeGestionarCorreccion}
                    accionLoadingId={accionLoadingId}
                    onCalificar={irACalificar}
                    onToggleCorreccion={handleToggleCorreccion}
                    onVerDocumentos={handleVerDocumentos}
                  />
                )}
              />
            </DataTable>
          </TabPanel>
          <TabPanel header="Calificados">
            <DataTable
              value={calificadosFiltrados}
              loading={loadingCalificados}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 20, 50]}
              emptyMessage="No hay proyectos con calificación finalizada."
              responsiveLayout="scroll"
            >
              <Column field="proyecto_titulo" header="Título del Proyecto" sortable />
              <Column field="convocatoria_nombre" header="Convocatoria" sortable />
              <Column header="Monto Aprobado" body={(row) => <MontoAprobadoCell rowData={row} />} />
              <Column field="responsable" header="Responsable" sortable />
              <Column header="Resultado" body={(row) => <ResultadoCell rowData={row} />} />
              <Column
                header="Acciones"
                body={(row) => (
                  <AccionesCalificacionCell
                    rowData={row}
                    variante="calificado"
                    onCalificar={irACalificar}
                    onVerDocumentos={handleVerDocumentos}
                  />
                )}
              />
            </DataTable>
          </TabPanel>
        </TabView>
      </div>
      <DocumentosParticipacionModal
        visible={docModalVisible}
        tituloProyecto={docModalProyectoTitulo}
        documentos={documentosParticipacion}
        loading={loadingDocumentos}
        descargandoDocumentoId={descargandoDocumentoId}
        onHide={handleCerrarDocModal}
        onDescargar={(id) => dispatch(descargarDocumentoParticipacion(id))}
        puedeEnviarFirma={puedeGestionarCorreccion}
        enviandoFirmaId={enviandoFirmaId}
        onEnviarAFirma={handleEnviarAFirmaParticipacion}
      />
    </>
  );
};

export default CalificacionTable;