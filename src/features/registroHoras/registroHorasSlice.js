// src/features/registroHoras/registroHorasSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/registro-horas/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchRegistrosHoras = createAsyncThunk(
  'registroHoras/fetchRegistrosHoras',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar el control de horas.'));
    }
  }
);

export const fetchRegistroHorasPorProceso = createAsyncThunk(
  'registroHoras/fetchRegistroHorasPorProceso',
  async (procesoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proceso/${procesoId}/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      return rejectWithValue(extraerMensajeError(error, 'Error al buscar el control de horas del proceso.'));
    }
  }
);

export const crearRegistroHoras = createAsyncThunk(
  'registroHoras/crearRegistroHoras',
  // payload: { proceso, horas_requeridas? } — 1:1 por proceso (existe_para_proceso).
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchRegistrosHoras());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear el control de horas.'));
    }
  }
);

export const ajustarHorasRequeridas = createAsyncThunk(
  'registroHoras/ajustarHorasRequeridas',
  async ({ id, horasRequeridas }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/ajustar-horas-requeridas/`, {
        horas_requeridas: horasRequeridas,
      });
      dispatch(fetchRegistrosHoras());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al ajustar las horas requeridas.'));
    }
  }
);

export const recalcularRegistroHoras = createAsyncThunk(
  'registroHoras/recalcularRegistroHoras',
  // Suma las horas_reportadas de los RegistroActividades del proceso.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/recalcular/`);
      dispatch(fetchRegistrosHoras());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al recalcular las horas acumuladas.'));
    }
  }
);

const registroHorasSlice = createSlice({
  name: 'registroHoras',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    porProceso: null,
    buscandoPorProceso: false,
    transicionandoId: null,
    error: null,
  },
  reducers: {
    limpiarErrorRegistroHoras: (state) => {
      state.error = null;
    },
    limpiarRegistroHorasPorProceso: (state) => {
      state.porProceso = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegistrosHoras.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRegistrosHoras.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchRegistrosHoras.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearRegistroHoras.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearRegistroHoras.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearRegistroHoras.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(fetchRegistroHorasPorProceso.pending, (state) => {
        state.buscandoPorProceso = true;
      })
      .addCase(fetchRegistroHorasPorProceso.fulfilled, (state, action) => {
        state.buscandoPorProceso = false;
        state.porProceso = action.payload;
      })
      .addCase(fetchRegistroHorasPorProceso.rejected, (state, action) => {
        state.buscandoPorProceso = false;
        state.error = action.payload;
      })
      .addCase(ajustarHorasRequeridas.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(ajustarHorasRequeridas.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(ajustarHorasRequeridas.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(recalcularRegistroHoras.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(recalcularRegistroHoras.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(recalcularRegistroHoras.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorRegistroHoras, limpiarRegistroHorasPorProceso } = registroHorasSlice.actions;
export default registroHorasSlice.reducer;