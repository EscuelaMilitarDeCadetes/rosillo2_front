// src/domains/estadisticas/components/estadisticasFormal/estadisticasFormalDashboard/charts/ProductosPorEntidadChart.js
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchProductosPorEntidad } from '../../../../../../features/estadisticas/estadisticasFormalSlice';
import { OPCIONES_BOOLEAN, COLOR_PALETA } from '../constants';

const ProductosPorEntidadChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { productosPorEntidad, loading } = useSelector((state) => state.estadisticasFormal);
  const [propios, setPropios] = useState({ producto: '', grupoMinciencias: '', gruplac: null, estado: null });

  useEffect(() => {
    dispatch(fetchProductosPorEntidad({
      producto: propios.producto || null,
      responsable: comunes.responsableSeleccionado?.texto || null,
      grupo_minciencias: propios.grupoMinciencias || null,
      gruplac: propios.gruplac,
      estado: propios.estado,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.responsableSeleccionado, propios]);

  const chartData = useMemo(() => {
    const anios = [...new Set(productosPorEntidad.map((r) => r.anio))].sort();
    const categorias = [...new Set(productosPorEntidad.map((r) => r.nombre_entidad))];
    const datasets = anios.map((anio, i) => ({
      label: String(anio),
      backgroundColor: COLOR_PALETA[i % COLOR_PALETA.length],
      data: categorias.map((producto) => {
        const fila = productosPorEntidad.find((r) => r.nombre_entidad === producto && r.anio === anio);
        return fila ? fila.total : 0;
      }),
    }));
    return { labels: categorias, datasets };
  }, [productosPorEntidad]);

  return (
    <Panel header="Producción científica por producto y año" toggleable collapsed>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <InputText placeholder="Producto" value={propios.producto}
            onChange={(e) => setPropios((p) => ({ ...p, producto: e.target.value }))} className="w-100" />
        </div>
        <div className="col-md-4">
          <InputText placeholder="Grupo Minciencias" value={propios.grupoMinciencias}
            onChange={(e) => setPropios((p) => ({ ...p, grupoMinciencias: e.target.value }))} className="w-100" />
        </div>
        <div className="col-md-4">
          <Dropdown
            value={propios.gruplac}
            options={[{ label: 'Gruplac: Todas', value: null }, ...OPCIONES_BOOLEAN.slice(1)]}
            onChange={(e) => setPropios((p) => ({ ...p, gruplac: e.value }))}
            className="w-100"
          />
        </div>
      </div>
      {loading.productosPorEntidad ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 420 }} />
      )}
    </Panel>
  );
};

export default ProductosPorEntidadChart;