// src/features/postulacionProceso/postulacionProcesoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/postulacion-proceso/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchPostulaciones = createAsyncThunk(
  'postulacionProceso/fetchPostulaciones',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las postulaciones.'));
    }
  }
);

export const fetchPostulacionesPorEstudiante = createAsyncThunk(
  'postulacionProceso/fetchPostulacionesPorEstudiante',
  async (estudianteId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-estudiante/${estudianteId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por estudiante.'));
    }
  }
);

export const fetchPostulacionesPendientesPorFacultad = createAsyncThunk(
  'postulacionProceso/fetchPostulacionesPendientesPorFacultad',
  async (facultadId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}pendientes-por-facultad/${facultadId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las pendientes por facultad.'));
    }
  }
);

export const crearPostulacion = createAsyncThunk(
  'postulacionProceso/crearPostulacion',
  // payload: { estudiante, modalidad, promedio_actual }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchPostulaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar la postulación.'));
    }
  }
);

export const actualizarPostulacion = createAsyncThunk(
  'postulacionProceso/actualizarPostulacion',
  // Solo promedio_actual es editable, y solo en estado BORRADOR.
  async ({ id, promedioActual }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, { promedio_actual: promedioActual });
      dispatch(fetchPostulaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar la postulación.'));
    }
  }
);

export const eliminarPostulacion = createAsyncThunk(
  'postulacionProceso/eliminarPostulacion',
  // Soft-delete a estado ELIMINADA; solo permitido en BORRADOR.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchPostulaciones());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al eliminar la postulación.'));
    }
  }
);

export const enviarPostulacion = createAsyncThunk(
  'postulacionProceso/enviarPostulacion',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/enviar/`);
      dispatch(fetchPostulaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al enviar la postulación.'));
    }
  }
);

export const pasarPostulacionAValidacion = createAsyncThunk(
  'postulacionProceso/pasarPostulacionAValidacion',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/pasar-a-validacion/`);
      dispatch(fetchPostulaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al pasar la postulación a validación.'));
    }
  }
);

export const aprobarPostulacionDirecto = createAsyncThunk(
  'postulacionProceso/aprobarPostulacionDirecto',
  // Solo Decano/Soporte (decisión directa). Genera el ProcesoFormativo.
  async ({ id, flujoVersionId, titulo, observacion, fechaInicio, fechaFin }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/aprobar/`, {
        flujo_version: flujoVersionId,
        titulo,
        observacion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      });
      dispatch(fetchPostulaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al aprobar la postulación.'));
    }
  }
);

export const rechazarPostulacionDirecto = createAsyncThunk(
  'postulacionProceso/rechazarPostulacionDirecto',
  // Solo Decano/Soporte (decisión directa).
  async ({ id, observacionCoordinacion }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/rechazar/`, {
        observacion_coordinacion: observacionCoordinacion,
      });
      dispatch(fetchPostulaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al rechazar la postulación.'));
    }
  }
);

export const solicitarDecisionDecano = createAsyncThunk(
  'postulacionProceso/solicitarDecisionDecano',
  // Camino de Facultad: abre una Aprobacion, no cambia el estado de la postulación.
  async ({ id, usuarioRevisorId, observacion }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/solicitar-decision-decano/`, {
        usuario_revisor: usuarioRevisorId,
        observacion,
      });
      dispatch(fetchPostulaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al solicitar la decisión del Decano.'));
    }
  }
);

export const confirmarAprobacionDecano = createAsyncThunk(
  'postulacionProceso/confirmarAprobacionDecano',
  async (
    { aprobacionId, flujoVersionId, titulo, observacion, fechaInicio, fechaFin, observacionDecano },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        `${BASE}confirmar-aprobacion-decano/${aprobacionId}/`,
        {
          flujo_version: flujoVersionId,
          titulo,
          observacion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          observacion_decano: observacionDecano,
        }
      );
      dispatch(fetchPostulaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al confirmar la aprobación del Decano.'));
    }
  }
);

export const denegarPorDecano = createAsyncThunk(
  'postulacionProceso/denegarPorDecano',
  async ({ aprobacionId, observacion }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}denegar-por-decano/${aprobacionId}/`, {
        observacion,
      });
      dispatch(fetchPostulaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al denegar la postulación.'));
    }
  }
);

const postulacionProcesoSlice = createSlice({
  name: 'postulacionProceso',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    transicionandoId: null,
    error: null,
    estudianteFiltro: null,
    pendientesFacultadFiltro: null,
  },
  reducers: {
    limpiarErrorPostulacion: (state) => {
      state.error = null;
    },
    establecerFiltroEstudiantePostulacion: (state, action) => {
      state.estudianteFiltro = action.payload || null;
      state.pendientesFacultadFiltro = null;
    },
    establecerFiltroPendientesFacultad: (state, action) => {
      state.pendientesFacultadFiltro = action.payload || null;
      state.estudianteFiltro = null;
    },
    limpiarFiltrosPostulacion: (state) => {
      state.estudianteFiltro = null;
      state.pendientesFacultadFiltro = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostulaciones.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostulaciones.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchPostulaciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPostulacionesPorEstudiante.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostulacionesPorEstudiante.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchPostulacionesPorEstudiante.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPostulacionesPendientesPorFacultad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostulacionesPendientesPorFacultad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchPostulacionesPendientesPorFacultad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearPostulacion.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearPostulacion.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearPostulacion.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarPostulacion.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarPostulacion.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarPostulacion.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarPostulacion.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarPostulacion.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarPostulacion.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      });

    // Todas las transiciones de estado comparten "transicionandoId", tomado
    // del primer argumento (id o { id, ... }) de cada thunk.
    const transiciones = [
      enviarPostulacion,
      pasarPostulacionAValidacion,
      aprobarPostulacionDirecto,
      rechazarPostulacionDirecto,
      solicitarDecisionDecano,
    ];
    transiciones.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state, action) => {
          const arg = action.meta.arg;
          state.transicionandoId = typeof arg === 'object' ? arg.id : arg;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state) => {
          state.transicionandoId = null;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.transicionandoId = null;
          state.error = action.payload;
        });
    });

    // confirmar/denegar por decano se identifican por aprobacionId, no por
    // postulacion id; usan su propio "transicionandoAprobacionId".
    builder
      .addCase(confirmarAprobacionDecano.pending, (state, action) => {
        state.transicionandoAprobacionId = action.meta.arg.aprobacionId;
        state.error = null;
      })
      .addCase(confirmarAprobacionDecano.fulfilled, (state) => {
        state.transicionandoAprobacionId = null;
      })
      .addCase(confirmarAprobacionDecano.rejected, (state, action) => {
        state.transicionandoAprobacionId = null;
        state.error = action.payload;
      })
      .addCase(denegarPorDecano.pending, (state, action) => {
        state.transicionandoAprobacionId = action.meta.arg.aprobacionId;
        state.error = null;
      })
      .addCase(denegarPorDecano.fulfilled, (state) => {
        state.transicionandoAprobacionId = null;
      })
      .addCase(denegarPorDecano.rejected, (state, action) => {
        state.transicionandoAprobacionId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorPostulacion,
  establecerFiltroEstudiantePostulacion,
  establecerFiltroPendientesFacultad,
  limpiarFiltrosPostulacion,
} = postulacionProcesoSlice.actions;
export default postulacionProcesoSlice.reducer;