// src/domains/estadisticas/components/estadisticasFormal/estadisticasFormalDashboard/charts/ProduccionPorAnioChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchProduccionPorAnio } from '../../../../../../features/estadisticas/estadisticasFormalSlice';
import { filtrosPorAnio } from '../filtrosPorAnio';

const ProduccionPorAnioChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { produccionPorAnio, loading } = useSelector((state) => state.estadisticasFormal);

  useEffect(() => {
    dispatch(fetchProduccionPorAnio(filtrosPorAnio(comunes)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.responsableSeleccionado, comunes.interno]);

  const chartData = useMemo(() => ({
    labels: produccionPorAnio.map((r) => r.anio),
    datasets: [{ label: 'Proyectos cerrados con producción', data: produccionPorAnio.map((r) => r.total), backgroundColor: '#8BC34A' }],
  }), [produccionPorAnio]);

  return (
    <Panel header="Producción (proyectos cerrados) por año" toggleable collapsed>
      {loading.produccionPorAnio ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default ProduccionPorAnioChart;