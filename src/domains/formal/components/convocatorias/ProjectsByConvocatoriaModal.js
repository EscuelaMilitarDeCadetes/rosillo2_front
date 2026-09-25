// src/domains/formal/components/convocatorias/ProjectsByConvocatoriaModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { fetchProjectsByConvocatoria } from '../../../../features/convocatorias/convocatoriasSlice';

const ProjectsByConvocatoriaModal = ({ visible, onHide, convocatoria }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectsInConvocatoria, projectsLoading, projectsError } = useSelector((state) => state.convocatorias);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    if (visible && convocatoria?.id) {
      dispatch(fetchProjectsByConvocatoria(convocatoria.id));
    }
  }, [visible, convocatoria, dispatch]);

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Proyectos en Convocatoria: {convocatoria?.nombre_convocatoria}</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const estadoBodyTemplate = (rowData) => (
    <Tag
      severity={rowData.estado_finalizado_calificacion ? 'success' : 'warning'}
      value={rowData.estado_finalizado_calificacion ? 'FINALIZADO' : 'EN PROCESO'}
    />
  );

  const montoAprobadoBodyTemplate = (rowData) => {
    if (!rowData.monto_aprobado) {
      return <span className="text-muted">sin aprobar</span>;
    }
    return Number(rowData.monto_aprobado).toLocaleString('es-CO', { minimumFractionDigits: 2 });
  };

  const responsableBodyTemplate = (rowData) => rowData.responsable || '—';

  const tituloBodyTemplate = (rowData) => {
    const {
      estado_finalizado_calificacion: finalizado,
      calificacion_ultimo_filtro_calificacion: resultado,
      modificacion_documento_proyecto: enCorreccion,
      proyecto,
      proyecto_titulo: titulo,
      id: vinculoId,
    } = rowData;

    if (finalizado && resultado === 'NO_APROBADO') {
      return <span>{titulo}</span>;
    }
    if (finalizado && resultado === 'APROBADO') {
      return (
        <span
          role="link"
          title="Click aquí para visualizar la información de este proyecto"
          style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          onClick={() => navigate(`/proyectos/${proyecto}`)}
        >
          {titulo}
        </span>
      );
    }
    if (!finalizado && !enCorreccion) {
      return (
        <span
          role="link"
          title="Click aquí para calificar este proyecto"
          style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          onClick={() => navigate(`/calificar/${vinculoId}`)}
        >
          {titulo}
        </span>
      );
    }
    // !finalizado && enCorreccion
    return (
      <span title="Espere a que se habilite nuevamente la calificación del proyecto">
        {titulo}
      </span>
    );
  };

  return (
    <Dialog header={header} visible={visible} style={{ width: '70vw' }} onHide={onHide} modal>
      {projectsLoading && (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />
        </div>
      )}
      {projectsError && <div className="alert alert-danger mt-3">Error: {projectsError}</div>}
      {!projectsLoading && !projectsError && (
        <DataTable
          value={projectsInConvocatoria}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          globalFilter={globalFilter}
          emptyMessage="No se encontraron proyectos vinculados a esta convocatoria."
          responsiveLayout="scroll"
        >
          <Column header="Proyecto" body={tituloBodyTemplate} sortable sortField="proyecto_titulo" />
          <Column header="Monto Aprobado" body={montoAprobadoBodyTemplate} sortable sortField="monto_aprobado" />
          <Column header="Responsable" body={responsableBodyTemplate} sortable sortField="responsable" />
          <Column field="ultimo_filtro_calificacion" header="Última fase calificada" sortable />
          <Column field="calificacion_ultimo_filtro_calificacion" header="Resultado última fase calificada" sortable />
          <Column header="Estado de calificación" body={estadoBodyTemplate} sortable />
        </DataTable>
      )}
    </Dialog>
  );
};

export default ProjectsByConvocatoriaModal;