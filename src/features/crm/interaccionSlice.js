// src/features/crm/interaccionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'crm/interaccion/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchInteracciones = createAsyncThunk(
  'interaccion/fetchInteracciones',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las interacciones.'));
    }
  }
);

export const fetchInteraccionesPorEntidad = createAsyncThunk(
  'interaccion/fetchInteraccionesPorEntidad',
  async (entidadId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-entidad/${entidadId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por entidad.'));
    }
  }
);

export const fetchInteraccionesPorProyecto = createAsyncThunk(
  'interaccion/fetchInteraccionesPorProyecto',
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proyecto/${proyectoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por proyecto.'));
    }
  }
);

export const fetchInteraccionesPorMedio = createAsyncThunk(
  'interaccion/fetchInteraccionesPorMedio',
  async (medio, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-medio/`, { params: { medio } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por medio.'));
    }
  }
);

export const fetchEntidadesOpciones = createAsyncThunk(
  'interaccion/fetchEntidadesOpciones',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('crm/entidad-externa/', { params: { page_size: 100 } });
      return response.data.results ?? [];
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las entidades externas.'));
    }
  }
);

// Requiere ambito 'formal' en el JWT (TieneAmbitoFormal); si el usuario CRM
// no tiene ese ámbito, este fetch puede fallar y el select queda vacío sin
// romper el resto del formulario.
export const fetchProyectosOpciones = createAsyncThunk(
  'interaccion/fetchProyectosOpciones',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('investigacion-formal/proyectos/', {
        params: { page_size: 100 },
      });
      return response.data.results ?? [];
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los proyectos.'));
    }
  }
);

export const crearInteraccion = createAsyncThunk(
  'interaccion/crearInteraccion',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchInteracciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar la interacción.'));
    }
  }
);

export const actualizarInteraccion = createAsyncThunk(
  'interaccion/actualizarInteraccion',
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/`, payload);
      dispatch(fetchInteracciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar la interacción.'));
    }
  }
);

export const eliminarInteraccion = createAsyncThunk(
  'interaccion/eliminarInteraccion',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchInteracciones());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al eliminar la interacción.'));
    }
  }
);

const interaccionSlice = createSlice({
  name: 'interaccion',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    error: null,
    // Filtros de tabla, mutuamente excluyentes
    entidadFiltro: null,
    proyectoFiltro: null,
    medioFiltro: null,
    entidadesOpciones: [],
    entidadesOpcionesLoading: false,
    proyectosOpciones: [],
    proyectosOpcionesLoading: false,
  },
  reducers: {
    limpiarErrorInteraccion: (state) => {
      state.error = null;
    },
    establecerFiltroEntidad: (state, action) => {
      state.entidadFiltro = action.payload || null;
      if (action.payload) {
        state.proyectoFiltro = null;
        state.medioFiltro = null;
      }
    },
    establecerFiltroProyecto: (state, action) => {
      state.proyectoFiltro = action.payload || null;
      if (action.payload) {
        state.entidadFiltro = null;
        state.medioFiltro = null;
      }
    },
    establecerFiltroMedio: (state, action) => {
      state.medioFiltro = action.payload || null;
      if (action.payload) {
        state.entidadFiltro = null;
        state.proyectoFiltro = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteracciones.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInteracciones.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchInteracciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInteraccionesPorEntidad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInteraccionesPorEntidad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchInteraccionesPorEntidad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInteraccionesPorProyecto.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInteraccionesPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchInteraccionesPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInteraccionesPorMedio.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInteraccionesPorMedio.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchInteraccionesPorMedio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEntidadesOpciones.pending, (state) => {
        state.entidadesOpcionesLoading = true;
      })
      .addCase(fetchEntidadesOpciones.fulfilled, (state, action) => {
        state.entidadesOpcionesLoading = false;
        state.entidadesOpciones = action.payload;
      })
      .addCase(fetchEntidadesOpciones.rejected, (state) => {
        state.entidadesOpcionesLoading = false;
      })
      .addCase(fetchProyectosOpciones.pending, (state) => {
        state.proyectosOpcionesLoading = true;
      })
      .addCase(fetchProyectosOpciones.fulfilled, (state, action) => {
        state.proyectosOpcionesLoading = false;
        state.proyectosOpciones = action.payload;
      })
      .addCase(fetchProyectosOpciones.rejected, (state) => {
        state.proyectosOpcionesLoading = false;
      })
      .addCase(crearInteraccion.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearInteraccion.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearInteraccion.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarInteraccion.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarInteraccion.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarInteraccion.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarInteraccion.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarInteraccion.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarInteraccion.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorInteraccion,
  establecerFiltroEntidad,
  establecerFiltroProyecto,
  establecerFiltroMedio,
} = interaccionSlice.actions;
export default interaccionSlice.reducer;