// src/domains/formativa/components/estudiante/EstudianteTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchEstudiantes,
  fetchEstudiantesPorFacultad,
  fetchEstudiantesPorModalidad,
  fetchEstudiantesPorModalidadFacultad,
  desactivarEstudiante,
  reactivarEstudiante,
  establecerFiltroFacultadEstudiante,
  establecerFiltroModalidadEstudiante,
  establecerFiltroModalidadFacultadEstudiante,
  limpiarFiltrosEstudiante,
  limpiarErrorEstudiante,
} from '../../../../features/estudiante/estudianteSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const OPCIONES_ESTADO = [
  { label: 'Todos', value: null },
  { label: 'Activos', value: true },
  { label: 'Inactivos', value: false },
];

/**
 * solo se implementa el toggle desactivar/reactivar.
 */
const EstudianteTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const {
    items,
    total,
    loading,
    error,
    transicionandoId,
    facultadFiltro,
    modalidadFiltro,
    modalidadFacultadFiltro,
    estadoFiltro,
  } = useSelector((state) => state.estudiante);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemATransicion, setItemATransicion] = useState(null);
  const [facultadInput, setFacultadInput] = useState('');
  const [modalidadInput, setModalidadInput] = useState('');
  const [modalidadFacultadInput, setModalidadFacultadInput] = useState('');
  const [estadoInput, setEstadoInput] = useState(null);

  const hayFiltroActivo = Boolean(facultadFiltro || modalidadFiltro || modalidadFacultadFiltro);

  useEffect(() => {
    if (facultadFiltro) {
      dispatch(fetchEstudiantesPorFacultad({ facultadId: facultadFiltro, estado: estadoFiltro }));
    } else if (modalidadFiltro) {
      dispatch(fetchEstudiantesPorModalidad({ modalidadId: modalidadFiltro, estado: estadoFiltro }));
    } else if (modalidadFacultadFiltro) {
      dispatch(fetchEstudiantesPorModalidadFacultad({ modalidadFacultadId: modalidadFacultadFiltro, estado: estadoFiltro }));
    } else {
      dispatch(fetchEstudiantes({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, facultadFiltro, modalidadFiltro, modalidadFacultadFiltro, estadoFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorFacultad = () => {
    if (!facultadInput.trim()) return;
    dispatch(establecerFiltroFacultadEstudiante({ facultadId: facultadInput.trim(), estado: estadoInput }));
    setModalidadInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onBuscarPorModalidad = () => {
    if (!modalidadInput.trim()) return;
    dispatch(establecerFiltroModalidadEstudiante({ modalidadId: modalidadInput.trim(), estado: estadoInput }));
    setFacultadInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onBuscarPorModalidadFacultad = () => {
    if (!modalidadFacultadInput.trim()) return;
    dispatch(establecerFiltroModalidadFacultadEstudiante({
      modalidadFacultadId: modalidadFacultadInput.trim(),
      estado: estadoInput,
    }));
    setFacultadInput('');
    setModalidadInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(limpiarFiltrosEstudiante());
    setFacultadInput('');
    setModalidadInput('');
    setModalidadFacultadInput('');
    setEstadoInput(null);
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const estadoTemplate = (rowData) => (
    <Tag value={rowData.estado ? 'Activo' : 'Inactivo'} severity={rowData.estado ? 'success' : 'danger'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    return (
      <>
        {rowData.estado && (
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-text p-button-warning"
            onClick={() => onEdit(rowData)}
            tooltip="Editar"
          />
        )}
        {rowData.estado ? (
          <Button
            icon="pi pi-ban"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => setItemATransicion({ ...rowData, accion: 'desactivar' })}
            loading={enTransicion}
            tooltip="Desactivar"
          />
        ) : (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => dispatch(reactivarEstudiante(rowData.id))}
            loading={enTransicion}
            tooltip="Reactivar"
          />
        )}
      </>
    );
  };

  const handleConfirmarDesactivar = () => {
    dispatch(desactivarEstudiante(itemATransicion.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemATransicion(null);
      }
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '12rem' }}>
          <InputText
            value={facultadInput}
            onChange={(e) => setFacultadInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorFacultad()}
            placeholder="ID Facultad"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorFacultad} tooltip="Filtrar por facultad" />
        </div>
        <div className="p-inputgroup" style={{ maxWidth: '12rem' }}>
          <InputText
            value={modalidadInput}
            onChange={(e) => setModalidadInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorModalidad()}
            placeholder="ID Modalidad"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorModalidad} tooltip="Filtrar por modalidad" />
        </div>
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText
            value={modalidadFacultadInput}
            onChange={(e) => setModalidadFacultadInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorModalidadFacultad()}
            placeholder="ID Modalidad-Facultad"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorModalidadFacultad} tooltip="Filtrar por modalidad-facultad" />
        </div>
        <Dropdown
          value={estadoInput}
          options={OPCIONES_ESTADO}
          onChange={(e) => setEstadoInput(e.value)}
          placeholder="Estado"
          style={{ minWidth: '10rem' }}
          disabled={!hayFiltroActivo && !facultadInput.trim() && !modalidadInput.trim() && !modalidadFacultadInput.trim()}
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
          onClick={() => dispatch(limpiarErrorEstudiante())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Estudiantes</h5>}
        loading={loading}
        lazy={!hayFiltroActivo}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={hayFiltroActivo ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron estudiantes."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="persona_nombre_completo" header="Nombre" />
        <Column field="persona_documento" header="Documento" />
        <Column field="modalidad_facultad_nombre" header="Modalidad" />
        <Column field="facultad_nombre" header="Facultad" />
        <Column field="correo_personal" header="Correo Personal" />
        <Column field="nivel" header="Nivel" />
        <Column field="estado" header="Estado" body={estadoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '9rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemATransicion)}
        onHide={() => setItemATransicion(null)}
        onConfirm={handleConfirmarDesactivar}
        header="¿Desactivar estudiante?"
        loading={transicionandoId === itemATransicion?.id}
      >
        Esta acción desactivará a <strong>{itemATransicion?.persona_nombre_completo}</strong> como estudiante.
      </ConfirmationModal>
    </>
  );
};

export default EstudianteTable;