// src/domains/formativa/components/certificacionExterna/CertificacionExternaTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchCertificacionesExternas,
  fetchCertificacionesPorProceso,
  fetchCertificacionesPendientesValidacion,
  eliminarCertificacionExterna,
  establecerFiltroProcesoCertificacion,
  establecerFiltroPendientesCertificacion,
  limpiarFiltrosCertificacionExterna,
  limpiarErrorCertificacionExterna,
} from '../../../../features/certificacionExterna/certificacionExternaSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import AdjuntarCertificadoModal from './AdjuntarCertificadoModal';
import ValidarHorasModal from './ValidarHorasModal';

const CertificacionExternaTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, deletingId, procesoFiltro, pendientesActivo } = useSelector(
    (state) => state.certificacionExterna
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [itemAsistencia, setItemAsistencia] = useState(null);
  const [itemAprobacion, setItemAprobacion] = useState(null);
  const [itemAValidar, setItemAValidar] = useState(null);
  const [procesoInput, setProcesoInput] = useState('');

  const hayFiltroActivo = Boolean(procesoFiltro || pendientesActivo);

  useEffect(() => {
    if (pendientesActivo) {
      dispatch(fetchCertificacionesPendientesValidacion(procesoFiltro));
    } else if (procesoFiltro) {
      dispatch(fetchCertificacionesPorProceso(procesoFiltro));
    } else {
      dispatch(fetchCertificacionesExternas({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, procesoFiltro, pendientesActivo, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorProceso = () => {
    dispatch(establecerFiltroProcesoCertificacion(procesoInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onVerPendientes = () => {
    dispatch(establecerFiltroPendientesCertificacion(procesoInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(limpiarFiltrosCertificacionExterna());
    setProcesoInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const estadoTemplate = (rowData) => {
    if (rowData.fecha_validacion) {
      return (
        <Tag value={rowData.cumple_horas ? 'Cumple' : 'No Cumple'} severity={rowData.cumple_horas ? 'success' : 'danger'} />
      );
    }
    return <Tag value="Sin validar" severity="warning" />;
  };

  const accionesTemplate = (rowData) => {
    const noValidada = !rowData.fecha_validacion;
    return (
      <>
        {noValidada && (
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-text p-button-warning"
            onClick={() => onEdit(rowData)}
            tooltip="Editar"
          />
        )}
        {noValidada && !rowData.certificado_asistencia && (
          <Button
            icon="pi pi-file"
            className="p-button-rounded p-button-text p-button-info"
            onClick={() => setItemAsistencia(rowData)}
            tooltip="Adjuntar certificado de asistencia"
          />
        )}
        {noValidada && !rowData.certificado_aprobacion && (
          <Button
            icon="pi pi-file-check"
            className="p-button-rounded p-button-text p-button-info"
            onClick={() => setItemAprobacion(rowData)}
            tooltip="Adjuntar certificado de aprobación"
          />
        )}
        {noValidada && rowData.certificado_aprobacion && (
          <Button
            icon="pi pi-verified"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => setItemAValidar(rowData)}
            tooltip="Validar horas"
          />
        )}
        {noValidada && (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => setItemAEliminar(rowData)}
            tooltip="Eliminar"
          />
        )}
      </>
    );
  };

  const handleConfirmarEliminar = () => {
    dispatch(eliminarCertificacionExterna(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAEliminar(null);
      }
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '16rem' }}>
          <InputText
            value={procesoInput}
            onChange={(e) => setProcesoInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorProceso()}
            placeholder="ID Proceso Formativo"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorProceso} tooltip="Filtrar por proceso" />
        </div>
        <Button
          label="Pendientes de validación"
          icon="pi pi-clock"
          className="p-button-outlined p-button-sm"
          onClick={onVerPendientes}
        />
        {hayFiltroActivo && (
          <Button
            label="Limpiar filtros"
            icon="pi pi-times"
            className="p-button-text p-button-sm"
            onClick={onLimpiarFiltros}
          />
        )}
      </div>
      {error && (
        <Message
          severity="error"
          className="mb-3 w-full"
          text={error}
          onClick={() => dispatch(limpiarErrorCertificacionExterna())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Certificaciones Externas</h5>}
        loading={loading}
        lazy={!hayFiltroActivo}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={hayFiltroActivo ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron certificaciones externas."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="nombre_programa" header="Programa" />
        <Column field="proceso_titulo" header="Proceso Formativo" />
        <Column field="tipo" header="Tipo" />
        <Column field="institucion" header="Institución" />
        <Column field="horas_certificadas" header="H. Certificadas" />
        <Column field="horas_validadas" header="H. Validadas" />
        <Column header="Estado" body={estadoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '13rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar certificación externa?"
        loading={Boolean(deletingId)}
      >
        Esta acción eliminará <strong>{itemAEliminar?.nombre_programa}</strong>.
      </ConfirmationModal>
      {itemAsistencia && (
        <AdjuntarCertificadoModal
          visible={Boolean(itemAsistencia)}
          onHide={() => setItemAsistencia(null)}
          certificacion={itemAsistencia}
          tipo="asistencia"
        />
      )}
      {itemAprobacion && (
        <AdjuntarCertificadoModal
          visible={Boolean(itemAprobacion)}
          onHide={() => setItemAprobacion(null)}
          certificacion={itemAprobacion}
          tipo="aprobacion"
        />
      )}
      {itemAValidar && (
        <ValidarHorasModal
          visible={Boolean(itemAValidar)}
          onHide={() => setItemAValidar(null)}
          certificacion={itemAValidar}
        />
      )}
    </>
  );
};

export default CertificacionExternaTable;