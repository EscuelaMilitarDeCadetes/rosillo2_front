// src/domains/formal/pages/CalificarProyectosPage.js
import React from 'react';
import CalificacionTable from '../components/calificaciones/CalificacionTable';

const CalificarProyectosPage = () => {
  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <CalificacionTable />
      </div>
    </div>
  );
};

export default CalificarProyectosPage;