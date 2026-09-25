// src/domains/formal/pages/FormalHomePage.js
import React from 'react';
import { useSelector } from 'react-redux';
import RoleAccessGrid from '../../../components/home/RoleAccessGrid';
import useHasRole from '../../../hooks/useHasRole';
import ConvocatoriasAbiertasTable from '../components/convocatorias/ConvocatoriasAbiertasTable';

/**
 * Home del dominio "investigación formal", montada en "/formal" dentro
 * del bloque de rutas protegidas.
 *
 * Cada bloque de accesos rápidos solo se muestra a los roles que
 * efectivamente pueden usarlo, replicando los `allowedRoles` definidos
 * para cada <Route> en App.js, de modo que cada usuario vea únicamente
 * las funciones de su(s) rol(es) y no las de los demás.
 */
const SECCIONES_FORMAL = [
  {
    roles: ['CINTERNO'],
    titulo: 'Calificación de proyectos',
    icono: 'pi pi-star',
    descripcion: 'Convocatoria interna: calificación, documentos y firmas.',
    enlaces: [
      { to: '/calificar', label: 'Proyectos por calificar' },
      { to: '/proyectos?estado=aprobado', label: 'Proyectos aprobados' },
      { to: '/proyectos?estado=rechazado', label: 'Proyectos rechazados' },
      { to: '/documentos/por-tipo', label: 'Documentos por tipo' },
      { to: '/firmas/pendientes', label: 'Mis firmas pendientes' },
      { to: '/notificaciones/recordatorios', label: 'Recordatorios' },
      { to: '/plantillas-documento', label: 'Plantillas de documento' },
      { to: '/institucional/gerentes', label: 'Gerentes' },
    ],
  },
  {
    roles: ['CINTERNO', 'ASESOR'],
    titulo: 'Convocatoria',
    icono: 'pi pi-bullhorn',
    descripcion: 'Administración de la convocatoria vigente.',
    enlaces: [{ to: '/convocatoria/administrar', label: 'Administrar convocatoria' }],
  },
  {
    roles: ['CEXTERNO'],
    titulo: 'Proyectos externos',
    icono: 'pi pi-globe',
    descripcion: 'Registro y administración de proyectos con financiación externa.',
    enlaces: [
      { to: '/proyectos/crear', label: 'Crear proyecto externo' },
      { to: '/proyectos', label: 'Todos los proyectos' },
    ],
  },
  {
    roles: ['FACULTAD', 'GRUPO'],
    titulo: 'Participaciones',
    icono: 'pi pi-sitemap',
    descripcion: 'Convocatorias abiertas y tus proyectos en curso.',
    enlaces: [
      { to: '/convocatorias', label: 'Convocatorias abiertas' },
      { to: '/mis-proyectos', label: 'Mis proyectos' },
    ],
  },
  {
    roles: ['FACULTAD'],
    titulo: 'Facultad',
    icono: 'pi pi-building',
    descripcion: 'Seguimiento de los proyectos de tu facultad.',
    enlaces: [{ to: '/participaciones/proyectos-facultad', label: 'Proyectos en curso (Facultad)' }],
  },
  {
    roles: ['GRUPO'],
    titulo: 'Grupo de investigación',
    icono: 'pi pi-users',
    descripcion: 'Seguimiento de los proyectos de tu grupo.',
    enlaces: [{ to: '/participaciones/proyectos-grupo', label: 'Proyectos en curso (Grupo)' }],
  },
  {
    roles: ['SUPERVISOR'],
    titulo: 'Seguimiento y control',
    icono: 'pi pi-eye',
    descripcion: 'Seguimiento a proyectos bajo tu supervisión.',
    enlaces: [
      { to: '/seguimiento/proyectos', label: 'Seguimiento a proyectos' },
      { to: '/proyectos?rol=supervisor', label: 'Mis proyectos (Supervisor)' },
    ],
  },
  {
    roles: ['DECANO', 'SUPERVISOR', 'GERENTE'],
    titulo: 'Firmas y documentos',
    icono: 'pi pi-file-check',
    descripcion: 'Documentos institucionales pendientes de tu firma.',
    enlaces: [{ to: '/documentos/pendientes-firma', label: 'Documentos pendientes de firma' }],
  },
  {
    roles: ['DECANO', 'SUPERVISOR', 'FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO'],
    titulo: 'Aprobaciones y tareas',
    icono: 'pi pi-check-square',
    descripcion: 'Aprobaciones pendientes y tareas asignadas.',
    enlaces: [
      { to: '/aprobaciones', label: 'Aprobaciones' },
      { to: '/tareas', label: 'Tareas' },
    ],
  },
  {
    roles: ['FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO', 'ASESOR', 'SUPERVISOR', 'DECANO', 'GERENTE'],
    titulo: 'Proyectos y estadísticas',
    icono: 'pi pi-chart-bar',
    descripcion: 'Consulta general de proyectos y estadísticas del sistema.',
    enlaces: [
      { to: '/proyectos', label: 'Proyectos' },
      { to: '/formal/proyectos/por-estado-aprobado', label: 'Proyectos por estado aprobado' },
      { to: '/estadisticasFormal', label: 'Estadísticas' },
      { to: '/formal/reportes/montos-calificados', label: 'Reporte de montos calificados' },
    ],
  },
  {
    roles: ['SOPORTE'],
    titulo: 'Personas y usuarios',
    icono: 'pi pi-id-card',
    descripcion: 'Consulta de personas y administración de usuarios.',
    enlaces: [
      { to: '/institucional/personas', label: 'Personas' },
      { to: '/usuarios/admin', label: 'Administración de usuarios' },
    ],
  },
  {
    roles: ['SOPORTE', 'CINTERNO'],
    titulo: 'CRM',
    icono: 'pi pi-address-book',
    descripcion: 'Relacionamiento con entidades externas.',
    enlaces: [{ to: '/crm/entidades-externas', label: 'Entidades externas' }],
  },
  {
    roles: ['SOPORTE', 'SUPERVISOR'],
    titulo: 'Historial',
    icono: 'pi pi-history',
    descripcion: 'Historial de movimientos del sistema.',
    enlaces: [{ to: '/historial', label: 'Ver historial' }],
  },
  {
    roles: ['SOPORTE'],
    titulo: 'Administración de la plataforma',
    icono: 'pi pi-cog',
    descripcion: 'Gestión de usuarios y catálogos base del sistema.',
    enlaces: [
      { to: '/usuarios', label: 'Usuarios' },
      { to: '/usuarios/usuario-persona', label: 'Usuario x Persona' },
      { to: '/catalogos/roles-plataforma', label: 'Roles de plataforma' },
      { to: '/catalogos/grados', label: 'Grados de estudio' },
      { to: '/catalogos/facultades', label: 'Facultades / escuelas' },
      { to: '/catalogos/grupos', label: 'Grupos de investigación' },
      { to: '/catalogos/facultad-x-grupo', label: 'Facultades por grupo' },
      { to: '/catalogos/rol-x-grupo', label: 'Roles de grupo' },
      { to: '/catalogos/rol-x-investigador', label: 'Roles de investigador' },
      { to: '/catalogos/tipo-documento', label: 'Tipos de documento' },
      { to: '/catalogos/tipo-calificacion', label: 'Tipos de calificación' },
      { to: '/catalogos/producto-minciencias', label: 'Productos Minciencias' },
      { to: '/catalogos/grupo-minciencias', label: 'Grupos Minciencias' },
      { to: '/catalogos/tipo-producto', label: 'Tipos de producto' },
      { to: '/catalogos/producto-x-grupo', label: 'Productos por grupo' },
      { to: '/catalogos/tipo-rubro', label: 'Tipos de rubro' },
    ],
  },
];

const ROLES_VEN_CONVOCATORIAS = ['ASESOR', 'CINTERNO', 'FACULTAD', 'GRUPO'];


const FormalHomePage = () => {
  const { roles } = useSelector((state) => state.auth);
  const veConvocatorias = useHasRole(ROLES_VEN_CONVOCATORIAS);

  return (
    <div className="container mt-4 mb-5">
      <div className="row mb-4">
        <div className="col-lg-8">
          <h3>BIENVENIDO A LA PLATAFORMA PARA LA GESTIÓN DE PROYECTOS DE INVESTIGACIÓN FORMAL</h3>
          <p className="text-muted">
            A continuación encontrarás los accesos directos a las funciones
            habilitadas para tu(s) rol(es) dentro de la plataforma.
          </p>
        </div>
      </div>
      {veConvocatorias && <ConvocatoriasAbiertasTable ocultarSiVacia />}
      <RoleAccessGrid secciones={SECCIONES_FORMAL} rolesUsuario={roles} />
    </div>
  );
};

export default FormalHomePage;