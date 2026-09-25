// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/charts/PromedioNotaFinalChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchPromedioNotaFinalPorModalidad } from '../../../../../../features/estadisticas/estadisticasFormativaSlice';

const PromedioNotaFinalChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { promedioNotaFinalPorModalidad, loading } = useSelector((state) => state.estadisticasFormativa);

  useEffect(() => {
    dispatch(fetchPromedioNotaFinalPorModalidad({ facultad_id: comunes.facultadId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.facultadId]);

  const chartData = useMemo(() => ({
    labels: promedioNotaFinalPorModalidad.map((r) => r.flujo_version__modalidad__nombre),
    datasets: [{
      label: 'Nota final promedio',
      data: promedioNotaFinalPorModalidad.map((r) => Number(r.promedio?.toFixed ? r.promedio.toFixed(2) : r.promedio)),
      backgroundColor: '#FFCE56',
    }],
  }), [promedioNotaFinalPorModalidad]);

  return (
    <Panel header="Promedio de nota final por modalidad" toggleable collapsed>
      {loading.promedioNotaFinalPorModalidad ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default PromedioNotaFinalChart;