// src/features/reglaFlujo/reglaFlujoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/regla-flujo/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchReglasFlujo = createAsyncThunk(
  'reglaFlujo/fetchReglasFlujo',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las reglas de flujo.'));
    }
  }
);

export const fetchReglasPorTransicion = createAsyncThunk(
  'reglaFlujo/fetchReglasPorTransicion',
  async ({ etapaOrigenId, etapaDestinoId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-transicion/${etapaOrigenId}/${etapaDestinoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por transición de etapas.'));
    }
  }
);

export const crearReglaFlujo = createAsyncThunk(
  'reglaFlujo/crearReglaFlujo',
  // payload: { etapa_origen, etapa_destino, nombre, operador, tipo_regla, valor_minimo,
  //   valor_maximo, mensaje_error, accion_resultado, descripcion, fecha_inicio,
  //   fecha_fin?, bloqueante?, prioridad? }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchReglasFlujo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear la regla de flujo.'));
    }
  }
);

export const actualizarReglaFlujo = createAsyncThunk(
  'reglaFlujo/actualizarReglaFlujo',
  // El viewset solo implementa update() (PUT), no partial_update().
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchReglasFlujo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar la regla de flujo.'));
    }
  }
);

export const activarReglaFlujo = createAsyncThunk(
  'reglaFlujo/activarReglaFlujo',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/activar/`);
      dispatch(fetchReglasFlujo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al activar la regla de flujo.'));
    }
  }
);

export const desactivarReglaFlujo = createAsyncThunk(
  'reglaFlujo/desactivarReglaFlujo',
  // Uso esta acción (POST) en vez de destroy()/DELETE: ambas hacen lo mismo
  // (activa=False), ver nota de arriba.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/desactivar/`);
      dispatch(fetchReglasFlujo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al desactivar la regla de flujo.'));
    }
  }
);

const reglaFlujoSlice = createSlice({
  name: 'reglaFlujo',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    transicionandoId: null,
    error: null,
    transicionFiltro: null, // { etapaOrigenId, etapaDestinoId }
  },
  reducers: {
    limpiarErrorReglaFlujo: (state) => {
      state.error = null;
    },
    establecerFiltroTransicion: (state, action) => {
      state.transicionFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReglasFlujo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReglasFlujo.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchReglasFlujo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchReglasPorTransicion.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReglasPorTransicion.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchReglasPorTransicion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearReglaFlujo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearReglaFlujo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearReglaFlujo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarReglaFlujo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarReglaFlujo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarReglaFlujo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(activarReglaFlujo.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(activarReglaFlujo.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(activarReglaFlujo.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(desactivarReglaFlujo.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(desactivarReglaFlujo.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(desactivarReglaFlujo.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorReglaFlujo, establecerFiltroTransicion } = reglaFlujoSlice.actions;
export default reglaFlujoSlice.reducer;