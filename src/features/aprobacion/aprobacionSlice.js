// src/features/aprobacion/aprobacionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const BASE = "common/aprobacion/";

export const fetchAprobaciones = createAsyncThunk(
  "aprobacion/fetchAprobaciones",
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data; // { count, next, previous, results }
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las aprobaciones.");
    }
  }
);

export const crearAprobacion = createAsyncThunk(
  "aprobacion/crearAprobacion",
  async ({ usuarioRevisorId, tipoDocumentoId, idDocumento, observacion }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, {
        usuario_revisor: usuarioRevisorId,
        tipo_documento: tipoDocumentoId,
        id_documento: idDocumento,
        observacion: observacion || undefined,
      });
      dispatch(fetchAprobacionesPorDocumento({ tipoDocumentoId, idDocumento }));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string" ? data : (data && Object.values(data).flat().join(" ")) || "Error al crear la solicitud de aprobación.";
      return rejectWithValue(mensaje);
    }
  }
);

export const aprobarSolicitud = createAsyncThunk(
  "aprobacion/aprobarSolicitud",
  async ({ aprobacionId, observacion }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${aprobacionId}/aprobar/`, {
        observacion: observacion || undefined,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.response?.data?.error || "Error al aprobar la solicitud.");
    }
  }
);

export const rechazarSolicitud = createAsyncThunk(
  "aprobacion/rechazarSolicitud",
  async ({ aprobacionId, observacion }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${aprobacionId}/rechazar/`, { observacion });
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string" ? data : (data && Object.values(data).flat().join(" ")) || "Error al rechazar la solicitud.";
      return rejectWithValue(mensaje);
    }
  }
);

// Acepta un usuarioRevisorId explícito (self o de un tercero, para el panel
// de turnos de un supervisor/decano) o ninguno (todas las pendientes, uso
// administrativo restringido por el backend vía permisos de rol).
export const fetchAprobacionesPendientes = createAsyncThunk(
  "aprobacion/fetchAprobacionesPendientes",
  async (usuarioRevisorId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}pendientes/`, {
        params: usuarioRevisorId ? { usuario_revisor: usuarioRevisorId } : {},
      });
      return response.data; // array plano, sin paginar
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las aprobaciones pendientes.");
    }
  }
);

export const fetchAprobacionesPorDocumento = createAsyncThunk(
  "aprobacion/fetchAprobacionesPorDocumento",
  async ({ tipoDocumentoId, idDocumento }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-documento/`, {
        params: { tipo_documento: tipoDocumentoId, id_documento: idDocumento },
      });
      return response.data; // array plano
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las aprobaciones del documento.");
    }
  }
);

// Consulta puntual (una sola aprobación, la más reciente) para vistas tipo
// "badge de estado" que no necesitan cargar todo el historial del documento
// (ej: una columna de una tabla de proyectos).
export const fetchUltimaAprobacionPorDocumento = createAsyncThunk(
  "aprobacion/fetchUltimaAprobacionPorDocumento",
  async ({ tipoDocumentoId, idDocumento }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}ultima-por-documento/`, {
        params: { tipo_documento: tipoDocumentoId, id_documento: idDocumento },
      });
      return response.status === 204 ? null : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar la última aprobación del documento.");
    }
  }
);

const aprobacionSlice = createSlice({
  name: "aprobacion",
  initialState: {
    // Listado administrativo general (CRUD -> list)
    items: [],
    total: 0,
    page: 1,
    loadingItems: false,

    // Cola de pendientes: propia o de un usuario consultado (turnos)
    pendientes: [],

    // Historial completo de aprobaciones de un documento puntual
    porDocumento: [],

    // Última aprobación de un documento (resumen puntual)
    ultimaPorDocumento: null,
    loadingUltima: false,

    // Creación de una nueva solicitud (CRUD -> create)
    creando: false,
    crearError: null,

    loading: false,
    error: null,
    actioningId: null,
    actionError: null,
  },
  reducers: {
    limpiarErrorAprobacion: (state) => {
      state.error = null;
      state.actionError = null;
      state.crearError = null;
    },
    limpiarUltimaAprobacion: (state) => {
      state.ultimaPorDocumento = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Listado general (CRUD -> list) ---
      .addCase(fetchAprobaciones.pending, (state) => {
        state.loadingItems = true;
        state.error = null;
      })
      .addCase(fetchAprobaciones.fulfilled, (state, action) => {
        state.loadingItems = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchAprobaciones.rejected, (state, action) => {
        state.loadingItems = false;
        state.error = action.payload;
      })
      // --- Creación (CRUD -> create) ---
      .addCase(crearAprobacion.pending, (state) => {
        state.creando = true;
        state.crearError = null;
      })
      .addCase(crearAprobacion.fulfilled, (state) => {
        state.creando = false;
      })
      .addCase(crearAprobacion.rejected, (state, action) => {
        state.creando = false;
        state.crearError = action.payload;
        // se conserva por compatibilidad con quien ya observaba actionError
        state.actionError = action.payload;
      })
      // --- Pendientes (propias o de un tercero: turnos) ---
      .addCase(fetchAprobacionesPendientes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAprobacionesPendientes.fulfilled, (state, action) => {
        state.loading = false;
        state.pendientes = action.payload ?? [];
      })
      .addCase(fetchAprobacionesPendientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // --- Historial por documento ---
      .addCase(fetchAprobacionesPorDocumento.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAprobacionesPorDocumento.fulfilled, (state, action) => {
        state.loading = false;
        state.porDocumento = action.payload ?? [];
      })
      .addCase(fetchAprobacionesPorDocumento.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // --- Última aprobación por documento (resumen puntual) ---
      .addCase(fetchUltimaAprobacionPorDocumento.pending, (state) => {
        state.loadingUltima = true;
      })
      .addCase(fetchUltimaAprobacionPorDocumento.fulfilled, (state, action) => {
        state.loadingUltima = false;
        state.ultimaPorDocumento = action.payload;
      })
      .addCase(fetchUltimaAprobacionPorDocumento.rejected, (state, action) => {
        state.loadingUltima = false;
        state.error = action.payload;
      })
      // --- Acciones sobre el turno pendiente ---
      .addCase(aprobarSolicitud.pending, (state, action) => {
        state.actioningId = action.meta.arg.aprobacionId;
        state.actionError = null;
      })
      .addCase(aprobarSolicitud.fulfilled, (state, action) => {
        state.actioningId = null;
        state.pendientes = state.pendientes.filter((a) => a.id !== action.payload.id);
      })
      .addCase(aprobarSolicitud.rejected, (state, action) => {
        state.actioningId = null;
        state.actionError = action.payload;
      })
      .addCase(rechazarSolicitud.pending, (state, action) => {
        state.actioningId = action.meta.arg.aprobacionId;
        state.actionError = null;
      })
      .addCase(rechazarSolicitud.fulfilled, (state, action) => {
        state.actioningId = null;
        state.pendientes = state.pendientes.filter((a) => a.id !== action.payload.id);
      })
      .addCase(rechazarSolicitud.rejected, (state, action) => {
        state.actioningId = null;
        state.actionError = action.payload;
      });
  },
});

export const { limpiarErrorAprobacion, limpiarUltimaAprobacion } = aprobacionSlice.actions;
export default aprobacionSlice.reducer;