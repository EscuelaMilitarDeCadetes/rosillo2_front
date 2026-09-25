// src/features/calificaciones/calificacionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formal/';

export const fetchProyectosSinCalificar = createAsyncThunk(
  'calificaciones/fetchProyectosSinCalificar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}proyecto-convocatoria/sin-calificar/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Error al cargar los proyectos por calificar.'
      );
    }
  }
);

export const fetchProyectosCalificados = createAsyncThunk(
  'calificaciones/fetchProyectosCalificados',
  async (calificacion = null, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}proyecto-convocatoria/calificados/`, {
        params: calificacion ? { calificacion } : {},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Error al cargar los proyectos calificados.'
      );
    }
  }
);

export const habilitarCorreccionDocumento = createAsyncThunk(
  'calificaciones/habilitarCorreccionDocumento',
  async (proyectoXConvocatoriaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${BASE}proyecto-convocatoria/${proyectoXConvocatoriaId}/habilitar-correccion/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Error al habilitar la corrección de documentos.'
      );
    }
  }
);

export const deshabilitarCorreccionDocumento = createAsyncThunk(
  'calificaciones/deshabilitarCorreccionDocumento',
  async (proyectoXConvocatoriaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${BASE}proyecto-convocatoria/${proyectoXConvocatoriaId}/deshabilitar-correccion/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Error al deshabilitar la corrección de documentos.'
      );
    }
  }
);

export const fetchDocumentosParticipacion = createAsyncThunk(
  'calificaciones/fetchDocumentosParticipacion',
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('common/documento-firma/por-objeto/', {
        params: {
          content_type_app_label: 'investigacion_formal',
          content_type_model: 'proyecto',
          object_id: proyectoId,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cargar los documentos de participación.'
      );
    }
  }
);

export const descargarDocumentoParticipacion = createAsyncThunk(
  'calificaciones/descargarDocumentoParticipacion',
  async (documentoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`common/documento-firma/${documentoId}/descargar/`, {
        responseType: 'blob',
      });
      const disposition = response.headers['content-disposition'];
      let filename = 'documento';
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { documentoId };
    } catch (error) {
      return rejectWithValue('No se pudo descargar el documento.');
    }
  }
);

export const fetchCalificacionesPorProyecto = createAsyncThunk(
  'calificaciones/fetchCalificacionesPorProyecto',
  async (aplicarId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${BASE}calificaciones/por-proyecto-convocatoria/${aplicarId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Error al cargar las fases de calificación.'
      );
    }
  }
);

export const calificarFase = createAsyncThunk(
  'calificaciones/calificarFase',
  async ({ calificacionId, aprobado, observacion, aplicarId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}calificaciones/${calificacionId}/calificar/`, {
        aprobado,
        observacion,
      });
      dispatch(fetchCalificacionesPorProyecto(aplicarId));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Error al guardar la calificación de la fase.'
      );
    }
  }
);

// Thunk para forzar el cierre oficial del proceso de calificación
export const finalizarCalificacion = createAsyncThunk(
  'calificaciones/finalizarCalificacion',
  async ({ aplicarId, aprobado }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}proyecto-convocatoria/${aplicarId}/finalizar-calificacion/`, {
        aprobado,
      });
      dispatch(fetchCalificacionesPorProyecto(aplicarId));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === 'string'
          ? data
          : (data && Object.values(data).flat().join(' ')) ||
            'Error al finalizar la calificación.';
      return rejectWithValue(mensaje);
    }
  }
);

const calificacionSlice = createSlice({
  name: 'calificaciones',
  initialState: {
    pendientes: [],
    loadingPendientes: false,
    errorPendientes: null,
    calificados: [],
    loadingCalificados: false,
    errorCalificados: null,
    accionLoadingId: null,
    accionError: null,
    documentosParticipacion: [],
    loadingDocumentos: false,
    errorDocumentos: null,
    descargandoDocumentoId: null,
    fases: [],
    loadingFases: false,
    errorFases: null,
    calificandoFaseId: null,
    errorCalificar: null,
    finalizandoCalificacion: false,
    errorFinalizarCalificacion: null,
  },
  reducers: {
    limpiarDocumentosParticipacion: (state) => {
      state.documentosParticipacion = [];
      state.errorDocumentos = null;
    },
    limpiarErrorCalificar: (state) => {
      state.errorCalificar = null;
    },
    limpiarErrorFinalizarCalificacion: (state) => {
      state.errorFinalizarCalificacion = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProyectosSinCalificar.pending, (state) => {
        state.loadingPendientes = true;
        state.errorPendientes = null;
      })
      .addCase(fetchProyectosSinCalificar.fulfilled, (state, action) => {
        state.loadingPendientes = false;
        state.pendientes = action.payload;
      })
      .addCase(fetchProyectosSinCalificar.rejected, (state, action) => {
        state.loadingPendientes = false;
        state.errorPendientes = action.payload;
      })
      .addCase(fetchProyectosCalificados.pending, (state) => {
        state.loadingCalificados = true;
        state.errorCalificados = null;
      })
      .addCase(fetchProyectosCalificados.fulfilled, (state, action) => {
        state.loadingCalificados = false;
        state.calificados = action.payload;
      })
      .addCase(fetchProyectosCalificados.rejected, (state, action) => {
        state.loadingCalificados = false;
        state.errorCalificados = action.payload;
      })
      .addCase(habilitarCorreccionDocumento.pending, (state, action) => {
        state.accionLoadingId = action.meta.arg;
        state.accionError = null;
      })
      .addCase(habilitarCorreccionDocumento.fulfilled, (state, action) => {
        state.accionLoadingId = null;
        const idx = state.pendientes.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.pendientes[idx] = action.payload;
      })
      .addCase(habilitarCorreccionDocumento.rejected, (state, action) => {
        state.accionLoadingId = null;
        state.accionError = action.payload;
      })
      .addCase(deshabilitarCorreccionDocumento.pending, (state, action) => {
        state.accionLoadingId = action.meta.arg;
        state.accionError = null;
      })
      .addCase(deshabilitarCorreccionDocumento.fulfilled, (state, action) => {
        state.accionLoadingId = null;
        const idx = state.pendientes.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.pendientes[idx] = action.payload;
      })
      .addCase(deshabilitarCorreccionDocumento.rejected, (state, action) => {
        state.accionLoadingId = null;
        state.accionError = action.payload;
      })
      .addCase(fetchDocumentosParticipacion.pending, (state) => {
        state.loadingDocumentos = true;
        state.errorDocumentos = null;
      })
      .addCase(fetchDocumentosParticipacion.fulfilled, (state, action) => {
        state.loadingDocumentos = false;
        state.documentosParticipacion = action.payload;
      })
      .addCase(fetchDocumentosParticipacion.rejected, (state, action) => {
        state.loadingDocumentos = false;
        state.errorDocumentos = action.payload;
      })
      .addCase(descargarDocumentoParticipacion.pending, (state, action) => {
        state.descargandoDocumentoId = action.meta.arg;
      })
      .addCase(descargarDocumentoParticipacion.fulfilled, (state) => {
        state.descargandoDocumentoId = null;
      })
      .addCase(descargarDocumentoParticipacion.rejected, (state) => {
        state.descargandoDocumentoId = null;
      })
      .addCase(fetchCalificacionesPorProyecto.pending, (state) => {
        state.loadingFases = true;
        state.errorFases = null;
      })
      .addCase(fetchCalificacionesPorProyecto.fulfilled, (state, action) => {
        state.loadingFases = false;
        state.fases = action.payload;
      })
      .addCase(fetchCalificacionesPorProyecto.rejected, (state, action) => {
        state.loadingFases = false;
        state.errorFases = action.payload;
      })
      .addCase(calificarFase.pending, (state, action) => {
        state.calificandoFaseId = action.meta.arg.calificacionId;
        state.errorCalificar = null;
      })
      .addCase(calificarFase.fulfilled, (state) => {
        state.calificandoFaseId = null;
      })
      .addCase(calificarFase.rejected, (state, action) => {
        state.calificandoFaseId = null;
        state.errorCalificar = action.payload;
      })
      .addCase(finalizarCalificacion.pending, (state) => {
        state.finalizandoCalificacion = true;
        state.errorFinalizarCalificacion = null;
      })
      .addCase(finalizarCalificacion.fulfilled, (state) => {
        state.finalizandoCalificacion = false;
      })
      .addCase(finalizarCalificacion.rejected, (state, action) => {
        state.finalizandoCalificacion = false;
        state.errorFinalizarCalificacion = action.payload;
      });
  },
});

export const { limpiarDocumentosParticipacion, limpiarErrorCalificar, limpiarErrorFinalizarCalificacion } = calificacionSlice.actions;
export default calificacionSlice.reducer;