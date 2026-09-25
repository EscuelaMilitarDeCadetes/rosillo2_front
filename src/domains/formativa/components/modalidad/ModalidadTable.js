// src/domains/formativa/components/modalidad/ModalidadTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchModalidades,
  eliminarModalidad,
  activarModalidad,
  limpiarErrorModalidad,
} from '../../../../features/modalidad/modalidadSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const triEstadoTexto = (valor) => (valor === null ? 'Sin definir' : valor ? 'Sí' : 'No');

const ModalidadTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, deletingId, transicionandoId } = useSelector(
    (state) => state.modalidad
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);

  useEffect(() => {
    dispatch(fetchModalidades({ page: lazyParams.page, pageSize: lazyParams.rows }));
  }, [dispatch, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const activoTemplate = (rowData) => (
    <Tag value={rowData.activo ? 'Activa' : 'Inactiva'} severity={rowData.activo ? 'success' : 'danger'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    return (
      <>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-warning"
          onClick={() => onEdit(rowData)}
          tooltip="Editar"
        />
        {rowData.activo ? (
          <Button
            icon="pi pi-ban"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => setItemAEliminar(rowData)}
            loading={deletingId === rowData.id}
            tooltip="Desactivar"
          />
        ) : (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => dispatch(activarModalidad(rowData.id))}
            loading={enTransicion}
            tooltip="Activar"
          />
        )}
      </>
    );
  };

  const handleConfirmarEliminar = () => {
    dispatch(eliminarModalidad(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAEliminar(null);
      }
    });
  };

  return (
    <>
      {error && (
        <Message
          severity="error"
          className="mb-3 w-full"
          text={error}
          onClick={() => dispatch(limpiarErrorModalidad())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Modalidades</h5>}
        loading={loading}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron modalidades."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="nombre" header="Nombre" />
        <Column field="codigo" header="Código" />
        <Column
          field="requiere_evaluadores"
          header="Evaluadores"
          body={(row) => (row.requiere_evaluadores ? 'Sí' : 'No')}
        />
        <Column field="requiere_tutor" header="Tutor" body={(row) => triEstadoTexto(row.requiere_tutor)} />
        <Column
          field="requiere_sustentacion"
          header="Sustentación"
          body={(row) => triEstadoTexto(row.requiere_sustentacion)}
        />
        <Column field="activo" header="Estado" body={activoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '9rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Desactivar modalidad?"
        loading={Boolean(deletingId)}
      >
        Esta acción desactivará la modalidad <strong>{itemAEliminar?.nombre}</strong>.
      </ConfirmationModal>
    </>
  );
};

export default ModalidadTable;