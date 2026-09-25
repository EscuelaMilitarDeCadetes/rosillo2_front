// src/features/planTrabajo/planTrabajoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/plan-trabajo/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchPlanesTrabajo = createAsyncThunk(
  'planTrabajo/fetchPlanesTrabajo',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los planes de trabajo.'));
    }
  }
);

export const fetchPlanTrabajoPorProceso = createAsyncThunk(
  'planTrabajo/fetchPlanTrabajoPorProceso',
  async (procesoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proceso/${procesoId}/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      return rejectWithValue(extraerMensajeError(error, 'Error al buscar el plan de trabajo del proceso.'));
    }
  }
);

export const crearPlanTrabajo = createAsyncThunk(
  'planTrabajo/crearPlanTrabajo',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchPlanesTrabajo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear el plan de trabajo.'));
    }
  }
);

export const actualizarPlanTrabajo = createAsyncThunk(
  'planTrabajo/actualizarPlanTrabajo',
  // El viewset solo implementa update() (PUT), no partial_update(). Solo
  // editable si el plan está en BORRADOR o RECHAZADO (ver validar_editable).
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchPlanesTrabajo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar el plan de trabajo.'));
    }
  }
);

export const eliminarPlanTrabajo = createAsyncThunk(
  'planTrabajo/eliminarPlanTrabajo',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchPlanesTrabajo());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al eliminar el plan de trabajo.'));
    }
  }
);

export const enviarPlanTrabajo = createAsyncThunk(
  'planTrabajo/enviarPlanTrabajo',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/enviar/`);
      dispatch(fetchPlanesTrabajo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al enviar el plan de trabajo a revisión.'));
    }
  }
);

export const aprobarPlanTrabajo = createAsyncThunk(
  'planTrabajo/aprobarPlanTrabajo',
  // Sin payload: aprobado_por siempre es request.user en el backend.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/aprobar/`);
      dispatch(fetchPlanesTrabajo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al aprobar el plan de trabajo.'));
    }
  }
);

export const rechazarPlanTrabajo = createAsyncThunk(
  'planTrabajo/rechazarPlanTrabajo',
  async ({ id, observaciones }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/rechazar/`, { observaciones });
      dispatch(fetchPlanesTrabajo());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al rechazar el plan de trabajo.'));
    }
  }
);

const planTrabajoSlice = createSlice({
  name: 'planTrabajo',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    transicionandoId: null,
    error: null,
    porProceso: null,
    buscandoPorProceso: false,
  },
  reducers: {
    limpiarErrorPlanTrabajo: (state) => {
      state.error = null;
    },
    limpiarPlanTrabajoPorProceso: (state) => {
      state.porProceso = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlanesTrabajo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlanesTrabajo.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchPlanesTrabajo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearPlanTrabajo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearPlanTrabajo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearPlanTrabajo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(fetchPlanTrabajoPorProceso.pending, (state) => {
        state.buscandoPorProceso = true;
      })
      .addCase(fetchPlanTrabajoPorProceso.fulfilled, (state, action) => {
        state.buscandoPorProceso = false;
        state.porProceso = action.payload;
      })
      .addCase(fetchPlanTrabajoPorProceso.rejected, (state, action) => {
        state.buscandoPorProceso = false;
        state.error = action.payload;
      })
      .addCase(actualizarPlanTrabajo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarPlanTrabajo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarPlanTrabajo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarPlanTrabajo.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarPlanTrabajo.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarPlanTrabajo.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      })
      // enviar / aprobar / rechazar comparten "transicionandoId"
      .addCase(enviarPlanTrabajo.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(enviarPlanTrabajo.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(enviarPlanTrabajo.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(aprobarPlanTrabajo.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(aprobarPlanTrabajo.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(aprobarPlanTrabajo.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(rechazarPlanTrabajo.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(rechazarPlanTrabajo.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(rechazarPlanTrabajo.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorPlanTrabajo, limpiarPlanTrabajoPorProceso } = planTrabajoSlice.actions;
export default planTrabajoSlice.reducer;