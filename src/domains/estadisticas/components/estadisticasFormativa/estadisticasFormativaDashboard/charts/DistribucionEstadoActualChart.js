// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/charts/DistribucionEstadoActualChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchDistribucionEstadoActual } from '../../../../../../features/estadisticas/estadisticasFormativaSlice';
import { COLOR_PALETA } from '../constants';


const DistribucionEstadoActualChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { distribucionEstadoActual, loading } = useSelector((state) => state.estadisticasFormativa);

  useEffect(() => {
    dispatch(fetchDistribucionEstadoActual({ modalidad_id: comunes.modalidadId, facultad_id: comunes.facultadId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.modalidadId, comunes.facultadId]);

  const chartData = useMemo(() => ({
    labels: distribucionEstadoActual.map((r) => r.estado_actual),
    datasets: [{ data: distribucionEstadoActual.map((r) => r.total), backgroundColor: COLOR_PALETA }],
  }), [distribucionEstadoActual]);

  return (
    <Panel header="Distribución por estado actual" toggleable collapsed>
      {loading.distribucionEstadoActual ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="pie" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default DistribucionEstadoActualChart;