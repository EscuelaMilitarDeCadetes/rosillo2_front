// src/features/documentoFirma/documentoFirmaSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const BASE = "common/documento-firma/";

// --- Thunks -----------------------------------------------------------

export const fetchDocumentosHabilitadosParaFirma = createAsyncThunk(
  "documentoFirma/fetchHabilitadosParaFirma",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}habilitados-para-firma/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
          "Error al cargar los documentos habilitados para firma."
      );
    }
  }
);

export const marcarDocumentoRechazado = createAsyncThunk(
  "documentoFirma/marcarRechazado",
  async (documentoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${BASE}${documentoId}/marcar-rechazado/`
      );
      return response.data; // documento actualizado (estado: RECHAZADO)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Error al marcar el documento como rechazado."
      );
    }
  }
);

// Reutilizable desde las tablas del dueño del documento. 
export const habilitarDocumentoParaFirma = createAsyncThunk(
  "documentoFirma/habilitarParaFirma",
  async (documentoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${BASE}${documentoId}/habilitar-para-firma/`
      );
      return response.data; // documento actualizado (estado: EN_FIRMAS)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Error al habilitar el documento para firma."
      );
    }
  }
);

// Historial completo de versiones de un tipo de documento, sin filtrar por
// el objeto al que pertenece cada versión (útil para auditoría/consulta
// transversal: "todas las versiones de Presupuesto que existen en el
// sistema", no solo las de un proyecto puntual).
export const fetchDocumentosPorTipoDocumento = createAsyncThunk(
  "documentoFirma/fetchPorTipoDocumento",
  async (tipoDocumentoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-tipo-documento/`, {
        params: { tipo_documento: tipoDocumentoId },
      });
      return response.data; // array plano, sin paginar
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
          "Error al cargar los documentos de este tipo."
      );
    }
  }
);

// Última versión registrada de un tipo de documento. Complementa 
// a por-tipo-documento cuando solo interesa saber cuál es la 
// versión vigente más reciente.
export const fetchUltimaVersionDocumento = createAsyncThunk(
  "documentoFirma/fetchUltimaVersion",
  async (tipoDocumentoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}ultima-version/`, {
        params: { tipo_documento: tipoDocumentoId },
      });
      return response.status === 204 ? null : response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
          "Error al cargar la última versión de este tipo de documento."
      );
    }
  }
);

// Documentos vinculados a un objeto puntual del sistema, base del selector 
// reutilizable de DocumentoFirma por objeto/actividad.
export const fetchDocumentosPorObjeto = createAsyncThunk(
  "documentoFirma/fetchPorObjeto",
  async ({ contentTypeAppLabel, contentTypeModel, objectId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-objeto/`, {
        params: {
          content_type_app_label: contentTypeAppLabel,
          content_type_model: contentTypeModel,
          object_id: objectId,
        },
      });
      return response.data; // array plano, sin paginar
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Error al cargar los documentos vinculados a este objeto."
      );
    }
  }
);

// --- Slice --------------------------------------------------------------

const documentoFirmaSlice = createSlice({
  name: "documentoFirma",
  initialState: {
    pendientesFirma: [],
    loading: false,
    error: null,
    // id del documento sobre el que se está ejecutando una acción
    // (rechazar/habilitar), para deshabilitar solo su botón, no toda la tabla.
    actioningId: null,
    actionError: null,

    // Consulta por tipo de documento (filtros / versión vigente)
    porTipoDocumento: [],
    loadingPorTipo: false,
    ultimaVersion: null,
    loadingUltimaVersion: false,

    // Consulta por objeto genérico (selector reutilizable
    porObjeto: [],
    loadingPorObjeto: false,
    errorPorObjeto: null,
  },
  reducers: {
    limpiarErrorDocumentoFirma: (state) => {
      state.error = null;
      state.actionError = null;
    },
    limpiarPorTipoDocumento: (state) => {
      state.porTipoDocumento = [];
      state.ultimaVersion = null;
    },
    limpiarPorObjetoDocumento: (state) => {
      state.porObjeto = [];
      state.errorPorObjeto = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // listar habilitados para firma
      .addCase(fetchDocumentosHabilitadosParaFirma.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentosHabilitadosParaFirma.fulfilled, (state, action) => {
        state.loading = false;
        state.pendientesFirma = action.payload ?? [];
      })
      .addCase(fetchDocumentosHabilitadosParaFirma.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // marcar rechazado
      .addCase(marcarDocumentoRechazado.pending, (state, action) => {
        state.actioningId = action.meta.arg;
        state.actionError = null;
      })
      .addCase(marcarDocumentoRechazado.fulfilled, (state, action) => {
        state.actioningId = null;
        // Un documento RECHAZADO deja de estar habilitado para firma:
        // se retira de la lista de pendientes.
        state.pendientesFirma = state.pendientesFirma.filter(
          (doc) => doc.id !== action.payload.id
        );
      })
      .addCase(marcarDocumentoRechazado.rejected, (state, action) => {
        state.actioningId = null;
        state.actionError = action.payload;
      })
      // habilitar para firma
      .addCase(habilitarDocumentoParaFirma.pending, (state, action) => {
        state.actioningId = action.meta.arg;
        state.actionError = null;
      })
      .addCase(habilitarDocumentoParaFirma.fulfilled, (state) => {
        state.actioningId = null;
      })
      .addCase(habilitarDocumentoParaFirma.rejected, (state, action) => {
        state.actioningId = null;
        state.actionError = action.payload;
      })
      // por tipo de documento (historial transversal)
      .addCase(fetchDocumentosPorTipoDocumento.pending, (state) => {
        state.loadingPorTipo = true;
        state.error = null;
      })
      .addCase(fetchDocumentosPorTipoDocumento.fulfilled, (state, action) => {
        state.loadingPorTipo = false;
        state.porTipoDocumento = action.payload ?? [];
      })
      .addCase(fetchDocumentosPorTipoDocumento.rejected, (state, action) => {
        state.loadingPorTipo = false;
        state.error = action.payload;
      })
      // última versión de un tipo de documento
      .addCase(fetchUltimaVersionDocumento.pending, (state) => {
        state.loadingUltimaVersion = true;
      })
      .addCase(fetchUltimaVersionDocumento.fulfilled, (state, action) => {
        state.loadingUltimaVersion = false;
        state.ultimaVersion = action.payload;
      })
      .addCase(fetchUltimaVersionDocumento.rejected, (state, action) => {
        state.loadingUltimaVersion = false;
        state.error = action.payload;
      })
      // por objeto genérico (selector reutilizable)
      .addCase(fetchDocumentosPorObjeto.pending, (state) => {
        state.loadingPorObjeto = true;
        state.errorPorObjeto = null;
      })
      .addCase(fetchDocumentosPorObjeto.fulfilled, (state, action) => {
        state.loadingPorObjeto = false;
        state.porObjeto = action.payload ?? [];
      })
      .addCase(fetchDocumentosPorObjeto.rejected, (state, action) => {
        state.loadingPorObjeto = false;
        state.errorPorObjeto = action.payload;
        state.porObjeto = [];
      });
  },
});

export const {
  limpiarErrorDocumentoFirma,
  limpiarPorTipoDocumento,
  limpiarPorObjetoDocumento,
} = documentoFirmaSlice.actions;
export default documentoFirmaSlice.reducer;