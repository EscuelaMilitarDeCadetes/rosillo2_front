// src/domains/crm/components/entidadExterna/EntidadExternaTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchEntidadesExternas,
  fetchEntidadesPorTipoRelacion,
  fetchEntidadesPorSector,
  fetchEntidadesPorPais,
  eliminarEntidadExterna,
  establecerFiltroTipoRelacion,
  establecerFiltroSector,
  establecerFiltroPais,
  limpiarErrorEntidadExterna,
} from '../../../../features/crm/entidadExternaSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const OPCIONES_FILTRO = [
  { label: 'Todas', value: null },
  { label: 'Financiador', value: 'FINANCIADOR' },
  { label: 'Cooperante', value: 'COOPERANTE' },
];


const EntidadExternaTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, deletingId, tipoRelacionFiltro, sectorFiltro, paisFiltro } = useSelector(
    (state) => state.entidadExterna
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [sectorInput, setSectorInput] = useState('');
  const [paisInput, setPaisInput] = useState('');

  const hayFiltroActivo = Boolean(tipoRelacionFiltro || sectorFiltro || paisFiltro);

  useEffect(() => {
    if (tipoRelacionFiltro) {
      dispatch(fetchEntidadesPorTipoRelacion(tipoRelacionFiltro));
    } else if (sectorFiltro) {
      dispatch(fetchEntidadesPorSector(sectorFiltro));
    } else if (paisFiltro) {
      dispatch(fetchEntidadesPorPais(paisFiltro));
    } else {
      dispatch(fetchEntidadesExternas({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, tipoRelacionFiltro, sectorFiltro, paisFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onFiltroTipoRelacionChange = (value) => {
    dispatch(establecerFiltroTipoRelacion(value));
    setSectorInput('');
    setPaisInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onBuscarPorSector = () => {
    dispatch(establecerFiltroSector(sectorInput.trim() || null));
    setPaisInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onBuscarPorPais = () => {
    dispatch(establecerFiltroPais(paisInput.trim() || null));
    setSectorInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onLimpiarFiltros = () => {
    dispatch(establecerFiltroTipoRelacion(null));
    setSectorInput('');
    setPaisInput('');
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const tipoRelacionTemplate = (rowData) => (
    <Tag
      value={rowData.tipo_relacion === 'FINANCIADOR' ? 'Financiador' : 'Cooperante'}
      severity={rowData.tipo_relacion === 'FINANCIADOR' ? 'success' : 'info'}
    />
  );

  const accionesTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-text p-button-warning"
        onClick={() => onEdit(rowData)}
        tooltip="Editar"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-danger"
        onClick={() => setItemAEliminar(rowData)}
        tooltip="Eliminar"
      />
    </>
  );

  const handleConfirmarEliminar = () => {
    dispatch(eliminarEntidadExterna(itemAEliminar.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemAEliminar(null);
      }
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <Dropdown
          value={tipoRelacionFiltro}
          options={OPCIONES_FILTRO}
          onChange={(e) => onFiltroTipoRelacionChange(e.value)}
          placeholder="Filtrar por tipo de relación"
          style={{ minWidth: '16rem' }}
        />
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText
            value={sectorInput}
            onChange={(e) => setSectorInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorSector()}
            placeholder="Sector"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorSector} tooltip="Filtrar por sector" />
        </div>
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText
            value={paisInput}
            onChange={(e) => setPaisInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorPais()}
            placeholder="País"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorPais} tooltip="Filtrar por país" />
        </div>
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
          onClick={() => dispatch(limpiarErrorEntidadExterna())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Entidades Externas</h5>}
        loading={loading}
        lazy={!hayFiltroActivo}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={hayFiltroActivo ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron entidades externas."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="nombre" header="Nombre" />
        <Column field="sector" header="Sector" />
        <Column field="pais" header="País" />
        <Column field="tipo_relacion" header="Tipo de Relación" body={tipoRelacionTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '8rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemAEliminar)}
        onHide={() => setItemAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar entidad externa?"
        loading={Boolean(deletingId)}
      >
        Esta acción eliminará permanentemente a <strong>{itemAEliminar?.nombre}</strong>.
        No será posible si tiene interacciones registradas.
      </ConfirmationModal>
    </>
  );
};

export default EntidadExternaTable;