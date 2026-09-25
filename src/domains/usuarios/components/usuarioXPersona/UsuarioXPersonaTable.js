// src/domains/usuarios/components/usuarioXPersona/UsuarioXPersonaTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { fetchAsignaciones } from '../../../../features/usuarioXPersona/usuarioXPersonaSlice';
import ReasignarPersonaModal from './ReasignarPersonaModal';
import HistoricoAsignacionModal from './HistoricoAsignacionModal';

const PAGE_SIZE = 10;


const UsuarioXPersonaTable = () => {
  const dispatch = useDispatch();
  const { items, total, loading } = useSelector((state) => state.usuarioXPersona);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: PAGE_SIZE, page: 1 });
  const [reasignarTarget, setReasignarTarget] = useState(null);
  const [historicoTarget, setHistoricoTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchAsignaciones({ page: lazyParams.page, pageSize: lazyParams.rows }));
  }, [dispatch, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const accionesTemplate = (row) => (
    <div className="d-flex gap-2">
      <Button
        icon="pi pi-history"
        className="p-button-rounded p-button-secondary p-button-sm"
        tooltip="Ver histórico"
        onClick={() => setHistoricoTarget(row)}
      />
      <Button
        icon="pi pi-user-edit"
        className="p-button-rounded p-button-info p-button-sm"
        tooltip="Reasignar persona"
        onClick={() => setReasignarTarget(row)}
      />
    </div>
  );

  return (
    <>
      <h5 className="mb-3">Asignaciones Usuario ↔ Persona (activas)</h5>
      <DataTable
        value={items}
        loading={loading}
        lazy
        paginator
        rows={PAGE_SIZE}
        totalRecords={total}
        first={lazyParams.first}
        onPage={onPage}
        emptyMessage="No hay asignaciones activas."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="usuario_username" header="Usuario (cuenta)" sortable />
        <Column field="persona_nombre" header="Persona actual" sortable />
        <Column field="fecha_inicio" header="Desde" sortable />
        <Column header="Acciones" body={accionesTemplate} />
      </DataTable>

      <ReasignarPersonaModal visible={!!reasignarTarget} onHide={() => setReasignarTarget(null)} usuario={reasignarTarget} />
      <HistoricoAsignacionModal visible={!!historicoTarget} onHide={() => setHistoricoTarget(null)} usuario={historicoTarget} />
    </>
  );
};

export default UsuarioXPersonaTable;