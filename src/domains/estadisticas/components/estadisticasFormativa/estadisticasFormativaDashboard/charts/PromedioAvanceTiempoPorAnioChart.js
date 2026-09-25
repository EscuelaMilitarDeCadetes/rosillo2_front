// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/charts/PromedioAvanceTiempoPorAnioChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchPromedioAvanceTiempoPorAnio } from '../../../../../../features/estadisticas/estadisticasFormativaSlice';


const PromedioAvanceTiempoPorAnioChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { promedioAvanceTiempoPorAnio, loading } = useSelector((state) => state.estadisticasFormativa);

  useEffect(() => {
    dispatch(fetchPromedioAvanceTiempoPorAnio({ modalidad_id: comunes.modalidadId, facultad_id: comunes.facultadId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.modalidadId, comunes.facultadId]);

  const chartData = useMemo(() => ({
    labels: promedioAvanceTiempoPorAnio.map((r) => r.anio),
    datasets: [{
      label: '% de avance en tiempo (promedio)',
      data: promedioAvanceTiempoPorAnio.map((r) => r.promedio_avance_tiempo),
      backgroundColor: '#36A2EB',
    }],
  }), [promedioAvanceTiempoPorAnio]);

  return (
    <Panel header="Promedio de avance en tiempo por año (procesos activos)" toggleable collapsed>
      {loading.promedioAvanceTiempoPorAnio ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default PromedioAvanceTiempoPorAnioChart;