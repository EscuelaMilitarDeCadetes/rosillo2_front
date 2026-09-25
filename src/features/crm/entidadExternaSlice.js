// src/features/crm/entidadExternaSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'crm/entidad-externa/';


// Extrae un mensaje legible de cualquier forma de error que devuelva DRF:
// string plano, dict de errores por campo, o lista (ValidationError simple).
const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchEntidadesExternas = createAsyncThunk(
  'entidadExterna/fetchEntidadesExternas',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las entidades externas.'));
    }
  }
);

// Las acciones de filtro del backend (por-tipo-relacion, por-sector, por-pais)
// no están paginadas: devuelven la lista completa que cumple el filtro.
export const fetchEntidadesPorTipoRelacion = createAsyncThunk(
  'entidadExterna/fetchEntidadesPorTipoRelacion',
  async (tipoRelacion, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-tipo-relacion/`, {
        params: { tipo_relacion: tipoRelacion },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por tipo de relación.'));
    }
  }
);

export const fetchEntidadesPorSector = createAsyncThunk(
  'entidadExterna/fetchEntidadesPorSector',
  async (sector, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-sector/`, {
        params: { sector },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por sector.'));
    }
  }
);

export const fetchEntidadesPorPais = createAsyncThunk(
  'entidadExterna/fetchEntidadesPorPais',
  async (pais, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-pais/`, {
        params: { pais },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por país.'));
    }
  }
);

export const crearEntidadExterna = createAsyncThunk(
  'entidadExterna/crearEntidadExterna',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchEntidadesExternas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar la entidad externa.'));
    }
  }
);

export const actualizarEntidadExterna = createAsyncThunk(
  'entidadExterna/actualizarEntidadExterna',
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/`, payload);
      dispatch(fetchEntidadesExternas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar la entidad externa.'));
    }
  }
);

export const eliminarEntidadExterna = createAsyncThunk(
  'entidadExterna/eliminarEntidadExterna',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchEntidadesExternas());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al eliminar la entidad externa.'));
    }
  }
);

const entidadExternaSlice = createSlice({
  name: 'entidadExterna',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    error: null,
    // Los 3 filtros del backend son acciones separadas y mutuamente
    // excluyentes (no se pueden combinar en una sola petición); solo uno
    // puede estar activo a la vez. null = sin filtro (lista paginada normal).
    tipoRelacionFiltro: null,
    sectorFiltro: null,
    paisFiltro: null,
  },
  reducers: {
    limpiarErrorEntidadExterna: (state) => {
      state.error = null;
    },
    establecerFiltroTipoRelacion: (state, action) => {
      state.tipoRelacionFiltro = action.payload || null;
      state.sectorFiltro = null;
      state.paisFiltro = null;
    },
    establecerFiltroSector: (state, action) => {
      state.sectorFiltro = action.payload || null;
      state.tipoRelacionFiltro = null;
      state.paisFiltro = null;
    },
    establecerFiltroPais: (state, action) => {
      state.paisFiltro = action.payload || null;
      state.tipoRelacionFiltro = null;
      state.sectorFiltro = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntidadesExternas.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEntidadesExternas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchEntidadesExternas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEntidadesPorTipoRelacion.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEntidadesPorTipoRelacion.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchEntidadesPorTipoRelacion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEntidadesPorSector.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEntidadesPorSector.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchEntidadesPorSector.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEntidadesPorPais.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEntidadesPorPais.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchEntidadesPorPais.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearEntidadExterna.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearEntidadExterna.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearEntidadExterna.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarEntidadExterna.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarEntidadExterna.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarEntidadExterna.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarEntidadExterna.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarEntidadExterna.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarEntidadExterna.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorEntidadExterna,
  establecerFiltroTipoRelacion,
  establecerFiltroSector,
  establecerFiltroPais,
} = entidadExternaSlice.actions;
export default entidadExternaSlice.reducer;