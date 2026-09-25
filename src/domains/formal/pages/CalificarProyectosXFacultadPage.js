// src/domains/formal/pages/CalificarProyectosXFacultadPage.js
import React from 'react';
import CalificacionPorResponsableTable from '../components/calificaciones/CalificacionPorResponsableTable';

const CalificarProyectosXFacultadPage = () => (
  <CalificacionPorResponsableTable scope="facultad" rolRequerido="FACULTAD" />
);
export default CalificarProyectosXFacultadPage;