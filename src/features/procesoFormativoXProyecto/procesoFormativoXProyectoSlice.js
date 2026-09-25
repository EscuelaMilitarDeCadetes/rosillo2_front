// src/features/procesoFormativoXProyecto/procesoFormativoXProyectoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/proceso-formativo-proyecto/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchVinculosProyecto = createAsyncThunk(
  'procesoFormativoXProyecto/fetchVinculosProyecto',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las vinculaciones proceso-proyecto.'));
    }
  }
);

export const fetchVinculosPorProceso = createAsyncThunk(
  'procesoFormativoXProyecto/fetchVinculosPorProceso',
  async (procesoFormativoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proceso-formativo/${procesoFormativoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por proceso formativo.'));
    }
  }
);

export const crearVinculoProyecto = createAsyncThunk(
  'procesoFormativoXProyecto/crearVinculoProyecto',
  // payload: { proceso_formativo, proyecto_formal }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchVinculosProyecto());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al vincular el proyecto formal.'));
    }
  }
);

export const actualizarVinculoProyecto = createAsyncThunk(
  'procesoFormativoXProyecto/actualizarVinculoProyecto',
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchVinculosProyecto());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar la vinculación.'));
    }
  }
);

export const eliminarVinculoProyecto = createAsyncThunk(
  'procesoFormativoXProyecto/eliminarVinculoProyecto',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchVinculosProyecto());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al eliminar la vinculación.'));
    }
  }
);

const procesoFormativoXProyectoSlice = createSlice({
  name: 'procesoFormativoXProyecto',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    error: null,
    procesoFiltro: null,
  },
  reducers: {
    limpiarErrorVinculoProyecto: (state) => {
      state.error = null;
    },
    establecerFiltroProcesoVinculo: (state, action) => {
      state.procesoFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVinculosProyecto.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVinculosProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchVinculosProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVinculosPorProceso.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVinculosPorProceso.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchVinculosPorProceso.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearVinculoProyecto.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearVinculoProyecto.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearVinculoProyecto.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarVinculoProyecto.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarVinculoProyecto.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarVinculoProyecto.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarVinculoProyecto.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarVinculoProyecto.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarVinculoProyecto.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorVinculoProyecto,
  establecerFiltroProcesoVinculo,
} = procesoFormativoXProyectoSlice.actions;
export default procesoFormativoXProyectoSlice.reducer;