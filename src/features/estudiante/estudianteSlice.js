// src/features/estudiante/estudianteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/estudiante/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchEstudiantes = createAsyncThunk(
  'estudiante/fetchEstudiantes',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los estudiantes.'));
    }
  }
);

export const fetchEstudiantesPorFacultad = createAsyncThunk(
  'estudiante/fetchEstudiantesPorFacultad',
  async ({ facultadId, estado } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-facultad/${facultadId}/`, {
        params: estado != null ? { estado } : undefined,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por facultad.'));
    }
  }
);

export const fetchEstudiantesPorModalidad = createAsyncThunk(
  'estudiante/fetchEstudiantesPorModalidad',
  async ({ modalidadId, estado } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-modalidad/${modalidadId}/`, {
        params: estado != null ? { estado } : undefined,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por modalidad.'));
    }
  }
);

export const crearEstudiante = createAsyncThunk(
  'estudiante/crearEstudiante',
  // payload: { persona, modalidad_facultad, correo_personal, nivel }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchEstudiantes());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar el estudiante.'));
    }
  }
);

export const actualizarEstudiante = createAsyncThunk(
  'estudiante/actualizarEstudiante',
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchEstudiantes());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar el estudiante.'));
    }
  }
);

export const desactivarEstudiante = createAsyncThunk(
  'estudiante/desactivarEstudiante',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/desactivar/`);
      dispatch(fetchEstudiantes());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al desactivar el estudiante.'));
    }
  }
);

export const reactivarEstudiante = createAsyncThunk(
  'estudiante/reactivarEstudiante',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/reactivar/`);
      dispatch(fetchEstudiantes());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al reactivar el estudiante.'));
    }
  }
);

export const fetchEstudiantesPorModalidadFacultad = createAsyncThunk(
  'estudiante/fetchEstudiantesPorModalidadFacultad',
  async ({ modalidadFacultadId, estado } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-modalidad-facultad/${modalidadFacultadId}/`, {
        params: estado != null ? { estado } : undefined,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por modalidad-facultad.'));
    }
  }
);

const estudianteSlice = createSlice({
  name: 'estudiante',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    transicionandoId: null,
    error: null,
    facultadFiltro: null,
    modalidadFiltro: null,
    estadoFiltro: null,
    modalidadFacultadFiltro: null,
  },
  reducers: {
    limpiarErrorEstudiante: (state) => {
      state.error = null;
    },
    establecerFiltroFacultadEstudiante: (state, action) => {
      state.facultadFiltro = action.payload?.facultadId ?? null;
      state.estadoFiltro = action.payload?.estado ?? null;
      state.modalidadFiltro = null;
    },
    establecerFiltroModalidadEstudiante: (state, action) => {
      state.modalidadFiltro = action.payload?.modalidadId ?? null;
      state.estadoFiltro = action.payload?.estado ?? null;
      state.facultadFiltro = null;
    },
    establecerFiltroModalidadFacultadEstudiante: (state, action) => {
      state.modalidadFacultadFiltro = action.payload?.modalidadFacultadId ?? null;
      state.estadoFiltro = action.payload?.estado ?? null;
      state.facultadFiltro = null;
      state.modalidadFiltro = null;
    },
    limpiarFiltrosEstudiante: (state) => {
      state.facultadFiltro = null;
      state.modalidadFiltro = null;
      state.modalidadFacultadFiltro = null;
      state.estadoFiltro = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEstudiantes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEstudiantes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchEstudiantes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEstudiantesPorFacultad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEstudiantesPorFacultad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchEstudiantesPorFacultad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEstudiantesPorModalidad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEstudiantesPorModalidad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchEstudiantesPorModalidad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEstudiantesPorModalidadFacultad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEstudiantesPorModalidadFacultad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchEstudiantesPorModalidadFacultad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearEstudiante.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearEstudiante.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearEstudiante.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarEstudiante.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarEstudiante.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarEstudiante.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(desactivarEstudiante.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(desactivarEstudiante.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(desactivarEstudiante.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(reactivarEstudiante.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(reactivarEstudiante.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(reactivarEstudiante.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorEstudiante,
  establecerFiltroFacultadEstudiante,
  establecerFiltroModalidadEstudiante,
  establecerFiltroModalidadFacultadEstudiante,
  limpiarFiltrosEstudiante,
} = estudianteSlice.actions;
export default estudianteSlice.reducer;