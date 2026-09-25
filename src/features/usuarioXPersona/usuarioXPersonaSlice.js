// src/features/usuarioXPersona/usuarioXPersonaSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'usuarios/usuario-persona/';

export const fetchAsignaciones = createAsyncThunk(
  'usuarioXPersona/fetchAsignaciones',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar las asignaciones usuario-persona.');
    }
  }
);

export const fetchAsignacionActual = createAsyncThunk(
  'usuarioXPersona/fetchAsignacionActual',
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}${usuarioId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'No se encontró la asignación de ese usuario.');
    }
  }
);

export const fetchHistoricoAsignacion = createAsyncThunk(
  'usuarioXPersona/fetchHistoricoAsignacion',
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}${usuarioId}/historico/`);
      return { usuarioId, historico: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar el histórico de asignaciones.');
    }
  }
);

export const reasignarPersona = createAsyncThunk(
  'usuarioXPersona/reasignarPersona',
  async ({ usuario_id, persona_id }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}reasignar/`, { usuario_id, persona_id });
      dispatch(fetchAsignaciones());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === 'string' ? data : data?.error || 'Error al reasignar la persona.';
      return rejectWithValue(mensaje);
    }
  }
);

export const fetchRotaciones = createAsyncThunk(
  'usuarioXPersona/fetchRotaciones',
  async ({ desde, hasta } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      const response = await axiosInstance.get(`${BASE}rotaciones/`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar las rotaciones.');
    }
  }
);

const usuarioXPersonaSlice = createSlice({
  name: 'usuarioXPersona',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    asignacionActual: null,
    asignacionActualLoading: false,
    historicoPorUsuario: {},
    historicoLoading: false,
    rotaciones: [],
    rotacionesLoading: false,
    saving: false,
    error: null,
  },
  reducers: {
    limpiarErrorUsuarioXPersona: (state) => {
      state.error = null;
    },
    limpiarAsignacionActual: (state) => {
      state.asignacionActual = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAsignaciones.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAsignaciones.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchAsignaciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAsignacionActual.pending, (state) => {
        state.asignacionActualLoading = true;
      })
      .addCase(fetchAsignacionActual.fulfilled, (state, action) => {
        state.asignacionActualLoading = false;
        state.asignacionActual = action.payload;
      })
      .addCase(fetchAsignacionActual.rejected, (state, action) => {
        state.asignacionActualLoading = false;
        state.asignacionActual = null;
        state.error = action.payload;
      })
      .addCase(fetchHistoricoAsignacion.pending, (state) => {
        state.historicoLoading = true;
      })
      .addCase(fetchHistoricoAsignacion.fulfilled, (state, action) => {
        state.historicoLoading = false;
        state.historicoPorUsuario[action.payload.usuarioId] = action.payload.historico;
      })
      .addCase(fetchHistoricoAsignacion.rejected, (state, action) => {
        state.historicoLoading = false;
        state.error = action.payload;
      })
      .addCase(reasignarPersona.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(reasignarPersona.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(reasignarPersona.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(fetchRotaciones.pending, (state) => {
        state.rotacionesLoading = true;
      })
      .addCase(fetchRotaciones.fulfilled, (state, action) => {
        state.rotacionesLoading = false;
        state.rotaciones = action.payload ?? [];
      })
      .addCase(fetchRotaciones.rejected, (state, action) => {
        state.rotacionesLoading = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorUsuarioXPersona, limpiarAsignacionActual } = usuarioXPersonaSlice.actions;
export default usuarioXPersonaSlice.reducer;