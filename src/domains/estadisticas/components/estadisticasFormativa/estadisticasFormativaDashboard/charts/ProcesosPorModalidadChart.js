// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/charts/ProcesosPorModalidadChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchProcesosPorModalidad } from '../../../../../../features/estadisticas/estadisticasFormativaSlice';

const ProcesosPorModalidadChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { procesosPorModalidad, loading } = useSelector((state) => state.estadisticasFormativa);

  useEffect(() => {
    dispatch(fetchProcesosPorModalidad({ facultad_id: comunes.facultadId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.facultadId]);

  const chartData = useMemo(() => ({
    labels: procesosPorModalidad.map((r) => r.flujo_version__modalidad__nombre),
    datasets: [{ label: 'Procesos', data: procesosPorModalidad.map((r) => r.total), backgroundColor: '#36A2EB' }],
  }), [procesosPorModalidad]);

  return (
    <Panel header="Procesos formativos por modalidad" toggleable collapsed>
      {loading.procesosPorModalidad ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default ProcesosPorModalidadChart;