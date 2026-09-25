// src/domains/estadisticas/components/estadisticasFormal/estadisticasFormalDashboard/charts/FinalizadosVsEjecucionChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchFinalizadosVsEjecucion } from '../../../../../../features/estadisticas/estadisticasFormalSlice';
import { filtrosPorAnio } from '../filtrosPorAnio';

const FinalizadosVsEjecucionChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { finalizadosVsEjecucion, loading } = useSelector((state) => state.estadisticasFormal);

  useEffect(() => {
    dispatch(fetchFinalizadosVsEjecucion(filtrosPorAnio(comunes)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.responsableSeleccionado, comunes.interno]);

  const chartData = useMemo(() => ({
    labels: finalizadosVsEjecucion.map((r) => r.anio),
    datasets: [
      { label: 'Finalizados', data: finalizadosVsEjecucion.map((r) => r.finalizados), backgroundColor: '#FF6384' },
      { label: 'En ejecución', data: finalizadosVsEjecucion.map((r) => r.en_ejecucion), backgroundColor: '#36A2EB' },
    ],
  }), [finalizadosVsEjecucion]);

  return (
    <Panel header="Finalizados vs. en ejecución por año" toggleable collapsed>
      {loading.finalizadosVsEjecucion ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default FinalizadosVsEjecucionChart;