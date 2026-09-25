// src/features/instanciaEtapa/instanciaEtapaSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/instancia-etapa/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchInstanciasEtapa = createAsyncThunk(
  'instanciaEtapa/fetchInstanciasEtapa',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las instancias de etapa.'));
    }
  }
);

export const fetchInstanciasPorProceso = createAsyncThunk(
  'instanciaEtapa/fetchInstanciasPorProceso',
  async (procesoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proceso/${procesoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por proceso.'));
    }
  }
);

export const crearInstanciaEtapa = createAsyncThunk(
  'instanciaEtapa/crearInstanciaEtapa',
  async (payload, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      const { procesoFiltro } = getState().instanciaEtapa;
      if (procesoFiltro) {
        dispatch(fetchInstanciasPorProceso(procesoFiltro));
      } else {
        dispatch(fetchInstanciasEtapa());
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear la instancia de etapa.'));
    }
  }
);

export const iniciarInstanciaEtapa = createAsyncThunk(
  'instanciaEtapa/iniciarInstanciaEtapa',
  // PENDIENTE -> EN_PROCESO
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/iniciar/`);
      dispatch(fetchInstanciasEtapa());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al iniciar la etapa.'));
    }
  }
);

export const aprobarInstanciaEtapa = createAsyncThunk(
  'instanciaEtapa/aprobarInstanciaEtapa',
  // EN_PROCESO o SEGUNDA_INSTANCIA -> APROBADO
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/aprobar/`);
      dispatch(fetchInstanciasEtapa());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al aprobar la etapa.'));
    }
  }
);

export const rechazarInstanciaEtapa = createAsyncThunk(
  'instanciaEtapa/rechazarInstanciaEtapa',
  // EN_PROCESO o SEGUNDA_INSTANCIA -> RECHAZADO
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/rechazar/`);
      dispatch(fetchInstanciasEtapa());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al rechazar la etapa.'));
    }
  }
);

export const marcarSegundaInstancia = createAsyncThunk(
  'instanciaEtapa/marcarSegundaInstancia',
  // RECHAZADO -> SEGUNDA_INSTANCIA
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/segunda-instancia/`);
      dispatch(fetchInstanciasEtapa());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al pasar la etapa a segunda instancia.'));
    }
  }
);

const instanciaEtapaSlice = createSlice({
  name: 'instanciaEtapa',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    transicionandoId: null,
    error: null,
    procesoFiltro: null,
  },
  reducers: {
    limpiarErrorInstanciaEtapa: (state) => {
      state.error = null;
    },
    establecerFiltroProcesoInstancia: (state, action) => {
      state.procesoFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstanciasEtapa.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInstanciasEtapa.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchInstanciasEtapa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInstanciasPorProceso.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInstanciasPorProceso.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchInstanciasPorProceso.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearInstanciaEtapa.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearInstanciaEtapa.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearInstanciaEtapa.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(iniciarInstanciaEtapa.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(iniciarInstanciaEtapa.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(iniciarInstanciaEtapa.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(aprobarInstanciaEtapa.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(aprobarInstanciaEtapa.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(aprobarInstanciaEtapa.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(rechazarInstanciaEtapa.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(rechazarInstanciaEtapa.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(rechazarInstanciaEtapa.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(marcarSegundaInstancia.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(marcarSegundaInstancia.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(marcarSegundaInstancia.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorInstanciaEtapa, establecerFiltroProcesoInstancia } = instanciaEtapaSlice.actions;
export default instanciaEtapaSlice.reducer;