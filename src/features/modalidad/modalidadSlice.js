// src/features/modalidad/modalidadSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/modalidad/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchModalidades = createAsyncThunk(
  'modalidad/fetchModalidades',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las modalidades.'));
    }
  }
);

export const fetchModalidadesActivas = createAsyncThunk(
  'modalidad/fetchModalidadesActivas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}activas/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las modalidades activas.'));
    }
  }
);

export const crearModalidad = createAsyncThunk(
  'modalidad/crearModalidad',
  // payload: { nombre, codigo, descripcion?, requiere_evaluadores?, requiere_tutor?,
  //   requiere_antiplagio?, requiere_sustentacion?, cantidad_maxima_estudiantes?,
  //   cantidad_minima_evaluadores?, permite_homologacion?, requiere_producto_final? }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchModalidades());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear la modalidad.'));
    }
  }
);

export const actualizarModalidad = createAsyncThunk(
  'modalidad/actualizarModalidad',
  // El viewset solo implementa update() (PUT), no partial_update().
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchModalidades());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar la modalidad.'));
    }
  }
);

export const eliminarModalidad = createAsyncThunk(
  'modalidad/eliminarModalidad',
  // Soft-delete real vía DELETE: el backend pone activo=False internamente.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchModalidades());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al desactivar la modalidad.'));
    }
  }
);

export const activarModalidad = createAsyncThunk(
  'modalidad/activarModalidad',
  // @action(detail=True, methods=["post"]) -> POST, no PATCH.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/activar/`);
      dispatch(fetchModalidades());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al activar la modalidad.'));
    }
  }
);

const modalidadSlice = createSlice({
  name: 'modalidad',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    transicionandoId: null,
    error: null,
  },
  reducers: {
    limpiarErrorModalidad: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModalidades.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchModalidades.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchModalidades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchModalidadesActivas.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchModalidadesActivas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchModalidadesActivas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearModalidad.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearModalidad.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearModalidad.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarModalidad.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarModalidad.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarModalidad.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarModalidad.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarModalidad.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarModalidad.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      })
      .addCase(activarModalidad.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(activarModalidad.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(activarModalidad.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorModalidad } = modalidadSlice.actions;
export default modalidadSlice.reducer;