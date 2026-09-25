// src/domains/integracion/pages/VinculacionFacultadPage.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import CrearUsuarioFacultadModal from '../components/vinculacionFacultad/CrearUsuarioFacultadModal';
import {
  crearEstudianteFacultad,
  crearJuradoFacultad,
  crearTutorFacultad,
  limpiarResultadoVinculacionFacultad,
  limpiarErrorVinculacionFacultad,
} from '../../../features/integracion/vinculacionFacultadSlice';

const TIPOS = [
  { tipo: 'ESTUDIANTE', crearThunk: crearEstudianteFacultad, titulo: 'Crear Estudiante', icon: 'pi pi-user-plus', label: 'Nuevo Estudiante' },
  { tipo: 'JURADO', crearThunk: crearJuradoFacultad, titulo: 'Crear Jurado', icon: 'pi pi-briefcase', label: 'Nuevo Jurado' },
  { tipo: 'TUTOR', crearThunk: crearTutorFacultad, titulo: 'Crear Tutor', icon: 'pi pi-user-edit', label: 'Nuevo Tutor' },
];

/**
 * Página exclusiva del rol FACULTAD: los tres únicos flujos de creación de
 * usuario que puede ejecutar ese rol (VinculacionViewSet.crear_estudiante/
 * crear_jurado/crear_tutor, todos con permission_classes=[EsFacultad]).
 */
const VinculacionFacultadPage = () => {
  const dispatch = useDispatch();
  const [modalActivo, setModalActivo] = useState(null);

  const handleAbrir = (config) => setModalActivo(config);

  const handleCerrar = () => {
    dispatch(limpiarResultadoVinculacionFacultad());
    dispatch(limpiarErrorVinculacionFacultad());
    setModalActivo(null);
  };

  return (
    <div className="container-fluid mt-4">
      <h4 className="mb-3">Vinculación de Usuarios — Facultad</h4>
      <div className="grid">
        {TIPOS.map((config) => (
          <div className="col-12 md:col-4" key={config.tipo}>
            <Card>
              <div className="flex flex-column align-items-center gap-3 p-2">
                <i className={config.icon} style={{ fontSize: '2rem' }} />
                <span className="font-semibold">{config.titulo}</span>
                <Button label={config.label} onClick={() => handleAbrir(config)} />
              </div>
            </Card>
          </div>
        ))}
      </div>
      {modalActivo && (
        <CrearUsuarioFacultadModal
          visible={Boolean(modalActivo)}
          onHide={handleCerrar}
          tipo={modalActivo.tipo}
          crearThunk={modalActivo.crearThunk}
          titulo={modalActivo.titulo}
        />
      )}
    </div>
  );
};

export default VinculacionFacultadPage;