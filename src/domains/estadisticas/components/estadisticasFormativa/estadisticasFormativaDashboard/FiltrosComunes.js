// src/domains/estadisticas/components/estadisticasFormativa/estadisticasFormativaDashboard/FiltrosComunes.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import useHasRole from '../../../../../hooks/useHasRole';


const FiltrosComunes = ({ opciones, filtros, onChange }) => {
  const esFacultad = useHasRole('FACULTAD');
  const { facultadId } = useSelector((state) => state.auth);

  const opcionesModalidad = [
    { label: 'Todas', value: null },
    ...(opciones.modalidades || []).map((m) => ({ label: m.nombre, value: m.id })),
  ];

  const opcionesFacultad = [
    { label: 'Todas', value: null },
    ...(opciones.facultades || []).map((f) => ({
      label: `${f.nombre_facultad} (${f.abreviatura})`,
      value: f.id,
    })),
  ];

  const facultadValor = esFacultad ? facultadId : filtros.facultadId;

  return (
    <div className="row g-3 align-items-end mb-3">
      <div className="col-md-4">
        <label className="form-label">Modalidad</label>
        <Dropdown
          value={filtros.modalidadId}
          options={opcionesModalidad}
          onChange={(e) => onChange('modalidadId', e.value)}
          placeholder="Todas"
          className="w-100"
          showClear
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">Facultad</label>
        <Dropdown
          value={facultadValor}
          options={opcionesFacultad}
          onChange={(e) => onChange('facultadId', e.value)}
          placeholder="Todas"
          className="w-100"
          showClear={!esFacultad}
          disabled={esFacultad}
        />
      </div>
    </div>
  );
};
export default FiltrosComunes;