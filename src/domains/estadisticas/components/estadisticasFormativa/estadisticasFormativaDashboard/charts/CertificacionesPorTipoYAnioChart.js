// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/charts/CertificacionesPorTipoYAnioChart.js
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchCertificacionesPorTipoYAnio } from '../../../../../../features/estadisticas/estadisticasFormativaSlice';
import { COLOR_PALETA } from '../constants';


const CertificacionesPorTipoYAnioChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { certificacionesPorTipoYAnio, loading } = useSelector((state) => state.estadisticasFormativa);

  useEffect(() => {
    dispatch(fetchCertificacionesPorTipoYAnio({ modalidad_id: comunes.modalidadId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.modalidadId]);

  const chartData = useMemo(() => {
    const anios = [...new Set(certificacionesPorTipoYAnio.map((r) => r.anio))].sort();
    const tipos = [...new Set(certificacionesPorTipoYAnio.map((r) => r.tipo))];
    const datasets = tipos.map((tipo, i) => ({
      label: tipo,
      backgroundColor: COLOR_PALETA[i % COLOR_PALETA.length],
      data: anios.map((anio) => {
        const fila = certificacionesPorTipoYAnio.find((r) => r.anio === anio && r.tipo === tipo);
        return fila ? fila.total : 0;
      }),
    }));
    return { labels: anios, datasets };
  }, [certificacionesPorTipoYAnio]);

  const chartOptions = useMemo(() => ({
    scales: { x: { stacked: true }, y: { stacked: true } },
  }), []);

  return (
    <Panel header="Certificaciones externas por tipo y año" toggleable collapsed>
      {loading.certificacionesPorTipoYAnio ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} options={chartOptions} style={{ maxHeight: 380 }} />
      )}
    </Panel>
  );
};

export default CertificacionesPorTipoYAnioChart;