// src/features/historial/historialSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const BASE = "common/historial/";

export const fetchHistorial = createAsyncThunk(
  "historial/fetchHistorial",
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, {
        params: { page, page_size: pageSize },
      });
      return response.data; // { count, next, previous, results }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar el historial."
      );
    }
  }
);

export const buscarHistorial = createAsyncThunk(
  "historial/buscarHistorial",
  async ({ page = 1, pageSize = 10, filtros = {} } = {}, { rejectWithValue }) => {
    try {
      const params = { page, page_size: pageSize };
      if (filtros.texto) params.q = filtros.texto;
      if (filtros.usuarioId) params.usuario_id = filtros.usuarioId;
      if (filtros.fechaInicio) params.fecha_inicio = filtros.fechaInicio;
      if (filtros.fechaFin) params.fecha_fin = filtros.fechaFin;
      if (filtros.soloSistema) params.solo_sistema = true;
      const response = await axiosInstance.get(`${BASE}buscar/`, { params });
      return response.data; // { count, next, previous, results }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al buscar en el historial."
      );
    }
  }
);

// --- Endpoints especializados (sin paginación en backend) ---

export const fetchHistorialPorUsuario = createAsyncThunk(
  "historial/fetchPorUsuario",
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-usuario/${usuarioId}/`);
      return response.data; // array plano
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al filtrar el historial por usuario."
      );
    }
  }
);

export const fetchHistorialPorRangoFechas = createAsyncThunk(
  "historial/fetchPorRangoFechas",
  async ({ fechaInicio, fechaFin }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-rango-fechas/`, {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      });
      return response.data; // array plano
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al filtrar el historial por rango de fechas."
      );
    }
  }
);

export const fetchAccionesSistema = createAsyncThunk(
  "historial/fetchAccionesSistema",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}acciones-sistema/`);
      return response.data; // array plano
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al obtener las acciones del sistema."
      );
    }
  }
);

const historialSlice = createSlice({
  name: "historial",
  initialState: {
    items: [],
    totalRecords: 0,
    filtrosActivos: false,
    modoPaginado: true, // false cuando el resultado viene de un endpoint no paginado
    loading: false,
    error: null,
  },
  reducers: {
    limpiarFiltro: (state) => {
      state.filtrosActivos = false;
      state.modoPaginado = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- list ---
      .addCase(fetchHistorial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistorial.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.totalRecords = action.payload.count ?? 0;
        state.filtrosActivos = false;
        state.modoPaginado = true;
      })
      .addCase(fetchHistorial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // --- buscar ---
      .addCase(buscarHistorial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buscarHistorial.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.totalRecords = action.payload.count ?? 0;
        state.filtrosActivos = true;
        state.modoPaginado = true;
      })
      .addCase(buscarHistorial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // --- por_usuario / por_rango_fechas / acciones_sistema (sin paginar) ---
      .addMatcher(
        (action) =>
          [
            fetchHistorialPorUsuario.pending.type,
            fetchHistorialPorRangoFechas.pending.type,
            fetchAccionesSistema.pending.type,
          ].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [
            fetchHistorialPorUsuario.fulfilled.type,
            fetchHistorialPorRangoFechas.fulfilled.type,
            fetchAccionesSistema.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.items = action.payload ?? [];
          state.totalRecords = (action.payload ?? []).length;
          state.filtrosActivos = true;
          state.modoPaginado = false; // el resultado ya viene completo
        }
      )
      .addMatcher(
        (action) =>
          [
            fetchHistorialPorUsuario.rejected.type,
            fetchHistorialPorRangoFechas.rejected.type,
            fetchAccionesSistema.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { limpiarFiltro } = historialSlice.actions;
export default historialSlice.reducer;