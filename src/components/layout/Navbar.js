// src/components/layout/Navbar.js
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import { Button } from 'primereact/button';
import { useNotificacionesWebSocket } from '../../hooks/useNotificacionesWebSocket';
import {
  fetchNotificacionesIniciales,
  marcarLeida,
  marcarTodasLeidas,
} from '../../features/notificaciones/notificacionesSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { noLeidas } = useSelector((state) => state.notificaciones);
  const { items: notificaciones } = useSelector((state) => state.notificaciones);
  const navigate = useNavigate();
  const { isAuthenticated, roles, sistemaActivo } = useSelector((state) => state.auth);

  const inicioHref = isAuthenticated ? `/${sistemaActivo || 'formal'}` : '/';

  const hasAnyRole = (requiredRoles) => {
    if (!isAuthenticated || !roles) return false;
    return requiredRoles.some(role => roles.includes(role));
  };

  const esFormal = isAuthenticated && sistemaActivo === 'formal';
  const esFormativa = isAuthenticated && sistemaActivo === 'formativa';

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate(`/login/${sistemaActivo || 'formal'}`);
  };

  useNotificacionesWebSocket();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotificacionesIniciales(user.id));
    }
  }, [user, dispatch]);

  const handleClickNotificacion = (notif) => {
    dispatch(marcarLeida(notif.id));
    if (notif.url_relacionada) {
      navigate(notif.url_relacionada);
    }
  };

  const handleMarcarTodas = (e) => {
    e.stopPropagation();
    dispatch(marcarTodasLeidas());
  };

  const iconoPorTipo = (tipo) => {
    switch (tipo) {
      case 'exito': return 'pi pi-check-circle text-success';
      case 'alerta': return 'pi pi-exclamation-triangle text-warning';
      case 'error': return 'pi pi-times-circle text-danger';
      default: return 'pi pi-info-circle text-info';
    }
  };

  return (
    <header>
      <main style={{ height: '10rem', width: '100%' }}>
        <div className="container text-center" style={{ height: '10rem', width: '100%' }}>
          <div className="row" style={{ height: '10rem' }}>
            <div className="col">
              <img style={{ width: '90%' }} src="/image/banner.png" alt="Banner Rosillo" />
            </div>
          </div>
        </div>
      </main>
      <nav className="navbar navbar-expand-lg navbar-dark text-center" style={{ backgroundColor: '#162749' }}>
        <div className="container-fluid">
          <Link className="navbar-brand border-bottom text-center" style={{ marginLeft: '8px' }} to={inicioHref}>JOSÉ MARIA ROSILLO</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              <Link className="nav-item nav-link active" to={inicioHref}>Inicio</Link>
              {isAuthenticated ? (
                <>
                  {hasAnyRole(['SOPORTE']) && (
                    <Link className="nav-item nav-link" to="/usuarios">Usuarios</Link>
                  )}
                  {hasAnyRole(['SOPORTE']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Catálogos
                      </a>
                      <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/catalogos/roles-plataforma">Roles de Plataforma</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/grados">Grados de Estudio</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/facultades">Facultades / Escuelas</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/grupos">Grupos de Investigación</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/facultad-x-grupo">Facultades por Grupo</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/rol-x-grupo">Roles de Grupo</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/rol-x-investigador">Roles de Investigador</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/tipo-documento">Tipos de Documento</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/tipo-calificacion">Tipos de Calificación</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/producto-minciencias">Productos Minciencias</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/grupo-minciencias">Grupos Minciencias</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/tipo-producto">Tipos de Producto</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/producto-x-grupo">Productos por Grupo</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/tipo-rubro">Tipos de Rubro</Link></li>
                      </ul>
                    </li>
                  )}                  
                  <Link className="nav-item nav-link" to="/perfil">Mi perfil</Link>
                  <Link className="nav-item nav-link" to="/ayuda">Ayuda</Link>

                  {esFormal && (
                    <>
                      {hasAnyRole(['CEXTERNO']) && (
                        <li className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Externos
                          </a>
                          <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to="/proyectos/crear?tipo=externo">Crear Proyecto Externo</Link></li>
                            <li><Link className="dropdown-item" to="/proyectos?tipo=externo">Administrar Proyectos Externos</Link></li>
                          </ul>
                        </li>
                      )}

                      {hasAnyRole(['CINTERNO', 'ASESOR']) && (
                        <li className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Convocatoria
                          </a>
                          <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to="/convocatoria/administrar">Administrar Convocatoria</Link></li>
                          </ul>
                        </li>
                      )}

                      {hasAnyRole(['FACULTAD', 'GRUPO']) && (
                        <li className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Participaciones
                          </a>
                          <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to="/convocatorias">Convocatorias Abiertas</Link></li>
                            {hasAnyRole(['FACULTAD']) && (
                              <li><Link className="dropdown-item" to="/participaciones/proyectos-facultad">Proyectos en curso (Facultad)</Link></li>
                            )}
                            {hasAnyRole(['GRUPO']) && (
                              <li><Link className="dropdown-item" to="/participaciones/proyectos-grupo">Proyectos en curso (Grupo)</Link></li>
                            )}
                          </ul>
                        </li>
                      )}

                      {hasAnyRole(['CINTERNO', 'SOPORTE']) && (
                        <li className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            CRM
                          </a>
                          <ul className="dropdown-menu">
                            {hasAnyRole(['SOPORTE', 'CINTERNO', 'CEXTERNO', 'FACULTAD']) && (
                              <li><Link className="dropdown-item" to="/crm/entidades-externas">Entidades Externas</Link></li>
                            )}
                            <li><Link className="dropdown-item" to="/crm/indicadores-impacto">Indicadores de Impacto</Link></li>
                            <li><Link className="dropdown-item" to="/crm/interacciones">Interacciones</Link></li>
                          </ul>
                        </li>
                      )}

                      {hasAnyRole(['CINTERNO', 'SUPERVISOR', 'FACULTAD', 'GRUPO', 'CEXTERNO']) && (
                        <li className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Proyectos
                          </a>
                          <ul className="dropdown-menu">
                            {hasAnyRole(['CINTERNO']) && (
                              <>
                                <li><Link className="dropdown-item" to="/calificar">Proyectos por calificar</Link></li>
                                <li><Link className="dropdown-item" to="/proyectos?estado=aprobado">Proyectos aprobados</Link></li>
                                <li><Link className="dropdown-item" to="/proyectos?estado=rechazado">Proyectos rechazados</Link></li>
                              </>
                            )}
                            {hasAnyRole(['CINTERNO', 'CEXTERNO']) && (
                              <li><Link className="dropdown-item" to="/proyectos">Todos los Proyectos</Link></li>
                            )}
                            {hasAnyRole(['SUPERVISOR']) && (
                              <li><Link className="dropdown-item" to="/proyectos?rol=supervisor">Mis Proyectos (Supervisor)</Link></li>
                            )}
                            {hasAnyRole(['FACULTAD']) && (
                              <li><Link className="dropdown-item" to="/proyectos?rol=facultad">Proyectos de mi Facultad</Link></li>
                            )}
                            {hasAnyRole(['GRUPO']) && (
                              <li><Link className="dropdown-item" to="/proyectos?rol=grupo">Proyectos de mi Grupo</Link></li>
                            )}
                          </ul>
                        </li>
                      )}

                      {hasAnyRole(['SUPERVISOR']) && (
                        <li className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Seguimiento y Control
                          </a>
                          <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to="/seguimiento/proyectos">A Proyectos</Link></li>
                          </ul>
                        </li>
                      )}

                      {(roles.includes('CINTERNO') || roles.includes('SOPORTE')) && (
                        <li className="nav-item"><Link className="nav-link" to="/historial">Historial</Link></li>
                      )}

                      {(roles.includes('CINTERNO') || roles.includes('SOPORTE') || roles.includes('FACULTAD') || roles.includes('GRUPO')) && (
                        <li className="nav-item"><Link className="nav-link" to="/plantillas-documento">Plantillas de Documento</Link></li>
                      )}

                      {(roles.includes('CINTERNO') || roles.includes('SOPORTE')) && (
                        <li className="nav-item"><Link className="nav-link" to="/institucional/gerentes">Gerentes</Link></li>
                      )}

                      {hasAnyRole(['FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO', 'ASESOR', 'SUPERVISOR', 'DECANO', 'GERENTE']) && (
                        <li className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Estadísticas
                          </a>
                          <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to="/estadisticasFormal">Estadísticas</Link></li>
                          </ul>
                        </li>
                      )}
                    </>
                  )}                
                  {esFormativa && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Investigación Formativa
                      </a>
                      <ul className="dropdown-menu" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                        <li><Link className="dropdown-item" to="/formativa">Inicio</Link></li>

                        <li><h6 className="dropdown-header">Procesos</h6></li>
                        <li><Link className="dropdown-item" to="/formativa/procesos">Procesos Formativos</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/postulaciones">Postulaciones</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/planes-trabajo">Planes de Trabajo</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/vinculos-proyecto">Vínculos con Proyectos Formales</Link></li>

                        <li><hr className="dropdown-divider" /></li>
                        <li><h6 className="dropdown-header">Personas</h6></li>
                        <li><Link className="dropdown-item" to="/formativa/estudiantes">Estudiantes</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/participantes">Participantes de Proceso</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/tutores">Tutores</Link></li>
                        {hasAnyRole(['FACULTAD']) && (
                          <li><Link className="dropdown-item" to="/integracion/vinculacion-facultad">Crear Usuario (Estudiante/Jurado/Tutor)</Link></li>
                        )}
                        {hasAnyRole(['FACULTAD']) && (
                          <Link className="nav-item nav-link" to="/usuarios/admin">Administración de Usuarios</Link>
                        )}
                        {hasAnyRole(['FACULTAD']) && (
                          <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                              Estadísticas
                            </a>
                            <ul className="dropdown-menu">
                              <li><Link className="dropdown-item" to="/estadisticasFormativa">Estadísticas</Link></li>
                            </ul>
                          </li>
                        )}

                        <li><hr className="dropdown-divider" /></li>
                        <li><h6 className="dropdown-header">Modalidades</h6></li>
                        <li><Link className="dropdown-item" to="/formativa/modalidades">Modalidades</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/modalidades-facultad">Modalidades por Facultad</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/requisitos-modalidad">Requisitos de Modalidad</Link></li>

                        <li><hr className="dropdown-divider" /></li>
                        <li><h6 className="dropdown-header">Flujo de Proceso</h6></li>
                        <li><Link className="dropdown-item" to="/formativa/flujos">Flujos de Proceso</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/etapas-flujo">Etapas de Flujo</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/transiciones-flujo">Transiciones de Flujo</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/reglas-flujo">Reglas de Flujo</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/instancias-etapa">Instancias de Etapa</Link></li>

                        <li><hr className="dropdown-divider" /></li>
                        <li><h6 className="dropdown-header">Evaluación</h6></li>
                        <li><Link className="dropdown-item" to="/formativa/evaluaciones">Evaluaciones de Proceso</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/eventos-evaluativos">Sustentaciones</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/revisiones">Revisiones</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/validaciones-antiplagio">Validaciones de Antiplagio</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/segundas-instancias">Segundas Instancias</Link></li>

                        <li><hr className="dropdown-divider" /></li>
                        <li><h6 className="dropdown-header">Actividades y Horas</h6></li>
                        <li><Link className="dropdown-item" to="/formativa/actividades">Actividades Formativas</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/registros-actividades">Registros de Actividades</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/registros-horas">Control de Horas</Link></li>

                        <li><hr className="dropdown-divider" /></li>
                        <li><h6 className="dropdown-header">Otros</h6></li>
                        <li><Link className="dropdown-item" to="/formativa/banco-ideas">Banco de Ideas</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/certificaciones-externas">Certificaciones Externas</Link></li>
                        <li><Link className="dropdown-item" to="/formativa/homologaciones">Homologaciones</Link></li>
                      </ul>
                    </li>
                  )}

                  {hasAnyRole(['DECANO', 'SUPERVISOR', 'GERENTE']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Documentos
                      </a>
                      <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/firmas/pendientes">Mis Firmas Pendientes</Link></li>
                        <li><Link className="dropdown-item" to="/documentos/pendientes-firma">Documentos Pendientes de Firma</Link></li>
                      </ul>
                    </li>
                  )}
                  {hasAnyRole(['DECANO', 'SUPERVISOR', 'FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO']) && (
                    <li className="nav-item"><Link className="nav-link" to="/aprobaciones">Aprobaciones</Link></li>
                  )}

                  {hasAnyRole(['FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO']) && (
                    <li className="nav-item"><Link className="nav-link" to="/tareas">Tareas</Link></li>
                  )}
                  {user?.is_staff && (
                    <li><Link className="dropdown-item" to="/notificaciones/recordatorios">Recordatorios Masivos</Link></li>
                  )}
                </>
              ) : (
                <Link className="nav-item nav-link" to="/">Iniciar Sesión</Link>
              )}
            </div>

            {/* Grupo DERECHO: ms-auto empuja este bloque al borde derecho del navbar.
                Solo se renderiza autenticado, ya que ambos ítems dependen de sesión. */}
            {isAuthenticated && (
              <div className="navbar-nav ms-auto align-items-center">
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle position-relative"
                    
                   role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="pi pi-bell" />
                    {noLeidas > 0 && (
                      <span
                        className="badge bg-danger rounded-pill position-absolute"
                        style={{ top: '2px', right: '-4px', fontSize: '0.65rem' }}
                      >
                        {noLeidas > 99 ? '99 ' : noLeidas}
                      </span>
                    )}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end p-0" style={{ minWidth: '320px', maxHeight: '400px', overflowY: 'auto' }}>
                    <li className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                      <strong className="small">Notificaciones</strong>
                      {noLeidas > 0 && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0"
                          onClick={handleMarcarTodas}
                        >
                          Marcar todas como leídas
                        </button>
                      )}
                    </li>
                    {notificaciones.length === 0 ? (
                      <li className="px-3 py-3 text-center text-muted small">
                        No tienes notificaciones sin leer
                      </li>
                    ) : (
                      notificaciones.map((notif) => (
                        <li key={notif.id}>
                          <button
                            type="button"
                            className="dropdown-item d-flex align-items-start gap-2 py-2"
                            onClick={() => handleClickNotificacion(notif)}
                          >
                            <i className={iconoPorTipo(notif.tipo)} style={{ marginTop: '2px' }} />
                            <span className="d-flex flex-column text-start">
                              <span className="small">{notif.mensaje}</span>
                              <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                {new Date(notif.fecha_creacion).toLocaleString('es-CO')}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </li>

                <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="p-button-text p-button-sm nav-item nav-link" onClick={handleLogout} />
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;