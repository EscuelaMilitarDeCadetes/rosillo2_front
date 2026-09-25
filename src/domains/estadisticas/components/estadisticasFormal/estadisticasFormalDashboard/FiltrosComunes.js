// src/domains/estadisticas/components/estadisticasFormal/estadisticasFormalDashboard/FiltrosComunes.js
import React, { useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { OPCIONES_TIPO_CONVOCATORIA } from './constants';

/**
 * Filtros comunes: aplican a las 7 tarjetas donde tiene sentido
 */
const FiltrosComunes = ({ opciones, filtros, onChange }) => {
  const opcionesResponsable = useMemo(() => {
    const facultades = (opciones.facultades || []).map((f) => ({
      label: `${f.nombre_facultad} (${f.abreviatura})`,
      value: { tipo: 'facultad', id: f.id, texto: f.abreviatura },
    }));
    const grupos = (opciones.grupos || []).map((g) => ({
      label: `${g.nombre_grupo} (${g.sigla_grupo})`,
      value: { tipo: 'grupo', id: g.id, texto: g.sigla_grupo },
    }));
    return [{ label: 'Todos', value: null }, ...facultades, ...grupos];
  }, [opciones]);

  return (
    <div className="row g-3 align-items-end mb-3">
      <div className="col-md-4">
        <label className="form-label">Facultad / Grupo</label>
        <Dropdown
          value={filtros.responsableSeleccionado}
          options={opcionesResponsable}
          onChange={(e) => onChange('responsableSeleccionado', e.value)}
          placeholder="Todos"
          className="w-100"
          showClear
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">Tipo de convocatoria</label>
        <Dropdown
          value={filtros.interno}
          options={OPCIONES_TIPO_CONVOCATORIA}
          onChange={(e) => onChange('interno', e.value)}
          className="w-100"
        />
      </div>
    </div>
  );
};

export default FiltrosComunes;