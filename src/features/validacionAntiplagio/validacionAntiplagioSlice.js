// src/features/validacionAntiplagio/validacionAntiplagioSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/validacion-antiplagio/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchValidacionesAntiplagio = createAsyncThunk(
  'validacionAntiplagio/fetchValidacionesAntiplagio',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las validaciones de antiplagio.'));
    }
  }
);

export const fetchValidacionesPorInstanciaEtapa = createAsyncThunk(
  'validacionAntiplagio/fetchValidacionesPorInstanciaEtapa',
  async (instanciaEtapaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-instancia-etapa/${instanciaEtapaId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por instancia de etapa.'));
    }
  }
);

export const crearValidacionAntiplagio = createAsyncThunk(
  'validacionAntiplagio/crearValidacionAntiplagio',
  // payload: { instancia_etapa, documento, porcentaje, aprobado }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchValidacionesAntiplagio());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar la validación de antiplagio.'));
    }
  }
);

export const actualizarValidacionAntiplagio = createAsyncThunk(
  'validacionAntiplagio/actualizarValidacionAntiplagio',
  // El viewset solo implementa update() (PUT), no partial_update().
  // instancia_etapa/documento son la llave compuesta y no se reasignan.
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchValidacionesAntiplagio());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar la validación de antiplagio.'));
    }
  }
);

const validacionAntiplagioSlice = createSlice({
  name: 'validacionAntiplagio',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    error: null,
    instanciaEtapaFiltro: null,
  },
  reducers: {
    limpiarErrorValidacionAntiplagio: (state) => {
      state.error = null;
    },
    establecerFiltroInstanciaEtapaValidacion: (state, action) => {
      state.instanciaEtapaFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchValidacionesAntiplagio.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchValidacionesAntiplagio.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchValidacionesAntiplagio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchValidacionesPorInstanciaEtapa.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchValidacionesPorInstanciaEtapa.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchValidacionesPorInstanciaEtapa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearValidacionAntiplagio.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearValidacionAntiplagio.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearValidacionAntiplagio.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarValidacionAntiplagio.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarValidacionAntiplagio.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarValidacionAntiplagio.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorValidacionAntiplagio,
  establecerFiltroInstanciaEtapaValidacion,
} = validacionAntiplagioSlice.actions;
export default validacionAntiplagioSlice.reducer;