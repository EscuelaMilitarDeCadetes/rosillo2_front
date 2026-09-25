// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/charts/TasaAprobacionChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchTasaAprobacionPorModalidad } from '../../../../../../features/estadisticas/estadisticasFormativaSlice';

const TasaAprobacionChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { tasaAprobacionPorModalidad, loading } = useSelector((state) => state.estadisticasFormativa);

  useEffect(() => {
    dispatch(fetchTasaAprobacionPorModalidad({ facultad_id: comunes.facultadId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.facultadId]);

  const chartData = useMemo(() => ({
    labels: tasaAprobacionPorModalidad.map((r) => r.modalidad),
    datasets: [{ label: 'Tasa de aprobación (%)', data: tasaAprobacionPorModalidad.map((r) => r.tasa_aprobacion), backgroundColor: '#4BC0C0' }],
  }), [tasaAprobacionPorModalidad]);

  return (
    <Panel header="Tasa de aprobación por modalidad" toggleable collapsed>
      {loading.tasaAprobacionPorModalidad ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default TasaAprobacionChart;