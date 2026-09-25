// src/features/gerentes/gerentesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'institucional/gerentes/';

export const fetchGerentes = createAsyncThunk(
  'gerentes/fetchGerentes',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar los gerentes.');
    }
  }
);

export const fetchGerenteActual = createAsyncThunk(
  'gerentes/fetchGerenteActual',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}actual/`);
      return response.status === 204 ? null : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar el gerente actual.');
    }
  }
);

export const fetchHistoricoGerentes = createAsyncThunk(
  'gerentes/fetchHistoricoGerentes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}historico/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar el histórico de gerentes.');
    }
  }
);

export const crearGerente = createAsyncThunk(
  'gerentes/crearGerente',
  async ({ persona, fecha_ingreso }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, { persona, fecha_ingreso });
      dispatch(fetchGerenteActual());
      dispatch(fetchHistoricoGerentes());
      dispatch(fetchGerentes());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === 'string'
          ? data
          : data?.error || (data && Object.values(data).flat().join(' ')) || 'Error al asignar el nuevo gerente.';
      return rejectWithValue(mensaje);
    }
  }
);

export const actualizarGerente = createAsyncThunk(
  'gerentes/actualizarGerente',
  async ({ id, fecha_ingreso, fecha_salida }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/`, { fecha_ingreso, fecha_salida });
      dispatch(fetchGerenteActual());
      dispatch(fetchHistoricoGerentes());
      dispatch(fetchGerentes());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === 'string'
          ? data
          : data?.error || (data && Object.values(data).flat().join(' ')) || 'Error al actualizar el gerente.';
      return rejectWithValue(mensaje);
    }
  }
);

export const finalizarGerente = createAsyncThunk(
  'gerentes/finalizarGerente',
  async ({ id, fecha_salida }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/finalizar/`, { fecha_salida });
      dispatch(fetchGerenteActual());
      dispatch(fetchHistoricoGerentes());
      dispatch(fetchGerentes());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === 'string'
          ? data
          : data?.error || (data && Object.values(data).flat().join(' ')) || 'Error al finalizar la gerencia.';
      return rejectWithValue(mensaje);
    }
  }
);

export const eliminarGerente = createAsyncThunk(
  'gerentes/eliminarGerente',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchGerenteActual());
      dispatch(fetchHistoricoGerentes());
      dispatch(fetchGerentes());
      return { id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al eliminar el registro de gerencia.');
    }
  }
);

const gerentesSlice = createSlice({
  name: 'gerentes',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    actual: null,
    actualLoading: false,
    historico: [],
    historicoLoading: false,
    saving: false,
    error: null,
  },
  reducers: {
    limpiarErrorGerente: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGerentes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGerentes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchGerentes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchGerenteActual.pending, (state) => {
        state.actualLoading = true;
      })
      .addCase(fetchGerenteActual.fulfilled, (state, action) => {
        state.actualLoading = false;
        state.actual = action.payload;
      })
      .addCase(fetchGerenteActual.rejected, (state, action) => {
        state.actualLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchHistoricoGerentes.pending, (state) => {
        state.historicoLoading = true;
      })
      .addCase(fetchHistoricoGerentes.fulfilled, (state, action) => {
        state.historicoLoading = false;
        state.historico = action.payload ?? [];
      })
      .addCase(fetchHistoricoGerentes.rejected, (state, action) => {
        state.historicoLoading = false;
        state.error = action.payload;
      })
      .addCase(crearGerente.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearGerente.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearGerente.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarGerente.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarGerente.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarGerente.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(finalizarGerente.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(finalizarGerente.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(finalizarGerente.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarGerente.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(eliminarGerente.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(eliminarGerente.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorGerente } = gerentesSlice.actions;
export default gerentesSlice.reducer;