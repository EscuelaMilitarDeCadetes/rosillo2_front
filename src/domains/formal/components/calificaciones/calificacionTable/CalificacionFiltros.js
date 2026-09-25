// src/domains/formal/components/calificaciones/calificacionTable/CalificacionFiltros.js
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { OPCIONES_FINANCIADO, OPCIONES_RESULTADO } from './constants';

const CalificacionFiltros = ({
  tabIndex,
  filtroTitulo, onFiltroTitulo,
  filtroConvocatoria, onFiltroConvocatoria,
  filtroResponsable, onFiltroResponsable,
  filtroFinanciado, onFiltroFinanciado,
  filtroFase, onFiltroFase, opcionesFase,
  filtroResultado, onFiltroResultado,
}) => (
  <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
    <span className="p-input-icon-left">
      <i className="pi pi-search" />
      <InputText value={filtroTitulo} onChange={(e) => onFiltroTitulo(e.target.value)} placeholder="Título del proyecto" />
    </span>
    <InputText value={filtroConvocatoria} onChange={(e) => onFiltroConvocatoria(e.target.value)} placeholder="Convocatoria" />
    <InputText value={filtroResponsable} onChange={(e) => onFiltroResponsable(e.target.value)} placeholder="Responsable (facultad/grupo)" />
    <Dropdown value={filtroFinanciado} options={OPCIONES_FINANCIADO} onChange={(e) => onFiltroFinanciado(e.value)} placeholder="Financiado" />
    <Dropdown value={filtroFase} options={opcionesFase} onChange={(e) => onFiltroFase(e.value)} placeholder="Última fase calificada" />
    {tabIndex === 1 && (
      <Dropdown value={filtroResultado} options={OPCIONES_RESULTADO} onChange={(e) => onFiltroResultado(e.value)} placeholder="Resultado" />
    )}
  </div>
);

export default CalificacionFiltros;