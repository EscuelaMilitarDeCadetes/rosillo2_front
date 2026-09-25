// src/domains/estadisticas/components/estadisticasFormal/estadisticasFormalDashboard/charts/ProyectosPorEntidadChart.js
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Panel } from 'primereact/panel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchProyectosPorEntidad } from '../../../../../../features/estadisticas/estadisticasFormalSlice';
import { OPCIONES_BOOLEAN } from '../constants';

const ProyectosPorEntidadChart = ({ comunes }) => {
  const dispatch = useDispatch();
  const { proyectosPorEntidad, loading } = useSelector((state) => state.estadisticasFormal);
  const [propios, setPropios] = useState({ convocatoria: '', anioInicio: null, anioFin: null, gruplac: null, estado: null });

  useEffect(() => {
    dispatch(fetchProyectosPorEntidad({
      convocatoria: propios.convocatoria || null,
      responsable: comunes.responsableSeleccionado?.texto || null,
      anioInicio: propios.anioInicio,
      anioFin: propios.anioFin,
      interno: comunes.interno,
      gruplac: propios.gruplac,
      estado: propios.estado,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comunes.responsableSeleccionado, comunes.interno, propios]);

  const chartData = useMemo(() => ({
    labels: proyectosPorEntidad.map((r) => r.nombre_entidad),
    datasets: [{
      label: 'Proyectos en ejecución',
      data: proyectosPorEntidad.map((r) => r.total),
      backgroundColor: '#36A2EB',
    }],
  }), [proyectosPorEntidad]);

  return (
    <Panel header="Proyectos en ejecución por facultad/grupo" toggleable collapsed>
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <InputText placeholder="Convocatoria" value={propios.convocatoria}
            onChange={(e) => setPropios((p) => ({ ...p, convocatoria: e.target.value }))} className="w-100" />
        </div>
        <div className="col-md-3">
          <InputNumber placeholder="Año de inicio" value={propios.anioInicio}
            onValueChange={(e) => setPropios((p) => ({ ...p, anioInicio: e.value }))} useGrouping={false} className="w-100" />
        </div>
        <div className="col-md-3">
          <InputNumber placeholder="Año de cierre" value={propios.anioFin}
            onValueChange={(e) => setPropios((p) => ({ ...p, anioFin: e.value }))} useGrouping={false} className="w-100" />
        </div>
        <div className="col-md-3">
          <Dropdown
            value={propios.gruplac}
            options={[{ label: 'Gruplac: Todas', value: null }, ...OPCIONES_BOOLEAN.slice(1)]}
            onChange={(e) => setPropios((p) => ({ ...p, gruplac: e.value }))}
            className="w-100"
          />
        </div>
      </div>
      {loading.proyectosPorEntidad ? (
        <ProgressSpinner style={{ width: 40, height: 40 }} />
      ) : (
        <Chart type="bar" data={chartData} style={{ maxHeight: 420 }} />
      )}
    </Panel>
  );
};

export default ProyectosPorEntidadChart;