// src/features/bancoIdeas/bancoIdeasSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/banco-ideas/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchBancoIdeas = createAsyncThunk(
  'bancoIdeas/fetchBancoIdeas',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar el banco de ideas.'));
    }
  }
);

// por-facultad no está paginada; admite un filtro opcional de estado por query param.
export const fetchBancoIdeasPorFacultad = createAsyncThunk(
  'bancoIdeas/fetchBancoIdeasPorFacultad',
  async ({ facultadId, estado } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-facultad/${facultadId}/`, {
        params: estado ? { estado } : undefined,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar el banco de ideas por facultad.'));
    }
  }
);

// disponibles tampoco está paginada; facultad es opcional (filtra global si se omite).
export const fetchBancoIdeasDisponibles = createAsyncThunk(
  'bancoIdeas/fetchBancoIdeasDisponibles',
  async (facultadId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}disponibles/`, {
        params: facultadId ? { facultad: facultadId } : undefined,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las ideas disponibles.'));
    }
  }
);

export const crearBancoIdea = createAsyncThunk(
  'bancoIdeas/crearBancoIdea',
  // payload: { facultad, idea, descripcion, linea_investigacion, palabras_clave }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchBancoIdeas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar la idea en el banco.'));
    }
  }
);

export const actualizarBancoIdea = createAsyncThunk(
  'bancoIdeas/actualizarBancoIdea',
  // Solo backend solo implementa update() (PUT), no partial_update(); ver nota
  // de arriba. El título ('idea') no es editable, solo descripcion/linea/palabras_clave.
  // payload: { descripcion, linea_investigacion, palabras_clave }
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchBancoIdeas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar la idea.'));
    }
  }
);

export const eliminarBancoIdea = createAsyncThunk(
  'bancoIdeas/eliminarBancoIdea',
  // Backend rechaza eliminar ideas en estado TOMADA.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchBancoIdeas());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al eliminar la idea.'));
    }
  }
);

export const separarBancoIdea = createAsyncThunk(
  'bancoIdeas/separarBancoIdea',
  // DISPONIBLE -> SEPARADA
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/separar/`);
      dispatch(fetchBancoIdeas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al separar la idea.'));
    }
  }
);

export const tomarBancoIdea = createAsyncThunk(
  'bancoIdeas/tomarBancoIdea',
  // DISPONIBLE o SEPARADA -> TOMADA
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/tomar/`);
      dispatch(fetchBancoIdeas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al confirmar la toma de la idea.'));
    }
  }
);

export const liberarBancoIdea = createAsyncThunk(
  'bancoIdeas/liberarBancoIdea',
  // SEPARADA -> DISPONIBLE
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/liberar/`);
      dispatch(fetchBancoIdeas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al liberar la idea.'));
    }
  }
);

const bancoIdeasSlice = createSlice({
  name: 'bancoIdeas',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    // id de la idea con una transición de estado en curso (separar/tomar/liberar)
    transicionandoId: null,
    error: null,
    // por-facultad y disponibles son mutuamente excluyentes frente a la lista
    // paginada general, igual que el patrón de filtros en entidadExternaSlice.
    facultadFiltro: null,
    estadoFiltro: null,
    disponiblesActivo: false,
  },
  reducers: {
    limpiarErrorBancoIdeas: (state) => {
      state.error = null;
    },
    establecerFiltroFacultadIdea: (state, action) => {
      state.facultadFiltro = action.payload?.facultadId ?? null;
      state.estadoFiltro = action.payload?.estado ?? null;
      state.disponiblesActivo = false;
    },
    establecerFiltroDisponiblesIdea: (state, action) => {
      state.disponiblesActivo = true;
      state.facultadFiltro = action.payload ?? null;
      state.estadoFiltro = null;
    },
    limpiarFiltrosBancoIdeas: (state) => {
      state.facultadFiltro = null;
      state.estadoFiltro = null;
      state.disponiblesActivo = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBancoIdeas.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBancoIdeas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchBancoIdeas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBancoIdeasPorFacultad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBancoIdeasPorFacultad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchBancoIdeasPorFacultad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBancoIdeasDisponibles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBancoIdeasDisponibles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchBancoIdeasDisponibles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearBancoIdea.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearBancoIdea.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearBancoIdea.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarBancoIdea.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarBancoIdea.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarBancoIdea.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarBancoIdea.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarBancoIdea.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarBancoIdea.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      })
      // separar / tomar / liberar comparten el mismo manejo de "transicionandoId"
      .addCase(separarBancoIdea.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(separarBancoIdea.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(separarBancoIdea.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(tomarBancoIdea.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(tomarBancoIdea.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(tomarBancoIdea.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(liberarBancoIdea.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(liberarBancoIdea.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(liberarBancoIdea.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorBancoIdeas,
  establecerFiltroFacultadIdea,
  establecerFiltroDisponiblesIdea,
  limpiarFiltrosBancoIdeas,
} = bancoIdeasSlice.actions;
export default bancoIdeasSlice.reducer;