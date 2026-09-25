// src/features/documentoFirmante/documentoFirmanteSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const BASE = "common/documento-firmante/";

// --- Thunks: gestión del dueño del documento (CRUD + asignación masiva) ---

// Firmantes de un documento puntual, ordenados por su turno de firma.
export const fetchFirmantesPorDocumento = createAsyncThunk(
  "documentoFirmante/fetchPorDocumento",
  async (documentoFirmaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-documento/`, {
        params: { documento_firma: documentoFirmaId },
      });
      return response.data; // array plano, ya ordenado por 'orden'
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar los firmantes del documento.");
    }
  }
);

// Asignar un único firmante (CRUD -> create).
export const asignarFirmante = createAsyncThunk(
  "documentoFirmante/asignarFirmante",
  async ({ documentoFirmaId, usuarioId, orden }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, {
        documento_firma: documentoFirmaId,
        usuario: usuarioId,
        orden,
      });
      dispatch(fetchFirmantesPorDocumento(documentoFirmaId));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string" ? data : (data && Object.values(data).flat().join(" ")) || "Error al asignar el firmante.";
      return rejectWithValue(mensaje);
    }
  }
);

// Asignación masiva y ordenada de firmantes (item C.6: asignar-varios).
export const asignarVariosFirmantes = createAsyncThunk(
  "documentoFirmante/asignarVarios",
  async ({ documentoFirmaId, usuariosIds }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}asignar-varios/`, {
        documento_firma: documentoFirmaId,
        usuarios_ids: usuariosIds, // orden del arreglo = orden de firma
      });
      dispatch(fetchFirmantesPorDocumento(documentoFirmaId));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string" ? data : (data && Object.values(data).flat().join(" ")) || "Error al asignar los firmantes.";
      return rejectWithValue(mensaje);
    }
  }
);

// Retirar un firmante (CRUD -> delete). El backend impide borrar uno que ya firmó.
export const eliminarFirmante = createAsyncThunk(
  "documentoFirmante/eliminarFirmante",
  async ({ firmanteId, documentoFirmaId }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${firmanteId}/`);
      dispatch(fetchFirmantesPorDocumento(documentoFirmaId));
      return firmanteId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.detail || "Error al eliminar el firmante.");
    }
  }
);

// Genera y envía (por notificación/email) el código de verificación de un
// firmante puntual (item C.6: generar-codigo). Lo dispara el dueño del
// documento, no el firmante.
export const generarCodigoFirmante = createAsyncThunk(
  "documentoFirmante/generarCodigo",
  async (firmanteId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${firmanteId}/generar-codigo/`);
      return { firmanteId, mensaje: response.data?.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.response?.data?.error || "Error al generar el código de verificación.");
    }
  }
);

// --- Thunks: autoservicio del firmante -----------------------------------

// Firmas pendientes del propio usuario (o de un tercero, para roles con
// visibilidad ampliada según el backend: SOPORTE, CINTERNO, FACULTAD,
// GRUPO, CEXTERNO).
export const fetchFirmasPendientesPorUsuario = createAsyncThunk(
  "documentoFirmante/fetchPendientesPorUsuario",
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}pendientes-por-usuario/${usuarioId}/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue("No tiene permiso para consultar las firmas pendientes de este usuario.");
      }
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las firmas pendientes.");
    }
  }
);

// A quién le corresponde el turno actual de firma de un documento.
export const fetchSiguienteTurnoFirma = createAsyncThunk(
  "documentoFirmante/fetchSiguienteTurno",
  async (documentoFirmaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}siguiente-turno/`, {
        params: { documento_firma: documentoFirmaId },
      });
      return response.status === 204 ? null : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al consultar el turno de firma.");
    }
  }
);

// Registrar la firma (requiere que sea el turno del firmante y el código
// de verificación correcto; lo valida el backend).
export const firmarDocumento = createAsyncThunk(
  "documentoFirmante/firmar",
  async ({ firmanteId, codigoVerificacion }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${firmanteId}/firmar/`, {
        codigo_verificacion: codigoVerificacion,
      });
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string" ? data : data?.codigo_verificacion || (data && Object.values(data).flat().join(" ")) || "Error al registrar la firma.";
      return rejectWithValue(mensaje);
    }
  }
);

// Rechazar la firma propia (motivo obligatorio; cascada a marcar-rechazado
// del documento completo).
export const rechazarFirma = createAsyncThunk(
  "documentoFirmante/rechazar",
  async ({ firmanteId, motivoRechazo }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${firmanteId}/rechazar/`, {
        motivo_rechazo: motivoRechazo,
      });
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string" ? data : data?.motivo_rechazo || (data && Object.values(data).flat().join(" ")) || "Error al rechazar la firma.";
      return rejectWithValue(mensaje);
    }
  }
);

// --- Slice ---------------------------------------------------------------

const documentoFirmanteSlice = createSlice({
  name: "documentoFirmante",
  initialState: {
    // firmantes del documento que el dueño está gestionando
    firmantes: [],
    loadingFirmantes: false,
    // asignación (individual o masiva)
    asignando: false,
    asignarError: null,
    // acción puntual sobre un firmante (eliminar / generar código)
    actioningId: null,
    actionError: null,
    codigoEnviadoId: null, // último firmante al que se le envió código (feedback visual)

    // autoservicio
    pendientes: [],
    loadingPendientes: false,
    errorPendientes: null,
    firmando: false,
    firmarError: null,
  },
  reducers: {
    limpiarErrorDocumentoFirmante: (state) => {
      state.asignarError = null;
      state.actionError = null;
      state.firmarError = null;
      state.errorPendientes = null;
    },
    limpiarCodigoEnviado: (state) => {
      state.codigoEnviadoId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // listar por documento
      .addCase(fetchFirmantesPorDocumento.pending, (state) => {
        state.loadingFirmantes = true;
      })
      .addCase(fetchFirmantesPorDocumento.fulfilled, (state, action) => {
        state.loadingFirmantes = false;
        state.firmantes = action.payload ?? [];
      })
      .addCase(fetchFirmantesPorDocumento.rejected, (state, action) => {
        state.loadingFirmantes = false;
        state.actionError = action.payload;
      })
      // asignar uno
      .addCase(asignarFirmante.pending, (state) => {
        state.asignando = true;
        state.asignarError = null;
      })
      .addCase(asignarFirmante.fulfilled, (state) => {
        state.asignando = false;
      })
      .addCase(asignarFirmante.rejected, (state, action) => {
        state.asignando = false;
        state.asignarError = action.payload;
      })
      // asignar varios
      .addCase(asignarVariosFirmantes.pending, (state) => {
        state.asignando = true;
        state.asignarError = null;
      })
      .addCase(asignarVariosFirmantes.fulfilled, (state) => {
        state.asignando = false;
      })
      .addCase(asignarVariosFirmantes.rejected, (state, action) => {
        state.asignando = false;
        state.asignarError = action.payload;
      })
      // eliminar
      .addCase(eliminarFirmante.pending, (state, action) => {
        state.actioningId = action.meta.arg.firmanteId;
        state.actionError = null;
      })
      .addCase(eliminarFirmante.fulfilled, (state) => {
        state.actioningId = null;
      })
      .addCase(eliminarFirmante.rejected, (state, action) => {
        state.actioningId = null;
        state.actionError = action.payload;
      })
      // generar código
      .addCase(generarCodigoFirmante.pending, (state, action) => {
        state.actioningId = action.meta.arg;
        state.actionError = null;
      })
      .addCase(generarCodigoFirmante.fulfilled, (state, action) => {
        state.actioningId = null;
        state.codigoEnviadoId = action.payload.firmanteId;
      })
      .addCase(generarCodigoFirmante.rejected, (state, action) => {
        state.actioningId = null;
        state.actionError = action.payload;
      })
      // pendientes por usuario (autoservicio / turnos)
      .addCase(fetchFirmasPendientesPorUsuario.pending, (state) => {
        state.loadingPendientes = true;
        state.errorPendientes = null;
      })
      .addCase(fetchFirmasPendientesPorUsuario.fulfilled, (state, action) => {
        state.loadingPendientes = false;
        state.pendientes = action.payload ?? [];
      })
      .addCase(fetchFirmasPendientesPorUsuario.rejected, (state, action) => {
        state.loadingPendientes = false;
        state.errorPendientes = action.payload;
      })
      // firmar
      .addCase(firmarDocumento.pending, (state) => {
        state.firmando = true;
        state.firmarError = null;
      })
      .addCase(firmarDocumento.fulfilled, (state, action) => {
        state.firmando = false;
        state.pendientes = state.pendientes.filter((f) => f.id !== action.payload.id);
      })
      .addCase(firmarDocumento.rejected, (state, action) => {
        state.firmando = false;
        state.firmarError = action.payload;
      })
      // rechazar firma
      .addCase(rechazarFirma.pending, (state) => {
        state.firmando = true;
        state.firmarError = null;
      })
      .addCase(rechazarFirma.fulfilled, (state, action) => {
        state.firmando = false;
        state.pendientes = state.pendientes.filter((f) => f.id !== action.payload.id);
      })
      .addCase(rechazarFirma.rejected, (state, action) => {
        state.firmando = false;
        state.firmarError = action.payload;
      });
  },
});

export const { limpiarErrorDocumentoFirmante, limpiarCodigoEnviado } = documentoFirmanteSlice.actions;
export default documentoFirmanteSlice.reducer;