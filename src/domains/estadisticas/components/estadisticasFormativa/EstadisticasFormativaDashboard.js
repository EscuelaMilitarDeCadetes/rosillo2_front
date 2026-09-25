// src/domains/estadisticas/components/estadisticasFormativa/EstadisticasFormativaDashboard.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOpcionesFiltroFormativa } from '../../../../features/estadisticas/estadisticasFormativaSlice';
import FiltrosComunes from './estadisticasFormativaDashboard/FiltrosComunes';
import ProcesosPorAnioChart from './estadisticasFormativaDashboard/charts/ProcesosPorAnioChart';
import ProcesosPorModalidadChart from './estadisticasFormativaDashboard/charts/ProcesosPorModalidadChart';
import AprobadosVsReprobadosChart from './estadisticasFormativaDashboard/charts/AprobadosVsReprobadosChart';
import PromedioNotaFinalChart from './estadisticasFormativaDashboard/charts/PromedioNotaFinalChart';
import ProcesosPorEstadoGeneralChart from './estadisticasFormativaDashboard/charts/ProcesosPorEstadoGeneralChart';
import SegundaInstanciaPorAnioChart from './estadisticasFormativaDashboard/charts/SegundaInstanciaPorAnioChart';
import PromedioAvanceChart from './estadisticasFormativaDashboard/charts/PromedioAvanceChart';
import PromedioAvanceTiempoPorAnioChart from './estadisticasFormativaDashboard/charts/PromedioAvanceTiempoPorAnioChart';
import CertificacionesPorTipoYAnioChart from './estadisticasFormativaDashboard/charts/CertificacionesPorTipoYAnioChart';
import TasaAprobacionChart from './estadisticasFormativaDashboard/charts/TasaAprobacionChart';
import PromedioHorasAcumuladasChart from './estadisticasFormativaDashboard/charts/PromedioHorasAcumuladasChart';
import DistribucionEstadoActualChart from './estadisticasFormativaDashboard/charts/DistribucionEstadoActualChart';

const EstadisticasFormativaDashboard = () => {
  const dispatch = useDispatch();
  const { opcionesFiltro } = useSelector((state) => state.estadisticasFormativa);
  const [comunes, setComunes] = useState({ modalidadId: null, facultadId: null });

  useEffect(() => {
    dispatch(fetchOpcionesFiltroFormativa());
  }, [dispatch]);

  const handleChangeComun = (campo, valor) => setComunes((prev) => ({ ...prev, [campo]: valor }));

  return (
    <div>
      <h2 className="mb-3">Tablero de estadísticas — Investigación Formativa</h2>
      <div className="card p-3 mb-4" style={{ backgroundColor: '#EAEDED' }}>
        <FiltrosComunes opciones={opcionesFiltro} filtros={comunes} onChange={handleChangeComun} />
      </div>
      <div className="d-flex flex-column gap-3">
        <ProcesosPorAnioChart comunes={comunes} />
        <ProcesosPorModalidadChart comunes={comunes} />
        <AprobadosVsReprobadosChart comunes={comunes} />
        <TasaAprobacionChart comunes={comunes} />
        <PromedioNotaFinalChart comunes={comunes} />
        <PromedioAvanceChart comunes={comunes} />
        <PromedioAvanceTiempoPorAnioChart comunes={comunes} />
        <PromedioHorasAcumuladasChart comunes={comunes} />
        <ProcesosPorEstadoGeneralChart comunes={comunes} />
        <DistribucionEstadoActualChart comunes={comunes} />
        <SegundaInstanciaPorAnioChart comunes={comunes} />
        <CertificacionesPorTipoYAnioChart comunes={comunes} />
      </div>
    </div>
  );
};

export default EstadisticasFormativaDashboard;