// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/charts/AprobadosVsReprobadosChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchAprobadosVsReprobadosPorAnio } from '../../../../../../features/estadisticas/estadisticasFormativaSlice';

const AprobadosVsReprobadosChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { aprobadosVsReprobadosPorAnio, loading } = useSelector((state) => state.estadisticasFormativa);

  useEffect(() => {
    dispatch(fetchAprobadosVsReprobadosPorAnio({ modalidad_id: comunes.modalidadId, facultad_id: comunes.facultadId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.modalidadId, comunes.facultadId]);

  const chartData = useMemo(() => ({
    labels: aprobadosVsReprobadosPorAnio.map((r) => r.anio),
    datasets: [
      { label: 'Aprobados', data: aprobadosVsReprobadosPorAnio.map((r) => r.aprobados), backgroundColor: '#8BC34A' },
      { label: 'No aprobados', data: aprobadosVsReprobadosPorAnio.map((r) => r.no_aprobados), backgroundColor: '#FF6384' },
    ],
  }), [aprobadosVsReprobadosPorAnio]);

  return (
    <Panel header="Aprobados vs. no aprobados por año" toggleable collapsed>
      {loading.aprobadosVsReprobadosPorAnio ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default AprobadosVsReprobadosChart;