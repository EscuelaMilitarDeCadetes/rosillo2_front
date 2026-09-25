// src/domains/common/pages/RecordatoriosPage.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Message } from 'primereact/message';
import EnviarRecordatoriosPanel from '../components/notificacion/EnviarRecordatoriosPanel';

// El backend restringe notificacion/enviar-recordatorios/ a IsAdminUser
// (usuarios con is_staff=True), no a un rol de negocio. Se replica
// exactamente esa condición en el frontend.
const RecordatoriosPage = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user?.is_staff) {
    return (
      <div className="container-fluid mt-4">
        <Message severity="warn" text="No tiene permisos de administrador para acceder a esta página." />
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <h5 className="mb-3">Recordatorios Masivos de Tareas</h5>
        <EnviarRecordatoriosPanel />
      </div>
    </div>
  );
};

export default RecordatoriosPage;