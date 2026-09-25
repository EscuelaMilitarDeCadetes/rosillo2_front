// src/domains/formal/pages/UserConvocatoriaPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import ConvocatoriasAbiertasTable from '../components/convocatorias/ConvocatoriasAbiertasTable';

const UserConvocatoriaPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-end mb-3">
        <Button
          label="Mis Proyectos"
          icon="pi pi-folder"
          className="p-button-outlined"
          onClick={() => navigate('/mis-proyectos')}
        />
      </div>
      <div className="card">
        <ConvocatoriasAbiertasTable />
      </div>
    </div>
  );
};

export default UserConvocatoriaPage;