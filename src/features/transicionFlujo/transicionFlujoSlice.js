// src/features/transicionFlujo/transicionFlujoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/transicion-flujo/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchTransicionesFlujo = createAsyncThunk(
  'transicionFlujo/fetchTransicionesFlujo',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las transiciones de flujo.'));
    }
  }
);

export const fetchTransicionesPorEtapaOrigen = createAsyncThunk(
  'transicionFlujo/fetchTransicionesPorEtapaOrigen',
  async (etapaOrigenId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-etapa-origen/${etapaOrigenId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por etapa de origen.'));
    }
  }
);

export const crearTransicionFlujo = createAsyncThunk(
  'transicionFlujo/crearTransicionFlujo',
  // payload: { etapa_origen, etapa_destino, nombre, condicion?, accion_automatica?, orden? }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchTransicionesFlujo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear la transición de flujo.'));
    }
  }
);

export const actualizarTransicionFlujo = createAsyncThunk(
  'transicionFlujo/actualizarTransicionFlujo',
  // El viewset solo implementa update() (PUT), no partial_update().
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchTransicionesFlujo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar la transición de flujo.'));
    }
  }
);

export const activarTransicionFlujo = createAsyncThunk(
  'transicionFlujo/activarTransicionFlujo',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/activar/`);
      dispatch(fetchTransicionesFlujo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al activar la transición de flujo.'));
    }
  }
);

export const desactivarTransicionFlujo = createAsyncThunk(
  'transicionFlujo/desactivarTransicionFlujo',
  // Uso esta acción en vez de destroy()/DELETE: ambas hacen lo mismo (activo=False).
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/desactivar/`);
      dispatch(fetchTransicionesFlujo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al desactivar la transición de flujo.'));
    }
  }
);

const transicionFlujoSlice = createSlice({
  name: 'transicionFlujo',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    transicionandoId: null,
    error: null,
    etapaOrigenFiltro: null,
  },
  reducers: {
    limpiarErrorTransicionFlujo: (state) => {
      state.error = null;
    },
    establecerFiltroEtapaOrigenTransicion: (state, action) => {
      state.etapaOrigenFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransicionesFlujo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransicionesFlujo.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchTransicionesFlujo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTransicionesPorEtapaOrigen.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransicionesPorEtapaOrigen.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchTransicionesPorEtapaOrigen.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearTransicionFlujo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearTransicionFlujo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearTransicionFlujo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarTransicionFlujo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarTransicionFlujo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarTransicionFlujo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(activarTransicionFlujo.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(activarTransicionFlujo.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(activarTransicionFlujo.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(desactivarTransicionFlujo.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(desactivarTransicionFlujo.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(desactivarTransicionFlujo.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorTransicionFlujo,
  establecerFiltroEtapaOrigenTransicion,
} = transicionFlujoSlice.actions;
export default transicionFlujoSlice.reducer;