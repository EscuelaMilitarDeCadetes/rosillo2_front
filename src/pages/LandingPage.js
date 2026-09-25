// src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';

/**
 * Portada pública del proyecto 
 */
const LandingPage = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center text-center mb-5">
        <div className="col-lg-8">
          <h1 className="fw-bold">Sistema de Investigación José María Rosillo</h1>
          <p className="lead mt-3">
            Plataforma institucional para la gestión de proyectos, convocatorias
            y procesos de investigación formal y formativa desarrollados dentro de la institución. Desde aquí puedes
            acceder al sistema de <strong>Investigación Formal</strong>{' '}
            (convocatorias, proyectos, calificaciones y seguimiento) o al de{' '}
            <strong>Investigación Formativa</strong> (procesos formativos,
            postulaciones, tutorías y evaluación de trabajos de grado).
          </p>
        </div>
      </div>

      <div className="row justify-content-center g-4">
        <div className="col-md-5">
          <div className="card h-100 shadow-sm text-center p-4">
            <h3>Investigación Formal</h3>
            <p className="text-muted">
              Convocatorias, proyectos, calificaciones, presupuestos y
              seguimiento de proyectos de investigación.
            </p>
            <Link to="/login/formal">
              <Button label="Ingresar a Investigación Formal" className="w-100" />
            </Link>
          </div>
        </div>

        <div className="col-md-5">
          <div className="card h-100 shadow-sm text-center p-4">
            <h3>Investigación Formativa</h3>
            <p className="text-muted">
              Procesos formativos, postulaciones, tutorías y evaluación de
              trabajos de grado.
            </p>
            <Link to="/login/formativa">
              <Button
                label="Ingresar a Investigación Formativa"
                className="w-100 p-button-outlined"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;