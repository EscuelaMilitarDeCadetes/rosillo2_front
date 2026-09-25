// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/charts/SegundaInstanciaPorAnioChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchSegundaInstanciaPorAnio } from '../../../../../../features/estadisticas/estadisticasFormativaSlice';

const SegundaInstanciaPorAnioChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { segundaInstanciaPorAnio, loading } = useSelector((state) => state.estadisticasFormativa);

  useEffect(() => {
    dispatch(fetchSegundaInstanciaPorAnio({ modalidad_id: comunes.modalidadId, facultad_id: comunes.facultadId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.modalidadId, comunes.facultadId]);

  const chartData = useMemo(() => ({
    labels: segundaInstanciaPorAnio.map((r) => r.anio),
    datasets: [{ label: 'Segundas instancias consumidas', data: segundaInstanciaPorAnio.map((r) => r.total), backgroundColor: '#FF9F40' }],
  }), [segundaInstanciaPorAnio]);

  return (
    <Panel header="Segundas instancias consumidas por año" toggleable collapsed>
      {loading.segundaInstanciaPorAnio ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default SegundaInstanciaPorAnioChart;