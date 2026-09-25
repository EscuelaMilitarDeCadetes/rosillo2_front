// src/features/flujoProceso/flujoProcesoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/flujo-proceso/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchFlujosProceso = createAsyncThunk(
  'flujoProceso/fetchFlujosProceso',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los flujos de proceso.'));
    }
  }
);

export const fetchFlujosActivos = createAsyncThunk(
  'flujoProceso/fetchFlujosActivos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}activos/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los flujos activos.'));
    }
  }
);

export const fetchFlujosPorModalidad = createAsyncThunk(
  'flujoProceso/fetchFlujosPorModalidad',
  async ({ modalidadId, activo } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-modalidad/${modalidadId}/`, {
        params: activo != null ? { activo } : undefined,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por modalidad.'));
    }
  }
);

export const fetchFlujoVigente = createAsyncThunk(
  'flujoProceso/fetchFlujoVigente',
  async (modalidadId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}vigente/${modalidadId}/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(extraerMensajeError(error, 'Error al consultar el flujo vigente.'));
    }
  }
);

export const crearFlujoProceso = createAsyncThunk(
  'flujoProceso/crearFlujoProceso',
  // payload: { modalidad, nombre, version?, tipo?, descripcion?, fecha_vigencia_inicio, fecha_vigencia_fin? }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchFlujosProceso());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear el flujo de proceso.'));
    }
  }
);

export const actualizarFlujoProceso = createAsyncThunk(
  'flujoProceso/actualizarFlujoProceso',
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchFlujosProceso());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar el flujo de proceso.'));
    }
  }
);

export const activarFlujoProceso = createAsyncThunk(
  'flujoProceso/activarFlujoProceso',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/activar/`);
      dispatch(fetchFlujosProceso());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al activar el flujo de proceso.'));
    }
  }
);

export const desactivarFlujoProceso = createAsyncThunk(
  'flujoProceso/desactivarFlujoProceso',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/desactivar/`);
      dispatch(fetchFlujosProceso());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al desactivar el flujo de proceso.'));
    }
  }
);

const flujoProcesoSlice = createSlice({
  name: 'flujoProceso',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    // id del flujo con una transición de activo/inactivo en curso
    transicionandoId: null,
    error: null,
    modalidadFiltro: null,
    activoFiltro: null,
    flujoVigente: null,
    buscandoVigente: false,
  },
  reducers: {
    limpiarErrorFlujoProceso: (state) => {
      state.error = null;
    },
    establecerFiltroModalidadFlujo: (state, action) => {
      state.modalidadFiltro = action.payload?.modalidadId ?? null;
      state.activoFiltro = action.payload?.activo ?? null;
    },
    limpiarFiltrosFlujoProceso: (state) => {
      state.modalidadFiltro = null;
      state.activoFiltro = null;
    },
    limpiarFlujoVigente: (state) => {
      state.flujoVigente = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlujosProceso.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFlujosProceso.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchFlujosProceso.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFlujosActivos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFlujosActivos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchFlujosActivos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFlujosPorModalidad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFlujosPorModalidad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchFlujosPorModalidad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFlujoVigente.pending, (state) => {
        state.buscandoVigente = true;
        state.flujoVigente = null;
      })
      .addCase(fetchFlujoVigente.fulfilled, (state, action) => {
        state.buscandoVigente = false;
        state.flujoVigente = action.payload;
      })
      .addCase(fetchFlujoVigente.rejected, (state, action) => {
        state.buscandoVigente = false;
        state.error = action.payload;
      })
      .addCase(crearFlujoProceso.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearFlujoProceso.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearFlujoProceso.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarFlujoProceso.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarFlujoProceso.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarFlujoProceso.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(activarFlujoProceso.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(activarFlujoProceso.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(activarFlujoProceso.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(desactivarFlujoProceso.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(desactivarFlujoProceso.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(desactivarFlujoProceso.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorFlujoProceso,
  establecerFiltroModalidadFlujo,
  limpiarFiltrosFlujoProceso,
  limpiarFlujoVigente,
} = flujoProcesoSlice.actions;
export default flujoProcesoSlice.reducer;