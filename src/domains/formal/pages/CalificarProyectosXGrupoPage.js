// src/domains/formal/pages/CalificarProyectosXGrupoPage.js
import React from 'react';
import CalificacionPorResponsableTable from '../components/calificaciones/CalificacionPorResponsableTable';

const CalificarProyectosXGrupoPage = () => (
  <CalificacionPorResponsableTable scope="grupo" rolRequerido="GRUPO" />
);
export default CalificarProyectosXGrupoPage;