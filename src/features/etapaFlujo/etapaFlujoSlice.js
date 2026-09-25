// src/features/etapaFlujo/etapaFlujoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/etapa-flujo/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchEtapasFlujo = createAsyncThunk(
  'etapaFlujo/fetchEtapasFlujo',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las etapas de flujo.'));
    }
  }
);

export const fetchEtapasPorFlujo = createAsyncThunk(
  'etapaFlujo/fetchEtapasPorFlujo',
  async (flujoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-flujo/${flujoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por flujo.'));
    }
  }
);

export const crearEtapaFlujo = createAsyncThunk(
  'etapaFlujo/crearEtapaFlujo',
  // payload: { flujo, nombre, orden, codigo, rol_responsable, documento_requerido?,
  //   descripcion?, tipo_etapa?, es_obligatoria, permite_paralelismo, permite_reversion,
  //   permite_salto, requiere_aprobacion, requiere_documento, requiere_firma,
  //   requiere_evaluacion, es_final, permite_reintentos }
  // IMPORTANTE: enviar SIEMPRE los 7 booleanos "requiere_*"/"permite_*" de forma
  // explícita (ver nota sobre el default=False del viewset vs default=True del modelo).
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchEtapasFlujo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear la etapa de flujo.'));
    }
  }
);

export const actualizarEtapaFlujo = createAsyncThunk(
  'etapaFlujo/actualizarEtapaFlujo',
  // El viewset solo implementa update() (PUT), no partial_update().
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchEtapasFlujo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar la etapa de flujo.'));
    }
  }
);

export const activarEtapaFlujo = createAsyncThunk(
  'etapaFlujo/activarEtapaFlujo',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/activar/`);
      dispatch(fetchEtapasFlujo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al activar la etapa de flujo.'));
    }
  }
);

export const desactivarEtapaFlujo = createAsyncThunk(
  'etapaFlujo/desactivarEtapaFlujo',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/desactivar/`);
      dispatch(fetchEtapasFlujo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al desactivar la etapa de flujo.'));
    }
  }
);

const etapaFlujoSlice = createSlice({
  name: 'etapaFlujo',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    transicionandoId: null,
    error: null,
    flujoFiltro: null,
  },
  reducers: {
    limpiarErrorEtapaFlujo: (state) => {
      state.error = null;
    },
    establecerFiltroFlujoEtapa: (state, action) => {
      state.flujoFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEtapasFlujo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEtapasFlujo.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchEtapasFlujo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEtapasPorFlujo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEtapasPorFlujo.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchEtapasPorFlujo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearEtapaFlujo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearEtapaFlujo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearEtapaFlujo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarEtapaFlujo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarEtapaFlujo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarEtapaFlujo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(activarEtapaFlujo.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(activarEtapaFlujo.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(activarEtapaFlujo.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(desactivarEtapaFlujo.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(desactivarEtapaFlujo.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(desactivarEtapaFlujo.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorEtapaFlujo, establecerFiltroFlujoEtapa } = etapaFlujoSlice.actions;
export default etapaFlujoSlice.reducer;