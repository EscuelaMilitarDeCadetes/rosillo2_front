// src/domains/usuarios/components/usuarioXPersona/RotacionesTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { fetchRotaciones } from '../../../../features/usuarioXPersona/usuarioXPersonaSlice';


const RotacionesTable = () => {
  const dispatch = useDispatch();
  const { rotaciones, rotacionesLoading } = useSelector((state) => state.usuarioXPersona);
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);

  useEffect(() => {
    dispatch(fetchRotaciones({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const formatDate = (d) => {
    if (!d) return undefined;
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleFiltrar = () => {
    dispatch(fetchRotaciones({ desde: formatDate(desde), hasta: formatDate(hasta) }));
  };

  const handleLimpiar = () => {
    setDesde(null);
    setHasta(null);
    dispatch(fetchRotaciones({}));
  };

  const estadoBodyTemplate = (rowData) => (
    <Tag severity={rowData.estado ? 'success' : 'secondary'} value={rowData.estado ? 'Activa' : 'Cerrada'} />
  );

  return (
    <>
      <h5 className="mb-3">Rotaciones Usuario ↔ Persona (todos los usuarios)</h5>
      <div className="d-flex align-items-end gap-3 mb-3 flex-wrap">
        <div>
          <label htmlFor="desde" className="d-block">
            Desde
          </label>
          <Calendar id="desde" value={desde} onChange={(e) => setDesde(e.value)} dateFormat="yy-mm-dd" showIcon />
        </div>
        <div>
          <label htmlFor="hasta" className="d-block">
            Hasta
          </label>
          <Calendar id="hasta" value={hasta} onChange={(e) => setHasta(e.value)} dateFormat="yy-mm-dd" showIcon />
        </div>
        <Button label="Filtrar" icon="pi pi-filter" onClick={handleFiltrar} />
        <Button label="Limpiar" icon="pi pi-filter-slash" className="p-button-text" onClick={handleLimpiar} />
      </div>

      <DataTable
        value={rotaciones}
        loading={rotacionesLoading}
        paginator
        rows={15}
        emptyMessage="No hay rotaciones en el rango seleccionado."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="usuario_username" header="Usuario (cuenta)" sortable />
        <Column field="persona_nombre" header="Persona" sortable />
        <Column field="fecha_inicio" header="Fecha Inicio" sortable />
        <Column field="fecha_fin" header="Fecha Fin" sortable />
        <Column header="Estado" body={estadoBodyTemplate} sortable sortField="estado" />
      </DataTable>
    </>
  );
};

export default RotacionesTable;