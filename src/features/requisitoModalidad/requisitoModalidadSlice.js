// src/features/requisitoModalidad/requisitoModalidadSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/requisito-modalidad/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchRequisitosModalidad = createAsyncThunk(
  'requisitoModalidad/fetchRequisitosModalidad',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los requisitos de modalidad.'));
    }
  }
);

export const fetchRequisitosPorModalidad = createAsyncThunk(
  'requisitoModalidad/fetchRequisitosPorModalidad',
  async (modalidadId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-modalidad/${modalidadId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por modalidad.'));
    }
  }
);

export const crearRequisitoModalidad = createAsyncThunk(
  'requisitoModalidad/crearRequisitoModalidad',
  // payload: { modalidad, tipo, descripcion, valor_numerico?, valor_booleano? }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchRequisitosModalidad());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear el requisito de modalidad.'));
    }
  }
);

export const actualizarRequisitoModalidad = createAsyncThunk(
  'requisitoModalidad/actualizarRequisitoModalidad',
  // El viewset solo implementa update() (PUT), no partial_update(). modalidad
  // es inmutable tras la creación (el service de actualizar no la recibe).
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchRequisitosModalidad());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar el requisito de modalidad.'));
    }
  }
);

export const eliminarRequisitoModalidad = createAsyncThunk(
  'requisitoModalidad/eliminarRequisitoModalidad',
  // Soft-delete real (activo=False) vía DELETE normal.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchRequisitosModalidad());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al eliminar el requisito de modalidad.'));
    }
  }
);

const requisitoModalidadSlice = createSlice({
  name: 'requisitoModalidad',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    error: null,
    modalidadFiltro: null,
  },
  reducers: {
    limpiarErrorRequisitoModalidad: (state) => {
      state.error = null;
    },
    establecerFiltroModalidadRequisito: (state, action) => {
      state.modalidadFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequisitosModalidad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRequisitosModalidad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchRequisitosModalidad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRequisitosPorModalidad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRequisitosPorModalidad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchRequisitosPorModalidad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearRequisitoModalidad.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearRequisitoModalidad.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearRequisitoModalidad.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarRequisitoModalidad.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarRequisitoModalidad.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarRequisitoModalidad.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarRequisitoModalidad.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarRequisitoModalidad.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarRequisitoModalidad.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorRequisitoModalidad,
  establecerFiltroModalidadRequisito,
} = requisitoModalidadSlice.actions;
export default requisitoModalidadSlice.reducer;