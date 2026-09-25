// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/charts/ProcesosPorEstadoGeneralChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchProcesosPorEstadoGeneral } from '../../../../../../features/estadisticas/estadisticasFormativaSlice';
import { COLOR_PALETA } from '../constants';

const ProcesosPorEstadoGeneralChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { procesosPorEstadoGeneral, loading } = useSelector((state) => state.estadisticasFormativa);

  useEffect(() => {
    dispatch(fetchProcesosPorEstadoGeneral({ modalidad_id: comunes.modalidadId, facultad_id: comunes.facultadId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.modalidadId, comunes.facultadId]);

  const chartData = useMemo(() => ({
    labels: procesosPorEstadoGeneral.map((r) => r.estado_general),
    datasets: [{
      data: procesosPorEstadoGeneral.map((r) => r.total),
      backgroundColor: COLOR_PALETA,
    }],
  }), [procesosPorEstadoGeneral]);

  return (
    <Panel header="Procesos por estado general" toggleable collapsed>
      {loading.procesosPorEstadoGeneral ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="pie" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default ProcesosPorEstadoGeneralChart;