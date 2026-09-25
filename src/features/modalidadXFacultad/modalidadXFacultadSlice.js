// src/features/modalidadXFacultad/modalidadXFacultadSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/modalidad-facultad/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchModalidadesXFacultad = createAsyncThunk(
  'modalidadXFacultad/fetchModalidadesXFacultad',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las modalidades por facultad.'));
    }
  }
);

export const fetchModalidadesPorFacultad = createAsyncThunk(
  'modalidadXFacultad/fetchModalidadesPorFacultad',
  async ({ facultadId, disponible } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-facultad/${facultadId}/`, {
        params: disponible === undefined ? {} : { disponible },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por facultad.'));
    }
  }
);

export const crearModalidadXFacultad = createAsyncThunk(
  'modalidadXFacultad/crearModalidadXFacultad',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchModalidadesXFacultad());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al habilitar la modalidad para la facultad.'));
    }
  }
);

export const habilitarModalidadXFacultad = createAsyncThunk(
  'modalidadXFacultad/habilitarModalidadXFacultad',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/habilitar/`);
      dispatch(fetchModalidadesXFacultad());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al habilitar la modalidad.'));
    }
  }
);

export const deshabilitarModalidadXFacultad = createAsyncThunk(
  'modalidadXFacultad/deshabilitarModalidadXFacultad',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/deshabilitar/`);
      dispatch(fetchModalidadesXFacultad());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al deshabilitar la modalidad.'));
    }
  }
);

const modalidadXFacultadSlice = createSlice({
  name: 'modalidadXFacultad',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    transicionandoId: null,
    error: null,
    facultadFiltro: null,
  },
  reducers: {
    limpiarErrorModalidadXFacultad: (state) => {
      state.error = null;
    },
    establecerFiltroFacultadModalidad: (state, action) => {
      state.facultadFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModalidadesXFacultad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchModalidadesXFacultad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchModalidadesXFacultad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchModalidadesPorFacultad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchModalidadesPorFacultad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchModalidadesPorFacultad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearModalidadXFacultad.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearModalidadXFacultad.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearModalidadXFacultad.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(habilitarModalidadXFacultad.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
      })
      .addCase(habilitarModalidadXFacultad.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(habilitarModalidadXFacultad.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(deshabilitarModalidadXFacultad.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
      })
      .addCase(deshabilitarModalidadXFacultad.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(deshabilitarModalidadXFacultad.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorModalidadXFacultad, establecerFiltroFacultadModalidad } =
  modalidadXFacultadSlice.actions;
export default modalidadXFacultadSlice.reducer;