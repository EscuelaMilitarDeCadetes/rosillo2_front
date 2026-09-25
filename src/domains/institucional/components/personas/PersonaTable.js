// src/domains/institucional/components/personas/PersonaTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { fetchPersonas } from '../../../../features/personas/personasSlice';
import PersonaFormModal from './PersonaFormModal';

const PAGE_SIZE = 10;


const PersonaTable = () => {
  const dispatch = useDispatch();
  const { items, total, loading } = useSelector((state) => state.personas);
  const { roles } = useSelector((state) => state.auth);
  const puedeGestionar = roles?.includes('SOPORTE');

  const [lazyParams, setLazyParams] = useState({ first: 0, rows: PAGE_SIZE, page: 1 });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [personaEditar, setPersonaEditar] = useState(null);

  useEffect(() => {
    dispatch(fetchPersonas({ page: lazyParams.page, pageSize: lazyParams.rows }));
  }, [dispatch, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const abrirCreacion = () => {
    setPersonaEditar(null);
    setIsFormVisible(true);
  };

  const abrirEdicion = (row) => {
    setPersonaEditar(row);
    setIsFormVisible(true);
  };

  const accionesTemplate = (row) =>
    puedeGestionar ? (
      <Button icon="pi pi-pencil" className="p-button-rounded p-button-secondary p-button-sm" tooltip="Editar" onClick={() => abrirEdicion(row)} />
    ) : null;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Personas</h5>
        {puedeGestionar && <Button label="Nueva Persona" icon="pi pi-plus" onClick={abrirCreacion} />}
      </div>

      <DataTable
        value={items}
        loading={loading}
        lazy
        paginator
        rows={PAGE_SIZE}
        totalRecords={total}
        first={lazyParams.first}
        onPage={onPage}
        emptyMessage="No se encontraron personas."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="grado_sigla" header="Grado" />
        <Column field="nombre" header="Nombre" sortable />
        <Column field="apellido" header="Apellido" sortable />
        <Column field="documento" header="Documento" sortable />
        <Column field="celular" header="Celular" />
        <Column field="correo" header="Correo" />
        {puedeGestionar && <Column header="Acciones" body={accionesTemplate} />}
      </DataTable>

      <PersonaFormModal visible={isFormVisible} onHide={() => setIsFormVisible(false)} persona={personaEditar} />
    </>
  );
};

export default PersonaTable;