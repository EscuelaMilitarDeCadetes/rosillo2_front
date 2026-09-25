// src/domains/formal/components/reportes/ReporteMontosCalificados.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { SelectButton } from 'primereact/selectbutton';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
  fetchMontosAprobadosCalificados,
  fetchMontosContrapartidaCalificados,
  fetchMontosTotalesCalificados,
} from '../../../../features/proyectos/montoSlice';

const OPCIONES_AMBITO = [
  { label: 'Internos', value: true },
  { label: 'Externos', value: false },
];

const moneyTemplate = (field) => (rowData) =>
  rowData[field] != null
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(rowData[field])
    : '—';

const ReporteMontosCalificados = () => {
  const dispatch = useDispatch();
  const { reporteMontosCalificados, loadingReporte, error } = useSelector((state) => state.montos);
  const [interno, setInterno] = useState(true);

  useEffect(() => {
    dispatch(fetchMontosAprobadosCalificados(interno));
    dispatch(fetchMontosContrapartidaCalificados(interno));
    dispatch(fetchMontosTotalesCalificados(interno));
  }, [dispatch, interno]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Reporte de Montos — Proyectos Calificados</h4>
        <SelectButton value={interno} options={OPCIONES_AMBITO} onChange={(e) => e.value !== null && setInterno(e.value)} />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loadingReporte && (
        <div className="d-flex justify-content-center my-4">
          <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="8" />
        </div>
      )}

      <Card title="Montos Aprobados" className="mb-4">
        <DataTable value={reporteMontosCalificados.aprobados} responsiveLayout="scroll" paginator rows={10}
          emptyMessage="No hay montos aprobados para proyectos calificados en este ámbito.">
          <Column field="proyecto_titulo" header="Proyecto" sortable />
          <Column field="solicitado" header="Solicitado" body={moneyTemplate('solicitado')} sortable />
          <Column field="aprobado" header="Aprobado" body={moneyTemplate('aprobado')} sortable />
        </DataTable>
      </Card>

      <Card title="Contrapartida" className="mb-4">
        <DataTable value={reporteMontosCalificados.contrapartida} responsiveLayout="scroll" paginator rows={10}
          emptyMessage="No hay registros de contrapartida para proyectos calificados en este ámbito.">
          <Column field="proyecto_titulo" header="Proyecto" sortable />
          <Column field="contrapartida" header="Contrapartida" body={moneyTemplate('contrapartida')} sortable />
        </DataTable>
      </Card>

      <Card title="Totales (Aprobado + Contrapartida)" className="mb-4">
        <DataTable value={reporteMontosCalificados.totales} responsiveLayout="scroll" paginator rows={10}
          emptyMessage="No hay totales para proyectos calificados en este ámbito.">
          <Column field="proyecto_titulo" header="Proyecto" sortable />
          <Column field="total" header="Total" body={moneyTemplate('total')} sortable />
        </DataTable>
      </Card>
    </div>
  );
};

export default ReporteMontosCalificados;