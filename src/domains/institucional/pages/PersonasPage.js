// src/domains/institucional/pages/PersonasPage.js
import React from 'react';
import PersonaTable from '../components/personas/PersonaTable';

const PersonasPage = () => (
  <div className="container-fluid mt-4">
    <div className="card p-3">
      <PersonaTable />
    </div>
  </div>
);

export default PersonasPage;