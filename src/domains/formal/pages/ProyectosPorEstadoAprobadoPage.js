// src/domains/formal/pages/ProyectosPorEstadoAprobadoPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { SelectButton } from 'primereact/selectbutton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { fetchProyectosPorEstadoAprobado } from '../../../features/proyectos/proyectosSlice';

const OPCIONES_ESTADO = [
  { label: 'Sin Calificar', value: 'SIN_CALIFICAR' },
  { label: 'Aprobados', value: 'APROBADO' },
  { label: 'No Aprobados', value: 'NO_APROBADO' },
];

const ESTADO_SEVERITY = { APROBADO: 'success', NO_APROBADO: 'danger', SIN_CALIFICAR: 'warning' };

const ProyectosPorEstadoAprobadoPage = () => {
  const dispatch = useDispatch();
  const { proyectosPorEstadoAprobado, loadingPorEstadoAprobado, errorPorEstadoAprobado } = useSelector((state) => state.proyectos);
  const [estado, setEstado] = useState('APROBADO');

  useEffect(() => {
    dispatch(fetchProyectosPorEstadoAprobado(estado));
  }, [dispatch, estado]);

  const estadoBodyTemplate = (rowData) => (
    <Tag severity={ESTADO_SEVERITY[rowData.estado_aprobado] || 'info'} value={rowData.estado_aprobado} />
  );

  const accionesBodyTemplate = (rowData) => (
    <Link to={`/proyectos/${rowData.id}`}>
      <Button label="Ver" icon="pi pi-eye" className="p-button-sm p-button-text" />
    </Link>
  );

  return (
    <div className="container mt-4">
      <Card title="Proyectos por Estado de Aprobación">
        <div className="mb-3">
          <SelectButton value={estado} options={OPCIONES_ESTADO} onChange={(e) => e.value && setEstado(e.value)} />
        </div>
        {errorPorEstadoAprobado && <div className="alert alert-danger">{errorPorEstadoAprobado}</div>}
        <DataTable
          value={proyectosPorEstadoAprobado}
          loading={loadingPorEstadoAprobado}
          paginator
          rows={15}
          responsiveLayout="scroll"
          emptyMessage="No hay proyectos con este estado de aprobación."
        >
          <Column field="codigo" header="Código" sortable />
          <Column field="titulo" header="Título" sortable />
          <Column field="unidad_ejecutora" header="Unidad Ejecutora" sortable />
          <Column field="interno" header="Interno" body={(r) => (r.interno ? 'Sí' : 'No')} sortable />
          <Column header="Estado" body={estadoBodyTemplate} />
          <Column field="gruplac" header="GrupLAC" body={(r) => (r.gruplac ? 'Sí' : 'No')} sortable />
          <Column header="Acciones" body={accionesBodyTemplate} />
        </DataTable>
      </Card>
    </div>
  );
};

export default ProyectosPorEstadoAprobadoPage;