// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'; // Importa el reducer de autenticación
import convocatoriasReducer from '../features/convocatorias/convocatoriasSlice'; // Importa el reducer de convocatoria
import rolesUsuarioReducer from '../features/usuarios/rolesUsuarioSlice.js'; // Importa el reducer de rolesUsuario
import personaGrupoReducer from '../features/usuarios/personaGrupoSlice.js'; // Importa el reducer de personaGrupo
import usuarioLifecycleReducer from '../features/usuarios/usuarioLifecycleSlice.js'; // Importa el reducer de usuarioLifecycle
import usuarioXPersonaReducer from '../features/usuarioXPersona/usuarioXPersonaSlice'; // Importa el reducer de usuarioXPersona
import calificacionReducer from '../features/calificaciones/calificacionSlice'; // Importa el reducer de calificaciones
import metadataReducer from '../features/metadata/metadataSlice'; // Importa el reducer de metadatos
import avanceReducer from '../features/proyectos/avanceSlice.js'; // Importa el reducer de avance
import documentosReducer from '../features/proyectos/documentosSlice.js'; // Importa el reducer de documentos
import gastosReducer from '../features/proyectos/gastoSlice.js'; // Importa el reducer de gastos
import investigadoresReducer from '../features/proyectos/investigadoresSlice.js'; // Importa el reducer de investigadores
import montosReducer from '../features/proyectos/montoSlice.js'; // Importa el reducer de montos
import objetivosReducer from '../features/proyectos/objetivosSlice.js'; // Importa el reducer de objetivos 
import productosReducer from '../features/proyectos/productosSlice.js'; // Importa el reducer de productos
import proyectosReducer from '../features/proyectos/proyectosSlice.js'; // Importa el reducer de proyectos
import notificacionesReducer from '../features/notificaciones/notificacionesSlice'; // Importa el reducer de notificaciones
import procesosInvFormativaReducer from '../features/procesosInvFormativa/procesosInvFormativaSlice'; // Importa el reducer de  procesos formativos
import catalogosReducer from '../features/catalogos/catalogosSlice'; // Importa el reducer de catalogos
import calificacionResponsableReducer from '../features/calificaciones/calificacionResponsableSlice'; // Importa el reducer de calificaciones
import historialReducer from '../features/historial/historialSlice'; // Importa el reducer de historial
import gerentesReducer from '../features/gerentes/gerentesSlice'; // Importa el reducer de gerente
import personasReducer from '../features/personas/personasSlice'; // Importa el reducer de personas
import personaXGrupoReducer from '../features/personaXGrupo/personaXGrupoSlice'; // Importa el reducer de personaXGrupo
import usuarioAdminReducer from '../features/usuarioAdmin/usuarioAdminSlice'; // Importa el reducer de usuarioAdmin
import reportesInstitucionalesReducer from '../features/reportesInstitucionales/reportesInstitucionalesSlice'; // Importa el reducer de reportesInstitucionales
import soporteReducer from '../features/soporte/soporteSlice.js'; // Importa el reducer de soporte
import estadisticasFormalReducer from '../features/estadisticas/estadisticasFormalSlice'; // Importa el reducer de estadísticas
import estadisticasFormativaReducer from '../features/estadisticas/estadisticasFormativaSlice'; // Importa el reducer de estadísticas
import controlCambiosReducer from '../features/controlCambios/controlCambiosSlice'; // Importa el reducer de control cambios
import productoXGrupoFiltrosReducer from '../features/catalogos/productoXGrupoFiltrosSlice'; // Importa el reducer de productoXGrupo
import tipoCalificacionFiltrosReducer from '../features/catalogos/tipoCalificacionFiltrosSlice'; // Importa el reducer de tipoCalificacion
import tipoRubroFiltrosReducer from '../features/catalogos/tipoRubroFiltrosSlice'; // Importa el reducer de tipoRubro
import entidadExternaReducer from '../features/crm/entidadExternaSlice'; // Importa el reducer de entidadExterna
import interaccionReducer from '../features/crm/interaccionSlice'; // Importa el reducer de interaccion
import indicadorImpactoReducer from '../features/crm/indicadorImpactoSlice'; // Importa el reducer de indicadorImpacto
import documentoFirmaReducer from '../features/documentoFirma/documentoFirmaSlice';  // Importa el reducer de documentoFirma
import documentoFirmanteReducer from "../features/documentoFirmante/documentoFirmanteSlice"; // Importa el reducer de documentoFirmante
import aprobacionReducer from '../features/aprobacion/aprobacionSlice'; // Importa el reducer de aprobacion
import plantillaDocumentoReducer from "../features/plantillaDocumento/plantillaDocumentoSlice"; // Importa el reducer de plantillaDocumento
import tareaReducer from "../features/tarea/tareaSlice"; // Importa el reducer de tarea
import vinculacionFacultadReducer from '../features/integracion/vinculacionFacultadSlice'; // Importa el reducer de vinculacionFacultad
import actividadFormativaReducer from '../features/actividadFormativa/actividadFormativaSlice'; // Importa el reducer de actividadFormativa
import bancoIdeasReducer from '../features/bancoIdeas/bancoIdeasSlice'; // Importa el reducer de bancoIdeas
import certificacionExternaReducer from '../features/certificacionExterna/certificacionExternaSlice'; // Importa el reducer de certificacionExterna
import estudianteReducer from '../features/estudiante/estudianteSlice'; // Importa el reducer de estudiante
import etapaFlujoReducer from '../features/etapaFlujo/etapaFlujoSlice'; // Importa el reducer de etapaFlujo
import evaluacionProcesoReducer from '../features/evaluacionProceso/evaluacionProcesoSlice'; // Importa el reducer de evaluacionProceso
import eventoEvaluativoReducer from '../features/eventoEvaluativo/eventoEvaluativoSlice'; // Importa el reducer de eventoEvaluativo
import flujoProcesoReducer from '../features/flujoProceso/flujoProcesoSlice'; // Importa el reducer de flujoProceso
import homologacionReducer from '../features/homologacion/homologacionSlice'; // Importa el reducer de homologacion
import instanciaEtapaReducer from '../features/instanciaEtapa/instanciaEtapaSlice'; // Importa el reducer de instanciaEtapa
import modalidadXFacultadReducer from '../features/modalidadXFacultad/modalidadXFacultadSlice'; // Importa el reducer de modalidadXFacultad
import modalidadReducer from '../features/modalidad/modalidadSlice'; // Importa el reducer de modalidad
import participanteProcesoReducer from '../features/participanteProceso/participanteProcesoSlice'; // Importa el reducer de participanteProceso
import planTrabajoReducer from '../features/planTrabajo/planTrabajoSlice'; // Importa el reducer de planTrabajo
import postulacionProcesoReducer from '../features/postulacionProceso/postulacionProcesoSlice'; // Importa el reducer de postulacionProceso
import procesoFormativoReducer from '../features/procesoFormativo/procesoFormativoSlice'; // Importa el reducer de procesoFormativo
import procesoFormativoXProyectoReducer from '../features/procesoFormativoXProyecto/procesoFormativoXProyectoSlice'; // Importa el reducer de procesoFormativoXProyecto
import registroActividadesReducer from '../features/registroActividades/registroActividadesSlice'; // Importa el reducer de registroActividades
import registroHorasReducer from '../features/registroHoras/registroHorasSlice'; // Importa el reducer de registroHoras
import reglaFlujoReducer from '../features/reglaFlujo/reglaFlujoSlice'; // Importa el reducer de reglaFlujo
import requisitoModalidadReducer from '../features/requisitoModalidad/requisitoModalidadSlice'; // Importa el reducer de requisitoModalidad
import revisionReducer from '../features/revision/revisionSlice'; // Importa el reducer de revision
import segundaInstanciaReducer from '../features/segundaInstancia/segundaInstanciaSlice'; // Importa el reducer de segundaInstancia
import transicionFlujoReducer from '../features/transicionFlujo/transicionFlujoSlice'; // Importa el reducer de transicionFlujo
import tutorReducer from '../features/tutor/tutorSlice'; // Importa el reducer de tutor
import validacionAntiplagioReducer from '../features/validacionAntiplagio/validacionAntiplagioSlice'; // Importa el reducer de validacionAntiplagio


export const store = configureStore({
  reducer: {
    auth: authReducer, // Añade el reducer de autenticación
    convocatorias: convocatoriasReducer, // Añade el reducer de convocatorias
    calificaciones: calificacionReducer, // Añade el reducer de calificaciones
    avance: avanceReducer, // Añade el reducer de avance
    documentos: documentosReducer, // Añade el reducer de documentos
    gastos: gastosReducer, // Añade el reducer de gastos
    investigadores: investigadoresReducer, // Añade el reducer de investigadores
    montos: montosReducer, // Añade el reducer de montos
    objetivos: objetivosReducer, // Añade el reducer de objetivos
    productos: productosReducer, // Añade el reducer de productos
    proyectos: proyectosReducer, // Añade el reducer de proyectos
    rolesUsuario: rolesUsuarioReducer, // Añade el reducer de rolesUsuario
    personaGrupo: personaGrupoReducer, // Añade el reducer de personaGrupo
    usuarioLifecycle: usuarioLifecycleReducer, // Añade el reducer de usuarioLifecycle
    metadata: metadataReducer, // Añade el reducer de metadatos
    notificaciones: notificacionesReducer, // Añade el reducer de notificaciones
    procesosInvFormativa: procesosInvFormativaReducer, // Añade el reducer de procesos formativos
    catalogos: catalogosReducer, // Añade el reducer de catálogos
    calificacionResponsable: calificacionResponsableReducer, // Añade el reducer de calificaciones por responsable
    historial: historialReducer, // Añade el reducer de historial
    gerentes: gerentesReducer, // Añade el reducer de gerente
    usuarioXPersona: usuarioXPersonaReducer, // Añade el reducer de usuarioXPersona
    personas: personasReducer, // Añade el reducer de persona
    personaXGrupo: personaXGrupoReducer, // Añade el reducer de personaXGrupo
    usuarioAdmin: usuarioAdminReducer, // Añade el reducer de usuarioAdmin
    reportesInstitucionales: reportesInstitucionalesReducer, // Añade el reducer de reportesInstitucionales
    soporte: soporteReducer, // Añade el reducer soporte
    estadisticasFormal: estadisticasFormalReducer, // Añade el reducer de estadísticas de investigacion formal
    estadisticasFormativa: estadisticasFormativaReducer, // Añade el reducer de estadísticas de investigacion formativa
    controlCambios: controlCambiosReducer, // Añade el reducer de control de cambios
    productoXGrupoFiltros: productoXGrupoFiltrosReducer, // Añade el reducer de productoXGrupo
    tipoCalificacionFiltros: tipoCalificacionFiltrosReducer, // Añade el reducer de tipoCalificacion
    tipoRubroFiltros: tipoRubroFiltrosReducer, // Añade el reducer de tipoRubro
    entidadExterna: entidadExternaReducer, // Añade el reducer de entidadExterna
    interaccion: interaccionReducer, // Añade el reducer de interaccion
    indicadorImpacto: indicadorImpactoReducer, // Añade el reducer de indicadorImpacto
    documentoFirma: documentoFirmaReducer, // Añade el reducer de documentoFirma
    documentoFirmante: documentoFirmanteReducer, // Añade el reducer de documentoFirmante
    aprobacion: aprobacionReducer, // Añade el reducer de aprobacion
    plantillaDocumento: plantillaDocumentoReducer, // Añade el reducer de plantillaDocumento
    tarea: tareaReducer, // Añade el reducer de tarea
    vinculacionFacultad: vinculacionFacultadReducer, // Añade el reducer de vinculacionFacultad
    actividadFormativa: actividadFormativaReducer, // Añade el reducer de actividadFormativa
    bancoIdeas: bancoIdeasReducer, // Añade el reducer de bancoIdeas
    certificacionExterna: certificacionExternaReducer, // Añade el reducer de certificacionExterna
    estudiante: estudianteReducer, // Añade el reducer de estudiante
    etapaFlujo: etapaFlujoReducer, // Añade el reducer de etapaFlujo
    evaluacionProceso: evaluacionProcesoReducer, // Añade el reducer de evaluacionProceso
    eventoEvaluativo: eventoEvaluativoReducer, // Añade el reducer de eventoEvaluativo
    flujoProceso: flujoProcesoReducer, // Añade el reducer de flujoProceso
    homologacion: homologacionReducer, // Añade el reducer de homologacion
    instanciaEtapa: instanciaEtapaReducer, // Añade el reducer de instanciaEtapa
    modalidadXFacultad: modalidadXFacultadReducer, // Añade el reducer de modalidadXFacultad
    modalidad: modalidadReducer, // Añade el reducer de modalidad
    participanteProceso: participanteProcesoReducer, // Añade el reducer de participanteProceso
    planTrabajo: planTrabajoReducer, // Añade el reducer de planTrabajo
    postulacionProceso: postulacionProcesoReducer, // Añade el reducer de postulacionProceso
    procesoFormativo: procesoFormativoReducer, // Añade el reducer de procesoFormativo
    procesoFormativoXProyecto: procesoFormativoXProyectoReducer, // Añade el reducer de procesoFormativoXProyecto
    registroActividades: registroActividadesReducer, // Añade el reducer de registroActividades
    registroHoras: registroHorasReducer, // Añade el reducer de registroHoras
    reglaFlujo: reglaFlujoReducer, // Añade el reducer de reglaFlujo
    requisitoModalidad: requisitoModalidadReducer, // Añade el reducer de requisitoModalidad
    revision: revisionReducer, // Añade el reducer de revision
    segundaInstancia: segundaInstanciaReducer, // Añade el reducer de segundaInstancia
    transicionFlujo: transicionFlujoReducer, // Añade el reducer de transicionFlujo
    tutor: tutorReducer, // Añade el reducer de tutor
    validacionAntiplagio: validacionAntiplagioReducer, // Añade el reducer de validacionAntiplagio 
  },
});
