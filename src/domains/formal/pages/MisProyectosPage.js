// src/domains/formal/pages/MisProyectosPage.js
import React from 'react';
import ProyectosUsuarioTable from '../components/convocatorias/ProyectosUsuarioTable';

const MisProyectosPage = () => {
  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <ProyectosUsuarioTable />
      </div>
    </div>
  );
};

export default MisProyectosPage;