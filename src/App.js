// src/App.js
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadSession } from "./features/auth/authSlice";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import PrivateRoute from "./components/PrivateRoute";


import RolPlataformaPage from "./domains/catalogos/pages/RolPlataformaPage";
import GradoEstudiosPage from "./domains/catalogos/pages/GradoEstudiosPage";
import FacultadEscuelaPage from "./domains/catalogos/pages/FacultadEscuelaPage";
import GrupoInvestigacionPage from "./domains/catalogos/pages/GrupoInvestigacionPage";
import FacultadXGrupoPage from "./domains/catalogos/pages/FacultadXGrupoPage";
import RolGrupoPage from "./domains/catalogos/pages/RolGrupoPage";
import RolInvestigadorPage from "./domains/catalogos/pages/RolInvestigadorPage";
import TipoDocumentoPage from "./domains/catalogos/pages/TipoDocumentoPage";
import TipoCalificacionPage from "./domains/catalogos/pages/TipoCalificacionPage";
import ProductoMincienciasPage from "./domains/catalogos/pages/ProductoMincienciasPage";
import GrupoMincienciasPage from "./domains/catalogos/pages/GrupoMincienciasPage";
import TipoProductoPage from "./domains/catalogos/pages/TipoProductoPage";
import ProductoXGrupoPage from "./domains/catalogos/pages/ProductoXGrupoPage";
import TipoRubroPage from "./domains/catalogos/pages/TipoRubroPage";


import AprobacionesPage from "./domains/common/pages/AprobacionesPage";
import DocumentosPendientesFirmaPage from "./domains/common/pages/DocumentosPendientesFirmaPage";
import DocumentosPorTipoPage from "./domains/common/pages/DocumentosPorTipoPage";
import HelpPage from "./domains/common/pages/HelpPage";
import HistorialPage from "./domains/common/pages/HistorialPage";
import MisFirmasPendientesPage from "./domains/common/pages/MisFirmasPendientesPage";
import PlantillasDocumentoPage from "./domains/common/pages/PlantillasDocumentoPage";
import RecordatoriosPage from "./domains/common/pages/RecordatoriosPage";
import ReportesInstitucionalesPage from './domains/common/pages/ReportesInstitucionalesPage';
import TareasPage from "./domains/common/pages/TareasPage";


import EntidadesExternasPage from './domains/crm/pages/EntidadesExternasPage';
import InteraccionesPage from './domains/crm/pages/InteraccionesPage';
import IndicadoresImpactoPage from './domains/crm/pages/IndicadoresImpactoPage';


import EstadisticasFormalDashboardPage from "./domains/estadisticas/pages/EstadisticasFormalDashboardPage";
import EstadisticasFormativaDashboardPage from "./domains/estadisticas/pages/EstadisticasFormativaDashboardPage";


import AdminConvocatoriasPage from "./domains/formal/pages/AdminConvocatoriasPage";
import AllInfoProyectPage from "./domains/formal/pages/AllInfoProyectPage";
import CalificarProyectoSeleccionadoPage from "./domains/formal/pages/CalificarProyectoSeleccionadoPage";
import CalificarProyectosPage from "./domains/formal/pages/CalificarProyectosPage";
import CalificarProyectosXFacultadPage from "./domains/formal/pages/CalificarProyectosXFacultadPage";
import CalificarProyectosXGrupoPage from "./domains/formal/pages/CalificarProyectosXGrupoPage";
import CrearProyectoExternoPage from "./domains/formal/pages/CrearProyectoExternoPage";
import FormalHomePage from "./domains/formal/pages/FormalHomePage";
import FormalLoginPage from "./domains/formal/pages/LoginPage";
import MisProyectosPage from "./domains/formal/pages/MisProyectosPage";
import ProjectsListPage from "./domains/formal/pages/ProjectsListPage";
import ProyectosPorEstadoAprobadoPage from "./domains/formal/pages/ProyectosPorEstadoAprobadoPage";
import ReporteMontosCalificadosPage from "./domains/formal/pages/ReporteMontosCalificadosPage";
import SegProyectosPage from "./domains/formal/pages/SegProyectosPage";
import UserConvocatoriaPage from "./domains/formal/pages/UserConvocatoriaPage";
import UserParticiparConvocatoriaPage from "./domains/formal/pages/UserParticiparConvocatoriaPage";


import ActividadesFormativasPage from "./domains/formativa/pages/ActividadesFormativasPage";
import BancoIdeasPage from "./domains/formativa/pages/BancoIdeasPage";
import CertificacionesExternasPage from "./domains/formativa/pages/CertificacionesExternasPage";
import EstudiantesPage from "./domains/formativa/pages/EstudiantesPage";
import EtapasFlujoPage from "./domains/formativa/pages/EtapasFlujoPage";
import EvaluacionesProcesoPage from "./domains/formativa/pages/EvaluacionesProcesoPage";
import EventosEvaluativosPage from "./domains/formativa/pages/EventosEvaluativosPage";
import FlujosProcesoPage from "./domains/formativa/pages/FlujosProcesoPage";
import FormativaHomePage from "./domains/formativa/pages/FormativaHomePage";
import HomologacionesPage from "./domains/formativa/pages/HomologacionesPage";
import InstanciasEtapaPage from "./domains/formativa/pages/InstanciasEtapaPage";
import FormativaLoginPage from "./domains/formativa/pages/LoginPage";
import ModalidadesPage from "./domains/formativa/pages/ModalidadesPage";
import ModalidadesXFacultadPage from "./domains/formativa/pages/ModalidadesXFacultadPage";
import ParticipantesProcesoPage from "./domains/formativa/pages/ParticipantesProcesoPage";
import PlanesTrabajoPage from "./domains/formativa/pages/PlanesTrabajoPage";
import PostulacionesProcesoPage from "./domains/formativa/pages/PostulacionesProcesoPage";
import ProcesosFormativosPage from "./domains/formativa/pages/ProcesosFormativosPage";
import RegistrosActividadesPage from "./domains/formativa/pages/RegistrosActividadesPage";
import RegistrosHorasPage from "./domains/formativa/pages/RegistrosHorasPage";
import ReglasFlujoPage from "./domains/formativa/pages/ReglasFlujoPage";
import RequisitosModalidadPage from "./domains/formativa/pages/RequisitosModalidadPage";
import RevisionesPage from "./domains/formativa/pages/RevisionesPage";
import SegundasInstanciasPage from "./domains/formativa/pages/SegundasInstanciasPage";
import TransicionesFlujoPage from "./domains/formativa/pages/TransicionesFlujoPage";
import TutoresPage from "./domains/formativa/pages/TutoresPage";
import ValidacionesAntiplagioPage from "./domains/formativa/pages/ValidacionesAntiplagioPage";
import VinculosProyectoPage from "./domains/formativa/pages/VinculosProyectoPage";


import GerentesPage from './domains/institucional/pages/GerentesPage';
import PersonasPage from './domains/institucional/pages/PersonasPage';
import PersonaXGrupoPage from './domains/institucional/pages/PersonaXGrupoPage';


import VinculacionFacultadPage from './domains/integracion/pages/VinculacionFacultadPage'


import ChangePasswordPage from "./domains/usuarios/pages/ChangePasswordPage";
import ForgotPasswordPage from "./domains/usuarios/pages/ForgotPasswordPage";
import ProfilePage from "./domains/usuarios/pages/ProfilePage";
import ResetPasswordPage from "./domains/usuarios/pages/ResetPasswordPage";
import UsersPage from "./domains/usuarios/pages/UsersPage";
import UsuarioAdminPage from './domains/usuarios/pages/UsuarioAdminPage';
import UsuarioXPersonaPage from './domains/usuarios/pages/UsuarioXPersonaPage';


// Páginas de error, destino del interceptor de axiosInstance.js
import ErrorPageLayout from "./pages/errors/ErrorPageLayout";
import ForbiddenPage from "./pages/errors/ForbiddenPage";
import NotFoundPage from "./pages/errors/NotFoundPage";
import ServerErrorPage from "./pages/errors/ServerErrorPage";


import LandingPage from "./pages/LandingPage";

// Componente de ejemplo para una página protegida
const DashboardPage = () => (
  <div className="container text-center mt-5">
    <h2>Dashboard (Ruta Protegida)</h2>
  </div>
);

const HIDE_NAVBAR_PATHS = ["/", "/login/formal", "/login/formativa"];

function AppContent() {
  const location = useLocation();
  const hideNavbar = HIDE_NAVBAR_PATHS.includes(location.pathname);

  return (
    <div className="d-flex flex-column min-vh-100">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow-1">
        <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/login/formal" element={<FormalLoginPage />} />
            <Route path="/login/formativa" element={<FormativaLoginPage />} />            
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/plantillas-documento" element={<PlantillasDocumentoPage />} />
            {/* Páginas de error: públicas a propósito. */}
            <Route path="/error" element={<ErrorPageLayout />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="/server" element={<ServerErrorPage />} />
            {/* Rutas protegidas: cualquier autenticado, sin rol específico */}
            <Route element={<PrivateRoute requiredAmbito="formal" />}>
              {/* Rutas comunes. */}
              <Route path="/formal" element={<FormalHomePage />} />              
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/cambiar-password" element={<ChangePasswordPage />} />
              <Route path="/ayuda" element={<HelpPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/institucional/reportes" element={<ReportesInstitucionalesPage />} />
              <Route path="/crm/interacciones" element={<InteraccionesPage />} />
              <Route path="/crm/indicadores-impacto" element={<IndicadoresImpactoPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={["CINTERNO"]} />}>
              <Route path="/calificar" element={<CalificarProyectosPage />} />              
              <Route path="/calificar/:id" element={<CalificarProyectoSeleccionadoPage />} />
              <Route path="/documentos/por-tipo" element={<DocumentosPorTipoPage />} />
              <Route path="/firmas/pendientes" element={<MisFirmasPendientesPage />} />
              <Route path="/notificaciones/recordatorios" element={<RecordatoriosPage />} />              
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={["FACULTAD"]} />}>
              <Route path="/participaciones/proyectos-facultad" element={<CalificarProyectosXFacultadPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={["GRUPO"]} />}>
              <Route path="/participaciones/proyectos-grupo" element={<CalificarProyectosXGrupoPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={["SUPERVISOR"]} />}>
              <Route path="/seguimiento/proyectos" element={<SegProyectosPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={["CEXTERNO"]} />}>
              <Route path="/proyectos/crear" element={<CrearProyectoExternoPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={["SOPORTE"]} />}>
              <Route path="/catalogos/roles-plataforma" element={<RolPlataformaPage />} />
              <Route path="/catalogos/grados" element={<GradoEstudiosPage />} />
              <Route path="/catalogos/facultades" element={<FacultadEscuelaPage />} />
              <Route path="/catalogos/grupos" element={<GrupoInvestigacionPage />} />
              <Route path="/catalogos/facultad-x-grupo" element={<FacultadXGrupoPage />} />
              <Route path="/catalogos/rol-x-grupo" element={<RolGrupoPage />} />
              <Route path="/catalogos/rol-x-investigador" element={<RolInvestigadorPage />} />
              <Route path="/catalogos/tipo-documento" element={<TipoDocumentoPage />} />
              <Route path="/catalogos/tipo-calificacion" element={<TipoCalificacionPage />} />
              <Route path="/catalogos/producto-minciencias" element={<ProductoMincienciasPage />} />
              <Route path="/catalogos/grupo-minciencias" element={<GrupoMincienciasPage />} />
              <Route path="/catalogos/tipo-producto" element={<TipoProductoPage />} />
              <Route path="/catalogos/producto-x-grupo" element={<ProductoXGrupoPage />} />
              <Route path="/catalogos/tipo-rubro" element={<TipoRubroPage />} />
              <Route path="/usuarios" element={<UsersPage />} />
              <Route path="/usuarios/usuario-persona" element={<UsuarioXPersonaPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={["FACULTAD", "GRUPO"]} />}>
              <Route path="/convocatorias" element={<UserConvocatoriaPage />} />
              <Route path="/mis-proyectos" element={<MisProyectosPage />} />
              <Route path="/participar/:id" element={<UserParticiparConvocatoriaPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={["CINTERNO", "ASESOR"]} />}>
              <Route path="/convocatoria/administrar" element={<AdminConvocatoriasPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={['SOPORTE', 'SUPERVISOR']} />}>
              <Route path="/historial" element={<HistorialPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={["CINTERNO", "SOPORTE"]} />}>
              <Route path="/institucional/gerentes" element={<GerentesPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={['DECANO', 'SUPERVISOR', 'GERENTE']} />}>
              <Route path="/documentos/pendientes-firma" element={<DocumentosPendientesFirmaPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={['SOPORTE', 'CINTERNO', 'CEXTERNO', 'FACULTAD']} />}>
              <Route path="/crm/entidades-externas" element={<EntidadesExternasPage />} />
            </Route>            
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={["DECANO", "SUPERVISOR", "FACULTAD", "GRUPO", "CINTERNO", "CEXTERNO"]} />}>
              <Route path="/aprobaciones" element={<AprobacionesPage />} />
              <Route path="/tareas" element={<TareasPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={["FACULTAD", "GRUPO", "CINTERNO", "CEXTERNO", "ASESOR", "SUPERVISOR", "DECANO", "GERENTE"]} />}>
              <Route path="/proyectos" element={<ProjectsListPage />} />
              <Route path="/proyectos/:id" element={<AllInfoProyectPage />} />
              <Route path="/formal/proyectos/por-estado-aprobado" element={<ProyectosPorEstadoAprobadoPage />} />
              <Route path="/estadisticasFormal" element={<EstadisticasFormalDashboardPage />} />
              <Route path="/formal/reportes/montos-calificados" element={<ReporteMontosCalificadosPage />} />
            </Route>
            <Route element={<PrivateRoute requiredAmbito="formal" allowedRoles={['SOPORTE', 'SUPERVISOR', 'ASESOR', 'FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO', 'DECANO']} />}>
              <Route path="/institucional/personas" element={<PersonasPage />} />
              <Route path="/institucional/persona-grupo" element={<PersonaXGrupoPage />} />
              <Route path="/usuarios/admin" element={<UsuarioAdminPage />} />
            </Route>
            
            
            {/* Investigación Formativa — protegida por rol (no confirmado por
                entidad, ver nota anterior) Y por ámbito: requiere haber
                entrado por login/formativa/ (sistemaActivo === 'formativa') */}
            <Route element={<PrivateRoute requiredAmbito="formativa" />}>
              <Route path="/formativa" element={<FormativaHomePage />} />
              <Route path="/formativa/procesos" element={<ProcesosFormativosPage />} />
              <Route path="/formativa/postulaciones" element={<PostulacionesProcesoPage />} />
              <Route path="/formativa/planes-trabajo" element={<PlanesTrabajoPage />} />
              <Route path="/formativa/vinculos-proyecto" element={<VinculosProyectoPage />} />

              <Route path="/formativa/estudiantes" element={<EstudiantesPage />} />
              <Route path="/formativa/participantes" element={<ParticipantesProcesoPage />} />
              <Route path="/formativa/tutores" element={<TutoresPage />} />

              <Route path="/formativa/modalidades" element={<ModalidadesPage />} />
              <Route path="/formativa/modalidades-facultad" element={<ModalidadesXFacultadPage />} />
              <Route path="/formativa/requisitos-modalidad" element={<RequisitosModalidadPage />} />

              <Route path="/formativa/flujos" element={<FlujosProcesoPage />} />
              <Route path="/formativa/etapas-flujo" element={<EtapasFlujoPage />} />
              <Route path="/formativa/transiciones-flujo" element={<TransicionesFlujoPage />} />
              <Route path="/formativa/reglas-flujo" element={<ReglasFlujoPage />} />
              <Route path="/formativa/instancias-etapa" element={<InstanciasEtapaPage />} />

              <Route path="/formativa/evaluaciones" element={<EvaluacionesProcesoPage />} />
              <Route path="/formativa/eventos-evaluativos" element={<EventosEvaluativosPage />} />
              <Route path="/formativa/revisiones" element={<RevisionesPage />} />
              <Route path="/formativa/validaciones-antiplagio" element={<ValidacionesAntiplagioPage />} />
              <Route path="/formativa/segundas-instancias" element={<SegundasInstanciasPage />} />

              <Route path="/formativa/actividades" element={<ActividadesFormativasPage />} />
              <Route path="/formativa/registros-actividades" element={<RegistrosActividadesPage />} />
              <Route path="/formativa/registros-horas" element={<RegistrosHorasPage />} />

              <Route path="/formativa/banco-ideas" element={<BancoIdeasPage />} />
              <Route path="/formativa/certificaciones-externas" element={<CertificacionesExternasPage />} />
              <Route path="/formativa/homologaciones" element={<HomologacionesPage />} />
            </Route>

            {/* Vinculación de usuarios por Facultad — VinculacionViewSet
                crear-estudiante/crear-jurado/crear-tutor: ahora exige
                EsFacultad + TieneAmbitoFormativa en el backend (ver arriba) */}
            <Route element={<PrivateRoute allowedRoles={["FACULTAD"]} requiredAmbito="formativa" />}>
              <Route path="/integracion/vinculacion-facultad" element={<VinculacionFacultadPage />} />
              <Route path="/estadisticasFormativa" element={<EstadisticasFormativaDashboardPage />} />
            </Route>

            {/* Comodín 404: SIEMPRE al final */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;