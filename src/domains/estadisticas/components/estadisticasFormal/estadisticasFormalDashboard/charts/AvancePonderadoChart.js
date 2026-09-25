// src/domains/estadisticas/components/estadisticasFormal/estadisticasFormalDashboard/charts/AvancePonderadoChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchAvancePonderadoPorAnio } from '../../../../../../features/estadisticas/estadisticasFormalSlice';
import { filtrosPorAnio } from '../filtrosPorAnio';

const AvancePonderadoChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { avancePonderadoPorAnio, loading } = useSelector((state) => state.estadisticasFormal);

  useEffect(() => {
    dispatch(fetchAvancePonderadoPorAnio(filtrosPorAnio(comunes)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.responsableSeleccionado, comunes.interno]);

  const chartData = useMemo(() => ({
    labels: avancePonderadoPorAnio.map((r) => r.anio),
    datasets: [{
      label: '% avance ponderado promedio',
      data: avancePonderadoPorAnio.map((r) => r.promedio_avance),
      borderColor: '#9966FF',
      backgroundColor: 'rgba(153,102,255,0.3)',
      fill: true,
    }],
  }), [avancePonderadoPorAnio]);

  return (
    <Panel header="Avance ponderado promedio por año" toggleable collapsed>
      {loading.avancePonderadoPorAnio ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="line" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default AvancePonderadoChart;