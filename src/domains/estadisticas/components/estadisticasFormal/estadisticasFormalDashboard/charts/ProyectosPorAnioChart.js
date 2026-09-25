// src/domains/estadisticas/components/estadisticasFormal/estadisticasFormalDashboard/charts/ProyectosPorAnioChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchProyectosPorAnio } from '../../../../../../features/estadisticas/estadisticasFormalSlice';
import { filtrosPorAnio } from '../filtrosPorAnio';

const ProyectosPorAnioChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { proyectosPorAnio, loading } = useSelector((state) => state.estadisticasFormal);

  useEffect(() => {
    dispatch(fetchProyectosPorAnio(filtrosPorAnio(comunes)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.responsableSeleccionado, comunes.interno]);

  const chartData = useMemo(() => ({
    labels: proyectosPorAnio.map((r) => r.anio),
    datasets: [{ label: 'Proyectos', data: proyectosPorAnio.map((r) => r.total), backgroundColor: '#4BC0C0' }],
  }), [proyectosPorAnio]);

  return (
    <Panel header="Total de proyectos por año" toggleable collapsed>
      {loading.proyectosPorAnio ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default ProyectosPorAnioChart;