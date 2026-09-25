// src/domains/formativa/pages/FormativaHomePage.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProcesosActivos } from '../../../features/procesosInvFormativa/procesosInvFormativaSlice';
import { fetchProcesosPorPersona } from '../../../features/procesoFormativo/procesoFormativoSlice';
import RoleAccessGrid from '../../../components/home/RoleAccessGrid';

const ROLES_CON_PARTICIPACION_PERSONAL = ['ESTUDIANTE', 'TUTOR', 'JURADO'];

/**
 * Nota sobre alcance: a diferencia del dominio "formal", casi todas las
 * rutas de "/formativa/*" en App.js son accesibles a cualquier usuario
 * autenticado con sistemaActivo === 'formativa' (solo "FACULTAD" tiene
 * rutas exclusivas: /integracion/vinculacion-facultad y
 * /estadisticasFormativa). Por eso esta página organiza los accesos por
 * rol a nivel de interfaz (para que cada quien vea primero lo suyo),
 * pero si además se requiere bloquear el acceso real a cada ruta por
 * rol, hay que agregar `allowedRoles` a esos <Route> en App.js.
 */
const SECCIONES_FORMATIVA = [
  {
    roles: ROLES_CON_PARTICIPACION_PERSONAL, // ESTUDIANTE, TUTOR, JURADO
    titulo: 'Mis procesos',
    icono: 'pi pi-user',
    descripcion: 'Seguimiento de los procesos formativos en los que participas.',
    enlaces: [
      { to: '/formativa/procesos', label: 'Mis procesos formativos' },
      { to: '/formativa/postulaciones', label: 'Postulaciones' },
      { to: '/formativa/planes-trabajo', label: 'Planes de trabajo' },
      { to: '/formativa/vinculos-proyecto', label: 'Vínculos con proyectos formales' },
      { to: '/formativa/registros-actividades', label: 'Registros de actividades' },
      { to: '/formativa/registros-horas', label: 'Registros de horas' },
    ],
  },
  {
    roles: ['FACULTAD'],
    titulo: 'Gestión de facultad',
    icono: 'pi pi-building',
    descripcion: 'Vinculación de personas y estadísticas de tu facultad.',
    enlaces: [
      { to: '/integracion/vinculacion-facultad', label: 'Crear usuario (Estudiante/Jurado/Tutor)' },
      { to: '/estadisticasFormativa', label: 'Estadísticas Formativa' },
      { to: '/formativa/modalidades-facultad', label: 'Modalidades por facultad' },
      { to: '/formativa/requisitos-modalidad', label: 'Requisitos de modalidad' },
    ],
  },
  {
    roles: ['SOPORTE', 'CINTERNO', 'GRUPO', 'CEXTERNO', 'SUPERVISOR', 'DECANO', 'GERENTE', 'ASESOR'],
    titulo: 'Gestión operativa de procesos',
    icono: 'pi pi-cog',
    descripcion: 'Administración general de procesos, personas y flujos formativos.',
    enlaces: [
      { to: '/formativa/procesos', label: 'Procesos formativos' },
      { to: '/formativa/estudiantes', label: 'Estudiantes' },
      { to: '/formativa/participantes', label: 'Participantes de proceso' },
      { to: '/formativa/tutores', label: 'Tutores' },
      { to: '/formativa/modalidades', label: 'Modalidades' },
      { to: '/formativa/flujos', label: 'Flujos de proceso' },
      { to: '/formativa/etapas-flujo', label: 'Etapas de flujo' },
      { to: '/formativa/transiciones-flujo', label: 'Transiciones de flujo' },
      { to: '/formativa/reglas-flujo', label: 'Reglas de flujo' },
      { to: '/formativa/instancias-etapa', label: 'Instancias de etapa' },
    ],
  },
  {
    roles: ['SOPORTE', 'CINTERNO', 'GRUPO', 'CEXTERNO', 'SUPERVISOR', 'DECANO', 'GERENTE', 'ASESOR', 'JURADO'],
    titulo: 'Evaluación y control',
    icono: 'pi pi-check-square',
    descripcion: 'Evaluación de trabajos, revisiones y control antiplagio.',
    enlaces: [
      { to: '/formativa/evaluaciones', label: 'Evaluaciones de proceso' },
      { to: '/formativa/eventos-evaluativos', label: 'Eventos evaluativos' },
      { to: '/formativa/revisiones', label: 'Revisiones' },
      { to: '/formativa/validaciones-antiplagio', label: 'Validaciones antiplagio' },
      { to: '/formativa/segundas-instancias', label: 'Segundas instancias' },
    ],
  },
  {
    roles: ['SOPORTE', 'CINTERNO', 'GRUPO', 'CEXTERNO', 'SUPERVISOR', 'DECANO', 'GERENTE', 'ASESOR', 'ESTUDIANTE'],
    titulo: 'Actividades y certificaciones',
    icono: 'pi pi-verified',
    descripcion: 'Banco de ideas, homologaciones y certificaciones externas.',
    enlaces: [
      { to: '/formativa/actividades', label: 'Actividades formativas' },
      { to: '/formativa/banco-ideas', label: 'Banco de ideas' },
      { to: '/formativa/certificaciones-externas', label: 'Certificaciones externas' },
      { to: '/formativa/homologaciones', label: 'Homologaciones' },
    ],
  },
];

const FormativaHomePage = () => {
  const dispatch = useDispatch();
  const { roles, personaId } = useSelector((state) => state.auth);
  const esParticipante = (roles || []).some((r) => ROLES_CON_PARTICIPACION_PERSONAL.includes(r));

  useEffect(() => {
    if (esParticipante && personaId) {
      dispatch(fetchProcesosPorPersona(personaId));
    } else {
      dispatch(fetchProcesosActivos());
    }
  }, [dispatch, esParticipante, personaId]);

  return (
    <div className="container mt-4 mb-5">
      <div className="row mb-4">
        <div className="col-lg-8">
          <h3>BIENVENIDO A LA PLATAFORMA PARA LA GESTIÓN DE PROYECTOS DE INVESTIGACIÓN FORMATIVA</h3>
          <p className="text-muted">
            Espacio para el seguimiento de procesos formativos: modalidades
            de grado, postulaciones, tutorías, evaluación de trabajos y
            certificaciones, desde la formulación hasta la calificación
            final. A continuación encontrarás los accesos directos a las
            funciones habilitadas para tu(s) rol(es).
          </p>
        </div>
      </div>
      <RoleAccessGrid secciones={SECCIONES_FORMATIVA} rolesUsuario={roles} />
    </div>
  );
};

export default FormativaHomePage;