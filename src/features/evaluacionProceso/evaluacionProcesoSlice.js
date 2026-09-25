// src/features/evaluacionProceso/evaluacionProcesoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/evaluacion-proceso/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchEvaluacionesProceso = createAsyncThunk(
  'evaluacionProceso/fetchEvaluacionesProceso',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las evaluaciones de proceso.'));
    }
  }
);

export const fetchEvaluacionesPorInstanciaEtapa = createAsyncThunk(
  'evaluacionProceso/fetchEvaluacionesPorInstanciaEtapa',
  async (instanciaEtapaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-instancia-etapa/${instanciaEtapaId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por instancia de etapa.'));
    }
  }
);

export const fetchEvaluacionesPorProceso = createAsyncThunk(
  'evaluacionProceso/fetchEvaluacionesPorProceso',
  async (procesoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proceso/${procesoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por proceso.'));
    }
  }
);

export const fetchTercerosEvaluadores = createAsyncThunk(
  'evaluacionProceso/fetchTercerosEvaluadores',
  async (procesoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}terceros-evaluadores/${procesoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los terceros evaluadores.'));
    }
  }
);

export const crearEvaluacionProceso = createAsyncThunk(
  'evaluacionProceso/crearEvaluacionProceso',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchEvaluacionesProceso());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar la evaluación de proceso.'));
    }
  }
);
const evaluacionProcesoSlice = createSlice({
  name: 'evaluacionProceso',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    error: null,
    instanciaEtapaFiltro: null,
    procesoFiltro: null,
    soloTerceros: false,
  },
  reducers: {
    limpiarErrorEvaluacionProceso: (state) => {
      state.error = null;
    },
    establecerFiltroInstanciaEtapa: (state, action) => {
      state.instanciaEtapaFiltro = action.payload || null;
      state.procesoFiltro = null;
      state.soloTerceros = false;
    },
    establecerFiltroProcesoEvaluacion: (state, action) => {
      state.procesoFiltro = action.payload || null;
      state.instanciaEtapaFiltro = null;
      state.soloTerceros = false;
    },
    establecerFiltroTercerosEvaluadores: (state, action) => {
      state.procesoFiltro = action.payload || null;
      state.instanciaEtapaFiltro = null;
      state.soloTerceros = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvaluacionesProceso.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvaluacionesProceso.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchEvaluacionesProceso.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEvaluacionesPorInstanciaEtapa.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvaluacionesPorInstanciaEtapa.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchEvaluacionesPorInstanciaEtapa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEvaluacionesPorProceso.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvaluacionesPorProceso.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchEvaluacionesPorProceso.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTercerosEvaluadores.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTercerosEvaluadores.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchTercerosEvaluadores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearEvaluacionProceso.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearEvaluacionProceso.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearEvaluacionProceso.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});
export const {
  limpiarErrorEvaluacionProceso,
  establecerFiltroInstanciaEtapa,
  establecerFiltroProcesoEvaluacion,
  establecerFiltroTercerosEvaluadores,
} = evaluacionProcesoSlice.actions;
export default evaluacionProcesoSlice.reducer;