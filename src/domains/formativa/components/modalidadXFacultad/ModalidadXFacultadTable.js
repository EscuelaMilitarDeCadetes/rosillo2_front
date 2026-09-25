// src/domains/formativa/components/modalidadXFacultad/ModalidadXFacultadTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchModalidadesXFacultad,
  fetchModalidadesPorFacultad,
  habilitarModalidadXFacultad,
  deshabilitarModalidadXFacultad,
  establecerFiltroFacultadModalidad,
  limpiarErrorModalidadXFacultad,
} from '../../../../features/modalidadXFacultad/modalidadXFacultadSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

/**
 * Sin botón de "eliminar": destroy()/DELETE y deshabilitar() hacen
 * exactamente lo mismo en el backend, así que se usa solo el toggle
 * habilitar/deshabilitar (mismo patrón que ReglaFlujo).
 */
const ModalidadXFacultadTable = () => {
  const dispatch = useDispatch();
  const { items, total, loading, error, transicionandoId, facultadFiltro } = useSelector(
    (state) => state.modalidadXFacultad
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemATransicion, setItemATransicion] = useState(null);
  const [facultadInput, setFacultadInput] = useState('');

  useEffect(() => {
    if (facultadFiltro) {
      dispatch(fetchModalidadesPorFacultad({ facultadId: facultadFiltro }));
    } else {
      dispatch(fetchModalidadesXFacultad({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, facultadFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorFacultad = () => {
    dispatch(establecerFiltroFacultadModalidad(facultadInput.trim() || null));
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroFacultadModalidad(null));
    setFacultadInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const disponibleTemplate = (rowData) => (
    <Tag value={rowData.disponible ? 'Disponible' : 'No Disponible'} severity={rowData.disponible ? 'success' : 'danger'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    return rowData.disponible ? (
      <Button
        icon="pi pi-ban"
        className="p-button-rounded p-button-text p-button-danger"
        onClick={() => setItemATransicion(rowData)}
        loading={enTransicion}
        tooltip="Deshabilitar"
      />
    ) : (
      <Button
        icon="pi pi-check-circle"
        className="p-button-rounded p-button-text p-button-success"
        onClick={() => dispatch(habilitarModalidadXFacultad(rowData.id))}
        loading={enTransicion}
        tooltip="Habilitar"
      />
    );
  };

  const handleConfirmarDeshabilitar = () => {
    dispatch(deshabilitarModalidadXFacultad(itemATransicion.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemATransicion(null);
      }
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText
            value={facultadInput}
            onChange={(e) => setFacultadInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorFacultad()}
            placeholder="ID Facultad"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorFacultad} tooltip="Filtrar por facultad" />
        </div>
        {facultadFiltro && (
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
          onClick={() => dispatch(limpiarErrorModalidadXFacultad())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Modalidades por Facultad</h5>}
        loading={loading}
        lazy={!facultadFiltro}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={facultadFiltro ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron vínculos modalidad-facultad."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="facultad_nombre" header="Facultad" />
        <Column field="modalidad_nombre" header="Modalidad" />
        <Column field="disponible" header="Estado" body={disponibleTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '7rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemATransicion)}
        onHide={() => setItemATransicion(null)}
        onConfirm={handleConfirmarDeshabilitar}
        header="¿Deshabilitar modalidad para esta facultad?"
        loading={transicionandoId === itemATransicion?.id}
      >
        Los estudiantes de <strong>{itemATransicion?.facultad_nombre}</strong> ya no podrán registrarse en{' '}
        <strong>{itemATransicion?.modalidad_nombre}</strong>.
      </ConfirmationModal>
    </>
  );
};

export default ModalidadXFacultadTable;