// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/charts/PromedioAvanceChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchPromedioAvancePorModalidad } from '../../../../../../features/estadisticas/estadisticasFormativaSlice';

const PromedioAvanceChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { promedioAvancePorModalidad, loading } = useSelector((state) => state.estadisticasFormativa);

  useEffect(() => {
    dispatch(fetchPromedioAvancePorModalidad({ facultad_id: comunes.facultadId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.facultadId]);

  const chartData = useMemo(() => ({
    labels: promedioAvancePorModalidad.map((r) => r.flujo_version__modalidad__nombre),
    datasets: [{
      label: '% de avance promedio',
      data: promedioAvancePorModalidad.map((r) => Number(r.promedio_avance?.toFixed ? r.promedio_avance.toFixed(2) : r.promedio_avance)),
      backgroundColor: '#9966FF',
    }],
  }), [promedioAvancePorModalidad]);

  return (
    <Panel header="Promedio de avance por modalidad" toggleable collapsed>
      {loading.promedioAvancePorModalidad ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default PromedioAvanceChart;