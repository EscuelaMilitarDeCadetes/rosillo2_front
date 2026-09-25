// src/features/revision/revisionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/revision/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchRevisiones = createAsyncThunk(
  'revision/fetchRevisiones',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las revisiones.'));
    }
  }
);

export const fetchRevisionesPorInstanciaEtapa = createAsyncThunk(
  'revision/fetchRevisionesPorInstanciaEtapa',
  async (instanciaEtapaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-instancia-etapa/${instanciaEtapaId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por instancia de etapa.'));
    }
  }
);

export const crearRevision = createAsyncThunk(
  'revision/crearRevision',
  // payload: { instancia_etapa, observaciones, aprobado }. La versión la
  // calcula el backend automáticamente (consecutiva), no se envía.
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchRevisiones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar la revisión.'));
    }
  }
);

const revisionSlice = createSlice({
  name: 'revision',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    error: null,
    instanciaEtapaFiltro: null,
  },
  reducers: {
    limpiarErrorRevision: (state) => {
      state.error = null;
    },
    establecerFiltroInstanciaEtapaRevision: (state, action) => {
      state.instanciaEtapaFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevisiones.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRevisiones.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchRevisiones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRevisionesPorInstanciaEtapa.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRevisionesPorInstanciaEtapa.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchRevisionesPorInstanciaEtapa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearRevision.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearRevision.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearRevision.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorRevision,
  establecerFiltroInstanciaEtapaRevision,
} = revisionSlice.actions;
export default revisionSlice.reducer;