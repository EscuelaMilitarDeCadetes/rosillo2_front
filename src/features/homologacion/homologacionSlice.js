// src/features/homologacion/homologacionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/homologacion/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchHomologaciones = createAsyncThunk(
  'homologacion/fetchHomologaciones',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las homologaciones.'));
    }
  }
);

export const fetchHomologacionPorProceso = createAsyncThunk(
  'homologacion/fetchHomologacionPorProceso',
  async (procesoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proceso/${procesoId}/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      return rejectWithValue(extraerMensajeError(error, 'Error al buscar la homologación del proceso.'));
    }
  }
);

export const fetchHomologacionesPendientes = createAsyncThunk(
  'homologacion/fetchHomologacionesPendientes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}pendientes/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las homologaciones pendientes.'));
    }
  }
);

export const crearHomologacion = createAsyncThunk(
  'homologacion/crearHomologacion',
  // payload: { proceso, observaciones? }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchHomologaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al abrir la solicitud de homologación.'));
    }
  }
);

export const aprobarHomologacion = createAsyncThunk(
  'homologacion/aprobarHomologacion',
  // aprobado_por siempre es request.user en el backend; no se envía desde aquí.
  async ({ id, creditosReconocidos, actaHomologacionId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/aprobar/`, {
        creditos_reconocidos: creditosReconocidos,
        acta_homologacion: actaHomologacionId,
      });
      dispatch(fetchHomologaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al aprobar la homologación.'));
    }
  }
);

export const rechazarHomologacion = createAsyncThunk(
  'homologacion/rechazarHomologacion',
  async ({ id, observaciones }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/rechazar/`, { observaciones });
      dispatch(fetchHomologaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al rechazar la homologación.'));
    }
  }
);

export const cargarActaHomologacion = createAsyncThunk(
  'homologacion/cargarActaHomologacion',
  // Solo válido si la homologación ya está en estado APROBADA.
  async ({ id, actaHomologacionId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/cargar-acta/`, {
        acta_homologacion: actaHomologacionId,
      });
      dispatch(fetchHomologaciones());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar el acta de homologación.'));
    }
  }
);

const homologacionSlice = createSlice({
  name: 'homologacion',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    transicionandoId: null,
    error: null,
    pendientesActivo: false,
    porProceso: null,
  buscandoPorProceso: false,
  },
  reducers: {
    limpiarErrorHomologacion: (state) => {
      state.error = null;
    },
    establecerFiltroPendientesHomologacion: (state, action) => {
      state.pendientesActivo = action.payload ?? true;
    },
    limpiarHomologacionPorProceso: (state) => {
      state.porProceso = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomologaciones.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHomologaciones.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchHomologaciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHomologacionesPendientes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHomologacionesPendientes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchHomologacionesPendientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHomologacionPorProceso.pending, (state) => {
        state.buscandoPorProceso = true;
      })
      .addCase(fetchHomologacionPorProceso.fulfilled, (state, action) => {
        state.buscandoPorProceso = false;
        state.porProceso = action.payload;
      })
      .addCase(fetchHomologacionPorProceso.rejected, (state, action) => {
        state.buscandoPorProceso = false;
        state.error = action.payload;
      })
      .addCase(crearHomologacion.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearHomologacion.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearHomologacion.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // aprobar / rechazar / cargar-acta comparten "transicionandoId"
      .addCase(aprobarHomologacion.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(aprobarHomologacion.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(aprobarHomologacion.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(rechazarHomologacion.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(rechazarHomologacion.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(rechazarHomologacion.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(cargarActaHomologacion.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(cargarActaHomologacion.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(cargarActaHomologacion.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorHomologacion, establecerFiltroPendientesHomologacion, limpiarHomologacionPorProceso } = homologacionSlice.actions;
export default homologacionSlice.reducer;