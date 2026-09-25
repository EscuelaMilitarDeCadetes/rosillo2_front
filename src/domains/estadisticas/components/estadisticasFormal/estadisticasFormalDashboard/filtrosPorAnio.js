// src/domains/estadisticas/components/estadisticasFormal/estadisticasFormalDashboard/filtrosPorAnio.js
/**
 * Traduce los filtros comunes al shape que esperan los endpoints "por año"
 */
export const filtrosPorAnio = (comunes) => ({
  interno: comunes.interno,
  facultad_id: comunes.responsableSeleccionado?.tipo === 'facultad' ? comunes.responsableSeleccionado.id : null,
  grupo_id: comunes.responsableSeleccionado?.tipo === 'grupo' ? comunes.responsableSeleccionado.id : null,
});