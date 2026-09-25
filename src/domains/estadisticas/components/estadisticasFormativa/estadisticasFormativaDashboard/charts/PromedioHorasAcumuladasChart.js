// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/charts/PromedioHorasAcumuladasChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchPromedioHorasAcumuladasPorModalidad } from '../../../../../../features/estadisticas/estadisticasFormativaSlice';

const PromedioHorasAcumuladasChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { promedioHorasAcumuladasPorModalidad, loading } = useSelector((state) => state.estadisticasFormativa);

  useEffect(() => {
    dispatch(fetchPromedioHorasAcumuladasPorModalidad({ facultad_id: comunes.facultadId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.facultadId]);

  const chartData = useMemo(() => ({
    labels: promedioHorasAcumuladasPorModalidad.map((r) => r.flujo_version__modalidad__nombre),
    datasets: [{
      label: 'Horas acumuladas (promedio)',
      data: promedioHorasAcumuladasPorModalidad.map((r) => Number(r.promedio_horas?.toFixed ? r.promedio_horas.toFixed(1) : r.promedio_horas)),
      backgroundColor: '#FF6384',
    }],
  }), [promedioHorasAcumuladasPorModalidad]);

  return (
    <Panel header="Promedio de horas acumuladas por modalidad" toggleable collapsed>
      {loading.promedioHorasAcumuladasPorModalidad ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default PromedioHorasAcumuladasChart;