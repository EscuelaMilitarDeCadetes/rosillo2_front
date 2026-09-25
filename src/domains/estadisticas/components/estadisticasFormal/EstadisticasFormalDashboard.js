// src/domains/estadisticas/components/estadisticasFormal/EstadisticasFormalDashboard.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOpcionesFiltro } from '../../../../features/estadisticas/estadisticasFormalSlice';
import FiltrosComunes from './estadisticasFormalDashboard/FiltrosComunes';
import ProyectosPorEntidadChart from './estadisticasFormalDashboard/charts/ProyectosPorEntidadChart';
import ProductosPorEntidadChart from './estadisticasFormalDashboard/charts/ProductosPorEntidadChart';
import ProyectosPorAnioChart from './estadisticasFormalDashboard/charts/ProyectosPorAnioChart';
import ProduccionPorAnioChart from './estadisticasFormalDashboard/charts/ProduccionPorAnioChart';
import FinalizadosVsEjecucionChart from './estadisticasFormalDashboard/charts/FinalizadosVsEjecucionChart';
import EjecucionPresupuestalChart from './estadisticasFormalDashboard/charts/EjecucionPresupuestalChart';
import AvancePonderadoChart from './estadisticasFormalDashboard/charts/AvancePonderadoChart';

const EstadisticasFormalDashboard = () => {
  const dispatch = useDispatch();
  const { opcionesFiltro } = useSelector((state) => state.estadisticasFormal);
  const [comunes, setComunes] = useState({ responsableSeleccionado: null, interno: null });

  useEffect(() => {
    dispatch(fetchOpcionesFiltro());
  }, [dispatch]);

  const handleChangeComun = (campo, valor) => setComunes((prev) => ({ ...prev, [campo]: valor }));

  return (
    <div>
      <h2 className="mb-3">Tablero de estadísticas</h2>
      <div className="card p-3 mb-4" style={{ backgroundColor: '#EAEDED' }}>
        <FiltrosComunes opciones={opcionesFiltro} filtros={comunes} onChange={handleChangeComun} />
      </div>
      <div className="d-flex flex-column gap-3">
        <ProyectosPorEntidadChart opciones={opcionesFiltro} comunes={comunes} />
        <ProductosPorEntidadChart comunes={comunes} />
        <ProyectosPorAnioChart comunes={comunes} />
        <ProduccionPorAnioChart comunes={comunes} />
        <FinalizadosVsEjecucionChart comunes={comunes} />
        <EjecucionPresupuestalChart comunes={comunes} />
        <AvancePonderadoChart comunes={comunes} />
      </div>
    </div>
  );
};

export default EstadisticasFormalDashboard;