// src/features/segundaInstancia/segundaInstanciaSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/segunda-instancia/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchSegundasInstancias = createAsyncThunk(
  'segundaInstancia/fetchSegundasInstancias',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las segundas instancias.'));
    }
  }
);

export const fetchSegundasInstanciasActivadasPendientes = createAsyncThunk(
  'segundaInstancia/fetchSegundasInstanciasActivadasPendientes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}activadas-pendientes/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las pendientes de consumir.'));
    }
  }
);

export const crearSegundaInstancia = createAsyncThunk(
  'segundaInstancia/crearSegundaInstancia',
  // payload: { proceso, instancia_etapa, evaluacion, etapa_retorno, tipo, motivo, nota_maxima? }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchSegundasInstancias());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar la segunda instancia.'));
    }
  }
);

export const eliminarSegundaInstancia = createAsyncThunk(
  'segundaInstancia/eliminarSegundaInstancia',
  // Soft-delete real (activa=False) vía DELETE normal.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchSegundasInstancias());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al desactivar la segunda instancia.'));
    }
  }
);

export const activarSegundaInstanciaDirecto = createAsyncThunk(
  'segundaInstancia/activarSegundaInstanciaDirecto',
  // Decisión DIRECTA (Decano/Soporte).
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/activar/`);
      dispatch(fetchSegundasInstancias());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al activar la segunda instancia.'));
    }
  }
);

export const consumirSegundaInstancia = createAsyncThunk(
  'segundaInstancia/consumirSegundaInstancia',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/consumir/`);
      dispatch(fetchSegundasInstancias());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al marcar la segunda instancia como consumida.'));
    }
  }
);

export const solicitarActivacionDecano = createAsyncThunk(
  'segundaInstancia/solicitarActivacionDecano',
  // Abre una Aprobacion, no activa directamente.
  async ({ id, usuarioRevisorId, observacion }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/solicitar-activacion-decano/`, {
        usuario_revisor: usuarioRevisorId,
        observacion,
      });
      dispatch(fetchSegundasInstancias());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al solicitar la activación al Decano.'));
    }
  }
);

export const confirmarActivacionDecano = createAsyncThunk(
  'segundaInstancia/confirmarActivacionDecano',
  async ({ aprobacionId, observacionDecano }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}confirmar-activacion-decano/${aprobacionId}/`, {
        observacion_decano: observacionDecano,
      });
      dispatch(fetchSegundasInstancias());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al confirmar la activación del Decano.'));
    }
  }
);

export const denegarActivacionDecano = createAsyncThunk(
  'segundaInstancia/denegarActivacionDecano',
  async ({ aprobacionId, observacion }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}denegar-activacion-decano/${aprobacionId}/`, {
        observacion,
      });
      dispatch(fetchSegundasInstancias());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al denegar la activación.'));
    }
  }
);

const segundaInstanciaSlice = createSlice({
  name: 'segundaInstancia',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    transicionandoId: null,
    transicionandoAprobacionId: null,
    error: null,
    pendientesActivo: false,
  },
  reducers: {
    limpiarErrorSegundaInstancia: (state) => {
      state.error = null;
    },
    establecerFiltroPendientesSegundaInstancia: (state, action) => {
      state.pendientesActivo = action.payload ?? true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSegundasInstancias.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSegundasInstancias.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchSegundasInstancias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSegundasInstanciasActivadasPendientes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSegundasInstanciasActivadasPendientes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchSegundasInstanciasActivadasPendientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearSegundaInstancia.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearSegundaInstancia.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearSegundaInstancia.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarSegundaInstancia.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarSegundaInstancia.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarSegundaInstancia.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      });

    // activar / consumir / solicitar-activacion-decano comparten "transicionandoId"
    [activarSegundaInstanciaDirecto, consumirSegundaInstancia, solicitarActivacionDecano].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state, action) => {
          const arg = action.meta.arg;
          state.transicionandoId = typeof arg === 'object' ? arg.id : arg;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state) => {
          state.transicionandoId = null;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.transicionandoId = null;
          state.error = action.payload;
        });
    });

    // confirmar/denegar por decano se identifican por aprobacionId
    [confirmarActivacionDecano, denegarActivacionDecano].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state, action) => {
          state.transicionandoAprobacionId = action.meta.arg.aprobacionId;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state) => {
          state.transicionandoAprobacionId = null;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.transicionandoAprobacionId = null;
          state.error = action.payload;
        });
    });
  },
});

export const {
  limpiarErrorSegundaInstancia,
  establecerFiltroPendientesSegundaInstancia,
} = segundaInstanciaSlice.actions;
export default segundaInstanciaSlice.reducer;