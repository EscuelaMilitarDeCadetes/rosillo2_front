// src/domains/estadisticas/components/estadisticasFormal/estadisticasFormalDashboard/charts/EjecucionPresupuestalChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchEjecucionPresupuestalPorAnio } from '../../../../../../features/estadisticas/estadisticasFormalSlice';
import { filtrosPorAnio } from '../filtrosPorAnio';

const EjecucionPresupuestalChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { ejecucionPresupuestalPorAnio, loading } = useSelector((state) => state.estadisticasFormal);

  useEffect(() => {
    dispatch(fetchEjecucionPresupuestalPorAnio(filtrosPorAnio(comunes)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.responsableSeleccionado, comunes.interno]);

  const chartData = useMemo(() => ({
    labels: ejecucionPresupuestalPorAnio.map((r) => r.anio),
    datasets: [{
      label: '% ejecución presupuestal promedio',
      data: ejecucionPresupuestalPorAnio.map((r) => Math.round((r.promedio_ejecutado || 0) * 100) / 100),
      borderColor: '#FFCE56',
      backgroundColor: 'rgba(255,206,86,0.3)',
      fill: true,
    }],
  }), [ejecucionPresupuestalPorAnio]);

  return (
    <Panel header="Ejecución presupuestal promedio por año" toggleable collapsed>
      {loading.ejecucionPresupuestalPorAnio ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="line" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default EjecucionPresupuestalChart;