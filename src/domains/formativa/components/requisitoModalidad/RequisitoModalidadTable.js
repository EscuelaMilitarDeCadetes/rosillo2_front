// src/domains/formativa/components/requisitoModalidad/RequisitoModalidadTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchRequisitosModalidad,
  fetchRequisitosPorModalidad,
  eliminarRequisitoModalidad,
  establecerFiltroModalidadRequisito,
  limpiarErrorRequisitoModalidad,
} from '../../../../features/requisitoModalidad/requisitoModalidadSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const RequisitoModalidadTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, deletingId, modalidadFiltro } = useSelector(
    (state) => state.requisitoModalidad
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [modalidadInput, setModalidadInput] = useState('');

  useEffect(() => {
    if (modalidadFiltro) {
      dispatch(fetchRequisitosPorModalidad(modalidadFiltro));
    } else {
      dispatch(fetchRequisitosModalidad({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, modalidadFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorModalidad = () => {
    dispatch(establecerFiltroModalidadRequisito(modalidadInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroModalidadRequisito(null));
    setModalidadInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const valorTemplate = (rowData) => {
    if (rowData.valor_numerico != null) return rowData.valor_numerico;
    if (rowData.valor_booleano != null) return rowData.valor_booleano ? 'Sí' : 'No';
    return '—';
  };

  const activoTemplate = (rowData) => (
    <Tag value={rowData.activo ? 'Activo' : 'Inactivo'} severity={rowData.activo ? 'success' : 'danger'} />
  );

  const accionesTemplate = (rowData) => (
    <>
      {rowData.activo && (
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" onClick={() => onEdit(rowData)} tooltip="Editar" />
      )}
      {rowData.activo && (
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => setItemAEliminar(rowData)}
          loading={deletingId === rowData.id}
          tooltip="Eliminar"
        />
      )}
    </>
  );

  const handleConfirmarEliminar = () => {
    dispatch(eliminarRequisitoModalidad(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') setItemAEliminar(null);
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText value={modalidadInput} onChange={(e) => setModalidadInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onBuscarPorModalidad()} placeholder="ID Modalidad" />
          <Button icon="pi pi-search" onClick={onBuscarPorModalidad} tooltip="Filtrar por modalidad" />
        </div>
        {modalidadFiltro && (
          <Button label="Limpiar filtros" icon="pi pi-times" className="p-button-text p-button-sm" onClick={onLimpiarFiltros} />
        )}
      </div>
      {error && (
        <Message severity="error" className="mb-3 w-full" text={error} onClick={() => dispatch(limpiarErrorRequisitoModalidad())} />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Requisitos de Modalidad</h5>}
        loading={loading}
        lazy={!modalidadFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={modalidadFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron requisitos de modalidad."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="modalidad_nombre" header="Modalidad" />
        <Column field="tipo" header="Tipo" />
        <Column field="descripcion" header="Descripción" />
        <Column header="Valor" body={valorTemplate} />
        <Column field="activo" header="Estado" body={activoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '7rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar requisito de modalidad?"
        loading={Boolean(deletingId)}
      >
        Esta acción desactivará el requisito <strong>{itemAEliminar?.tipo}</strong> de{' '}
        <strong>{itemAEliminar?.modalidad_nombre}</strong>.
      </ConfirmationModal>
    </>
  );
};

export default RequisitoModalidadTable;