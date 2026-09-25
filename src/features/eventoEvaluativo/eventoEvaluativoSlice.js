// src/features/eventoEvaluativo/eventoEvaluativoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/evento-evaluativo/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchEventosEvaluativos = createAsyncThunk(
  'eventoEvaluativo/fetchEventosEvaluativos',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las sustentaciones.'));
    }
  }
);

export const fetchEventosPorProceso = createAsyncThunk(
  'eventoEvaluativo/fetchEventosPorProceso',
  async (procesoFormativoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proceso/${procesoFormativoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por proceso.'));
    }
  }
);

export const fetchEventosProximos = createAsyncThunk(
  'eventoEvaluativo/fetchEventosProximos',
  async (procesoFormativoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}proximas/`, {
        params: procesoFormativoId ? { proceso: procesoFormativoId } : undefined,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las próximas sustentaciones.'));
    }
  }
);

export const crearEventoEvaluativo = createAsyncThunk(
  'eventoEvaluativo/crearEventoEvaluativo',
  // payload: { proceso_formativo, numero, es_obligatoria, fecha_sustentacion, lugar, usuario_revisor? }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchEventosEvaluativos());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al programar la sustentación.'));
    }
  }
);

export const eliminarEventoEvaluativo = createAsyncThunk(
  'eventoEvaluativo/eliminarEventoEvaluativo',
  // Soft-delete: solo permitido si aún no tiene resultado registrado.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchEventosEvaluativos());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al eliminar la sustentación.'));
    }
  }
);

export const reprogramarEventoEvaluativo = createAsyncThunk(
  'eventoEvaluativo/reprogramarEventoEvaluativo',
  async ({ id, fechaSustentacion, lugar }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/reprogramar/`, {
        fecha_sustentacion: fechaSustentacion,
        lugar,
      });
      dispatch(fetchEventosEvaluativos());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al reprogramar la sustentación.'));
    }
  }
);

export const registrarResultadoEvento = createAsyncThunk(
  'eventoEvaluativo/registrarResultadoEvento',
  async ({ id, resultado, actaSustentacionId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/registrar-resultado/`, {
        resultado,
        acta_sustentacion: actaSustentacionId,
      });
      dispatch(fetchEventosEvaluativos());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar el resultado.'));
    }
  }
);

export const cargarActaEvento = createAsyncThunk(
  'eventoEvaluativo/cargarActaEvento',
  // Requiere que el evento ya tenga un resultado registrado (no PENDIENTE).
  async ({ id, actaSustentacionId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/cargar-acta/`, {
        acta_sustentacion: actaSustentacionId,
      });
      dispatch(fetchEventosEvaluativos());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar el acta.'));
    }
  }
);

const eventoEvaluativoSlice = createSlice({
  name: 'eventoEvaluativo',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    // id del evento con una acción de estado en curso (reprogramar/registrar-resultado/cargar-acta)
    transicionandoId: null,
    error: null,
    procesoFiltro: null,
    proximasActivo: false,
  },
  reducers: {
    limpiarErrorEventoEvaluativo: (state) => {
      state.error = null;
    },
    establecerFiltroProcesoEvento: (state, action) => {
      state.procesoFiltro = action.payload || null;
      state.proximasActivo = false;
    },
    establecerFiltroProximas: (state, action) => {
      state.proximasActivo = true;
      state.procesoFiltro = action.payload ?? null;
    },
    limpiarFiltrosEventoEvaluativo: (state) => {
      state.procesoFiltro = null;
      state.proximasActivo = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventosEvaluativos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEventosEvaluativos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchEventosEvaluativos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventosPorProceso.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEventosPorProceso.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchEventosPorProceso.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventosProximos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEventosProximos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchEventosProximos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearEventoEvaluativo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearEventoEvaluativo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearEventoEvaluativo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarEventoEvaluativo.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarEventoEvaluativo.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarEventoEvaluativo.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      })
      // reprogramar / registrar-resultado / cargar-acta comparten "transicionandoId"
      .addCase(reprogramarEventoEvaluativo.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(reprogramarEventoEvaluativo.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(reprogramarEventoEvaluativo.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(registrarResultadoEvento.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(registrarResultadoEvento.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(registrarResultadoEvento.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(cargarActaEvento.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(cargarActaEvento.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(cargarActaEvento.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorEventoEvaluativo,
  establecerFiltroProcesoEvento,
  establecerFiltroProximas,
  limpiarFiltrosEventoEvaluativo,
} = eventoEvaluativoSlice.actions;
export default eventoEvaluativoSlice.reducer;