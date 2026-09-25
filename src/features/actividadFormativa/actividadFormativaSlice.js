// src/features/actividadFormativa/actividadFormativaSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/actividad-formativa/';

// Extrae un mensaje legible de cualquier forma de error que devuelva DRF:
// string plano, dict de errores por campo, o lista (ValidationError simple).
const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchActividadesFormativas = createAsyncThunk(
  'actividadFormativa/fetchActividadesFormativas',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las actividades formativas.'));
    }
  }
);

// por-proceso y por-responsable no están paginadas: devuelven la lista
// completa (ver ActividadFormativaSelector.listar_por_proceso / _por_responsable).
export const fetchActividadesPorProceso = createAsyncThunk(
  'actividadFormativa/fetchActividadesPorProceso',
  async (procesoFormativoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proceso/${procesoFormativoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por proceso formativo.'));
    }
  }
);

export const fetchActividadesPorResponsable = createAsyncThunk(
  'actividadFormativa/fetchActividadesPorResponsable',
  async (responsableId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-responsable/${responsableId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por responsable.'));
    }
  }
);

export const crearActividadFormativa = createAsyncThunk(
  'actividadFormativa/crearActividadFormativa',
  // payload: { proceso_formativo, responsable, nombre, descripcion?, fecha_inicio?, fecha_fin?, horas_dedicadas? }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchActividadesFormativas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al planificar la actividad formativa.'));
    }
  }
);

export const actualizarActividadFormativa = createAsyncThunk(
  'actividadFormativa/actualizarActividadFormativa',
  // El backend solo implementa update() (PUT), no partial_update(); ver nota
  // de arriba. payload: { nombre, descripcion?, fecha_inicio?, fecha_fin?, horas_dedicadas? }
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchActividadesFormativas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar la actividad formativa.'));
    }
  }
);

export const eliminarActividadFormativa = createAsyncThunk(
  'actividadFormativa/eliminarActividadFormativa',
  // Backend solo permite eliminar actividades en estado PLANIFICADA.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchActividadesFormativas());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al eliminar la actividad formativa.'));
    }
  }
);

export const iniciarActividadFormativa = createAsyncThunk(
  'actividadFormativa/iniciarActividadFormativa',
  // PLANIFICADA -> EN_PROGRESO
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/iniciar/`);
      dispatch(fetchActividadesFormativas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al iniciar la actividad formativa.'));
    }
  }
);

export const completarActividadFormativa = createAsyncThunk(
  'actividadFormativa/completarActividadFormativa',
  // EN_PROGRESO -> COMPLETADA; exige documento_soporte_id.
  async ({ id, documentoSoporteId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/completar/`, {
        documento_soporte: documentoSoporteId,
      });
      dispatch(fetchActividadesFormativas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al completar la actividad formativa.'));
    }
  }
);

export const cancelarActividadFormativa = createAsyncThunk(
  'actividadFormativa/cancelarActividadFormativa',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/cancelar/`);
      dispatch(fetchActividadesFormativas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cancelar la actividad formativa.'));
    }
  }
);

const actividadFormativaSlice = createSlice({
  name: 'actividadFormativa',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    // id de la actividad con una transición de estado en curso (iniciar/completar/cancelar)
    transicionandoId: null,
    error: null,
    // por-proceso y por-responsable son mutuamente excluyentes, igual que en
    // entidadExternaSlice: solo uno puede estar activo a la vez.
    procesoFiltro: null,
    responsableFiltro: null,
  },
  reducers: {
    limpiarErrorActividadFormativa: (state) => {
      state.error = null;
    },
    establecerFiltroProcesoActividad: (state, action) => {
      state.procesoFiltro = action.payload || null;
      state.responsableFiltro = null;
    },
    establecerFiltroResponsableActividad: (state, action) => {
      state.responsableFiltro = action.payload || null;
      state.procesoFiltro = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActividadesFormativas.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActividadesFormativas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchActividadesFormativas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchActividadesPorProceso.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActividadesPorProceso.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchActividadesPorProceso.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchActividadesPorResponsable.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActividadesPorResponsable.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchActividadesPorResponsable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearActividadFormativa.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearActividadFormativa.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearActividadFormativa.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarActividadFormativa.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarActividadFormativa.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarActividadFormativa.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarActividadFormativa.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarActividadFormativa.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarActividadFormativa.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      })
      // iniciar / completar / cancelar comparten el mismo manejo de "transicionandoId"
      .addCase(iniciarActividadFormativa.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(iniciarActividadFormativa.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(iniciarActividadFormativa.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(completarActividadFormativa.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(completarActividadFormativa.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(completarActividadFormativa.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(cancelarActividadFormativa.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(cancelarActividadFormativa.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(cancelarActividadFormativa.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorActividadFormativa,
  establecerFiltroProcesoActividad,
  establecerFiltroResponsableActividad,
} = actividadFormativaSlice.actions;
export default actividadFormativaSlice.reducer;