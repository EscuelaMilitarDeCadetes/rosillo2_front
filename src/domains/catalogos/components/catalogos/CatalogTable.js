// src/domains/catalogos/components/catalogos/CatalogTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { fetchCatalogo, fetchCatalogoFiltrado } from '../../../../features/catalogos/catalogosSlice';
import { InputText } from 'primereact/inputtext';

/**
 * Tabla genérica con paginación real de backend para cualquier catálogo
 * definido en catalogosConfig.js. Sigue el mismo patrón `lazy` de PrimeReact
 * que PlatformUsersTable.js / GroupUsersTable.js: cada cambio de página
 * dispara fetchCatalogo({catalogKey, page, pageSize}).
 */
const CatalogTable = ({ config, onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error, filtroActivo } = useSelector((state) => state.catalogos[config.key]);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [valorFiltro, setValorFiltro] = useState('');

  const boolTemplate = (rowData, campo) => (rowData[campo.name] ? 'Sí' : 'No');

  useEffect(() => {
    dispatch(fetchCatalogo({ catalogKey: config.key, page: lazyParams.page, pageSize: lazyParams.rows }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, config.key, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const handleFiltrar = () => {
    if (!valorFiltro.trim()) return;
    dispatch(fetchCatalogoFiltrado({ catalogKey: config.key, valor: valorFiltro.trim() }));
  };

  const handleQuitarFiltro = () => {
    setValorFiltro('');
    dispatch(fetchCatalogo({ catalogKey: config.key, page: 1, pageSize: lazyParams.rows }));
  };

  const accionesTemplate = (rowData) => (
    <Button
      icon="pi pi-pencil"
      className="p-button-rounded p-button-text p-button-warning"
      onClick={() => onEdit(rowData)}
      tooltip="Editar"
    />
  );

  const headerFiltro = config.filtro && (
    <div className="d-flex align-items-end gap-2 mb-3">
      <div>
        <label className="d-block small">{config.filtro.label}</label>
        <InputText
          value={valorFiltro}
          onChange={(e) => setValorFiltro(e.target.value)}
          placeholder={config.filtro.placeholder}
          onKeyDown={(e) => e.key === 'Enter' && handleFiltrar()}
        />
      </div>
      <Button label="Filtrar" icon="pi pi-filter" onClick={handleFiltrar} />
      {filtroActivo && (
        <Button label="Quitar filtro" icon="pi pi-times" className="p-button-outlined" onClick={handleQuitarFiltro} />
      )}
    </div>
  );


  return (
    <>
      {headerFiltro}
      {error && <Message severity="error" className="mb-3 w-full" text={error} />}
      <DataTable
        value={items}
        header={<h5 className="m-0">{config.titulo}</h5>}
        loading={loading}
        lazy={!filtroActivo}
        paginator
        first={filtroActivo ? 0 : lazyParams.first}
        rows={filtroActivo ? total || 10 : lazyParams.rows}
        totalRecords={total}
        onPage={filtroActivo ? undefined : onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron registros."
        responsiveLayout="scroll"
        dataKey="id"
      >
        {config.campos.map((campo) => (
          <Column
            key={campo.name}
            field={campo.columnField || campo.name}
            header={campo.label}
            body={campo.type === 'checkbox' ? (rowData) => boolTemplate(rowData, campo) : undefined}
          />
        ))}
        <Column body={accionesTemplate} header="Acciones" style={{ width: '5rem' }} />
      </DataTable>
    </>
  );
};

export default CatalogTable;