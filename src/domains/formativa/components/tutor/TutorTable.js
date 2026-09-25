// src/domains/formativa/components/tutor/TutorTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchTutores,
  fetchTutoresPorFacultad,
  activarTutor,
  desactivarTutor,
  establecerFiltroFacultadTutor,
  limpiarErrorTutor,
} from '../../../../features/tutor/tutorSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const TutorTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, transicionandoId, facultadFiltro } = useSelector((state) => state.tutor);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemATransicion, setItemATransicion] = useState(null);
  const [facultadInput, setFacultadInput] = useState('');

  useEffect(() => {
    if (facultadFiltro) {
      dispatch(fetchTutoresPorFacultad(facultadFiltro));
    } else {
      dispatch(fetchTutores({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, facultadFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorFacultad = () => {
    dispatch(establecerFiltroFacultadTutor(facultadInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroFacultadTutor(null));
    setFacultadInput('');
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
          <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" onClick={() => onEdit(rowData)} tooltip="Editar" />
        )}
        {rowData.estado ? (
          <Button
            icon="pi pi-ban"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => setItemATransicion(rowData)}
            loading={enTransicion}
            tooltip="Desactivar"
          />
        ) : (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => dispatch(activarTutor(rowData.id))}
            loading={enTransicion}
            tooltip="Activar"
          />
        )}
      </>
    );
  };

  const handleConfirmarDesactivar = () => {
    dispatch(desactivarTutor(itemATransicion.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') setItemATransicion(null);
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText value={facultadInput} onChange={(e) => setFacultadInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onBuscarPorFacultad()} placeholder="ID Facultad" />
          <Button icon="pi pi-search" onClick={onBuscarPorFacultad} tooltip="Filtrar por facultad" />
        </div>
        {facultadFiltro && (
          <Button label="Limpiar filtros" icon="pi pi-times" className="p-button-text p-button-sm" onClick={onLimpiarFiltros} />
        )}
      </div>
      {error && (
        <Message severity="error" className="mb-3 w-full" text={error} onClick={() => dispatch(limpiarErrorTutor())} />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Tutores</h5>}
        loading={loading}
        lazy={!facultadFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={facultadFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron tutores."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="persona_nombre_completo" header="Nombre" />
        <Column field="persona_documento" header="Documento" />
        <Column field="facultad_nombre" header="Facultad" />
        <Column field="estado" header="Estado" body={estadoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '9rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemATransicion)}
        onHide={() => setItemATransicion(null)}
        onConfirm={handleConfirmarDesactivar}
        header="¿Desactivar tutor?"
        loading={transicionandoId === itemATransicion?.id}
      >
        Esta acción desactivará a <strong>{itemATransicion?.persona_nombre_completo}</strong> como tutor.
      </ConfirmationModal>
    </>
  );
};

export default TutorTable;