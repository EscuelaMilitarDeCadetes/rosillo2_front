// src/features/tutor/tutorSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/tutor/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchTutores = createAsyncThunk(
  'tutor/fetchTutores',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los tutores.'));
    }
  }
);

export const fetchTutoresPorFacultad = createAsyncThunk(
  'tutor/fetchTutoresPorFacultad',
  async (facultadId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-facultad/${facultadId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por facultad.'));
    }
  }
);

export const crearTutor = createAsyncThunk(
  'tutor/crearTutor',
  // payload: { persona, facultad }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchTutores());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar el tutor.'));
    }
  }
);

export const actualizarTutor = createAsyncThunk(
  'tutor/actualizarTutor',
  // El viewset solo implementa update() (PUT), no partial_update(). Solo
  // facultad es editable (persona es OneToOne, no se reasigna).
  async ({ id, facultadId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, { facultad: facultadId });
      dispatch(fetchTutores());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar el tutor.'));
    }
  }
);

export const activarTutor = createAsyncThunk(
  'tutor/activarTutor',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/activar/`);
      dispatch(fetchTutores());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al activar el tutor.'));
    }
  }
);

export const desactivarTutor = createAsyncThunk(
  'tutor/desactivarTutor',
  // Uso esta acción en vez de destroy()/DELETE: ambas hacen lo mismo (estado=False).
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/desactivar/`);
      dispatch(fetchTutores());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al desactivar el tutor.'));
    }
  }
);

const tutorSlice = createSlice({
  name: 'tutor',
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
    limpiarErrorTutor: (state) => {
      state.error = null;
    },
    establecerFiltroFacultadTutor: (state, action) => {
      state.facultadFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTutores.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTutores.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchTutores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTutoresPorFacultad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTutoresPorFacultad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchTutoresPorFacultad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearTutor.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearTutor.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearTutor.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarTutor.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarTutor.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarTutor.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(activarTutor.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(activarTutor.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(activarTutor.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(desactivarTutor.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(desactivarTutor.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(desactivarTutor.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorTutor, establecerFiltroFacultadTutor } = tutorSlice.actions;
export default tutorSlice.reducer;