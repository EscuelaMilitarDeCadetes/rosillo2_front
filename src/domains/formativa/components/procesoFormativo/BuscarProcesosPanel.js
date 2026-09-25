// src/domains/formativa/components/procesoFormativo/BuscarProcesosPanel.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Panel } from 'primereact/panel';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { establecerFiltrosBusquedaProceso } from '../../../../features/procesoFormativo/procesoFormativoSlice';

const OPCIONES_BOOL = [
  { label: 'Cualquiera', value: null },
  { label: 'Sí', value: true },
  { label: 'No', value: false },
];

const ESTADO_INICIAL = {
  modalidad: null,
  facultad: null,
  estado_general: '',
  aprobado: null,
  anio_inicio: null,
  anio_fin: null,
  persona: null,
  requiere_sustentacion: null,
};

/**
 * Filtros de "buscar()" (paginado). Cada campo se envía como query param
 * solo si tiene valor; el backend ignora los que llegan vacíos/null.
 */
const BuscarProcesosPanel = () => {
  const dispatch = useDispatch();
  const [filtros, setFiltros] = useState(ESTADO_INICIAL);

  const handleChange = (name, value) => setFiltros((prev) => ({ ...prev, [name]: value }));

  const handleBuscar = () => {
    const limpios = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== null && v !== '')
    );
    dispatch(establecerFiltrosBusquedaProceso(limpios));
  };

  const handleLimpiar = () => {
    setFiltros(ESTADO_INICIAL);
    dispatch(establecerFiltrosBusquedaProceso({}));
  };

  return (
    <Panel header="Búsqueda avanzada" toggleable collapsed className="mb-3">
      <div className="formgrid grid">
        <div className="field mb-2 col-6 md:col-3">
          <label>ID Modalidad</label>
          <InputNumber value={filtros.modalidad} onValueChange={(e) => handleChange('modalidad', e.value)} useGrouping={false} />
        </div>
        <div className="field mb-2 col-6 md:col-3">
          <label>ID Facultad</label>
          <InputNumber value={filtros.facultad} onValueChange={(e) => handleChange('facultad', e.value)} useGrouping={false} />
        </div>
        <div className="field mb-2 col-6 md:col-3">
          <label>ID Persona</label>
          <InputNumber value={filtros.persona} onValueChange={(e) => handleChange('persona', e.value)} useGrouping={false} />
        </div>
        <div className="field mb-2 col-6 md:col-3">
          <label>Estado General</label>
          <InputText value={filtros.estado_general} onChange={(e) => handleChange('estado_general', e.target.value)} />
        </div>
        <div className="field mb-2 col-6 md:col-3">
          <label>Aprobado</label>
          <Dropdown value={filtros.aprobado} options={OPCIONES_BOOL} onChange={(e) => handleChange('aprobado', e.value)} />
        </div>
        <div className="field mb-2 col-6 md:col-3">
          <label>Requiere Sustentación</label>
          <Dropdown value={filtros.requiere_sustentacion} options={OPCIONES_BOOL} onChange={(e) => handleChange('requiere_sustentacion', e.value)} />
        </div>
        <div className="field mb-2 col-6 md:col-3">
          <label>Año Inicio</label>
          <InputNumber value={filtros.anio_inicio} onValueChange={(e) => handleChange('anio_inicio', e.value)} useGrouping={false} />
        </div>
        <div className="field mb-2 col-6 md:col-3">
          <label>Año Fin</label>
          <InputNumber value={filtros.anio_fin} onValueChange={(e) => handleChange('anio_fin', e.value)} useGrouping={false} />
        </div>
      </div>
      <div className="flex justify-content-end gap-2 mt-2">
        <Button label="Limpiar" className="p-button-text p-button-sm" onClick={handleLimpiar} />
        <Button label="Buscar" icon="pi pi-search" className="p-button-sm" onClick={handleBuscar} />
      </div>
    </Panel>
  );
};

export default BuscarProcesosPanel;