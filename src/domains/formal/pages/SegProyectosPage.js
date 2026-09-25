// src/domains/formal/pages/SegProyectosPage.js
import React from 'react';
import SegProyectosTable from '../components/proyectos/SegProyectosTable';

const SegProyectosPage = () => {
  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <SegProyectosTable />
      </div>
    </div>
  );
};

export default SegProyectosPage;
