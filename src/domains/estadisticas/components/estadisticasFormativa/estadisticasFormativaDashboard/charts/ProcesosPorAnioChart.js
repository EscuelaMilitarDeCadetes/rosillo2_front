// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/charts/ProcesosPorAnioChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchProcesosPorAnio } from '../../../../../../features/estadisticas/estadisticasFormativaSlice';

const ProcesosPorAnioChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { procesosPorAnio, loading } = useSelector((state) => state.estadisticasFormativa);

  useEffect(() => {
    dispatch(fetchProcesosPorAnio({ modalidad_id: comunes.modalidadId, facultad_id: comunes.facultadId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.modalidadId, comunes.facultadId]);

  const chartData = useMemo(() => ({
    labels: procesosPorAnio.map((r) => r.anio),
    datasets: [{ label: 'Procesos formativos', data: procesosPorAnio.map((r) => r.total), backgroundColor: '#4BC0C0' }],
  }), [procesosPorAnio]);

  return (
    <Panel header="Procesos formativos por año" toggleable collapsed>
      {loading.procesosPorAnio ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default ProcesosPorAnioChart;