// src/features/registroActividades/registroActividadesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/registro-actividades/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchRegistrosActividades = createAsyncThunk(
  'registroActividades/fetchRegistrosActividades',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los registros de actividades.'));
    }
  }
);

export const fetchRegistrosPorProceso = createAsyncThunk(
  'registroActividades/fetchRegistrosPorProceso',
  async (procesoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proceso/${procesoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por proceso.'));
    }
  }
);

export const crearRegistroActividades = createAsyncThunk(
  'registroActividades/crearRegistroActividades',
  // payload: { proceso, registrado_por, tipo_periodo, actividades, horas_reportadas?,
  //   fecha_periodo?, documento?, nota? }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchRegistrosActividades());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear el registro de actividades.'));
    }
  }
);

export const actualizarRegistroActividades = createAsyncThunk(
  'registroActividades/actualizarRegistroActividades',
  // El viewset solo implementa update() (PUT), no partial_update(). Solo
  // permitido si el registro aún no fue aprobado.
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchRegistrosActividades());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar el registro de actividades.'));
    }
  }
);

export const eliminarRegistroActividades = createAsyncThunk(
  'registroActividades/eliminarRegistroActividades',
  // Soft-delete; rechazado si el registro ya fue aprobado.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchRegistrosActividades());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al eliminar el registro de actividades.'));
    }
  }
);

export const aprobarRegistroActividades = createAsyncThunk(
  'registroActividades/aprobarRegistroActividades',
  // Al aprobar, el backend recalcula automáticamente el RegistroHoras del proceso.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/aprobar/`);
      dispatch(fetchRegistrosActividades());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al aprobar el registro de actividades.'));
    }
  }
);

const registroActividadesSlice = createSlice({
  name: 'registroActividades',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    transicionandoId: null,
    error: null,
    procesoFiltro: null,
  },
  reducers: {
    limpiarErrorRegistroActividades: (state) => {
      state.error = null;
    },
    establecerFiltroProcesoRegistroActividades: (state, action) => {
      state.procesoFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegistrosActividades.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRegistrosActividades.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchRegistrosActividades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRegistrosPorProceso.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRegistrosPorProceso.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchRegistrosPorProceso.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearRegistroActividades.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearRegistroActividades.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearRegistroActividades.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarRegistroActividades.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarRegistroActividades.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarRegistroActividades.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarRegistroActividades.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarRegistroActividades.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarRegistroActividades.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      })
      .addCase(aprobarRegistroActividades.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(aprobarRegistroActividades.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(aprobarRegistroActividades.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorRegistroActividades,
  establecerFiltroProcesoRegistroActividades,
} = registroActividadesSlice.actions;
export default registroActividadesSlice.reducer;