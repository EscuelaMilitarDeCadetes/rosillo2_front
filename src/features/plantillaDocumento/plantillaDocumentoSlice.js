// src/features/plantillaDocumento/plantillaDocumentoSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const BASE = "common/plantilla-documento/";

export const fetchPlantillas = createAsyncThunk(
  "plantillaDocumento/fetchPlantillas",
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data; // { count, results }
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las plantillas de documento.");
    }
  }
);

// El campo ruta_documento es un CharField en el backend (no un FileField):
// el servicio solo guarda la ruta/URL como texto, no procesa un archivo
// subido por este endpoint.
export const crearPlantilla = createAsyncThunk(
  "plantillaDocumento/crearPlantilla",
  async ({ tipoDocumentoId, rutaDocumento }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, {
        tipo_documento: tipoDocumentoId,
        ruta_documento: rutaDocumento,
      });
      dispatch(fetchPlantillas({ page: 1 }));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string" ? data : (data && Object.values(data).flat().join(" ")) || "Error al crear la plantilla.";
      return rejectWithValue(mensaje);
    }
  }
);

export const actualizarPlantilla = createAsyncThunk(
  "plantillaDocumento/actualizarPlantilla",
  async ({ plantillaId, rutaDocumento }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${plantillaId}/`, {
        ruta_documento: rutaDocumento,
      });
      dispatch(fetchPlantillas({ page: 1 }));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string" ? data : (data && Object.values(data).flat().join(" ")) || "Error al actualizar la plantilla.";
      return rejectWithValue(mensaje);
    }
  }
);

// El backend no expone destroy: las plantillas se retiran con un soft-delete
// (estado=False) vía esta acción, no con un DELETE real.
export const desactivarPlantilla = createAsyncThunk(
  "plantillaDocumento/desactivarPlantilla",
  async (plantillaId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${plantillaId}/desactivar/`);
      dispatch(fetchPlantillas({ page: 1 }));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al desactivar la plantilla.");
    }
  }
);

export const descargarPlantilla = createAsyncThunk(
  'plantillaDocumento/descargar',
  async (plantillaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}${plantillaId}/descargar/`, {
        responseType: 'blob',
      });
      const disposition = response.headers['content-disposition'];
      let filename = 'plantilla.docx';
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { plantillaId };
    } catch (error) {
      return rejectWithValue('No se pudo descargar la plantilla.');
    }
  }
);

// Consulta puntual: ¿existe una plantilla activa para este tipo de
// documento? (IsAuthenticated, autoservicio amplio — útil para mostrarla
// como sugerencia justo donde el usuario va a subir un documento de ese tipo).
export const fetchPlantillaPorTipoDocumento = createAsyncThunk(
  "plantillaDocumento/fetchPorTipoDocumento",
  async (tipoDocumentoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-tipo-documento/`, {
        params: { tipo_documento: tipoDocumentoId },
      });
      return response.status === 204 ? null : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al consultar la plantilla de este tipo de documento.");
    }
  }
);

const plantillaDocumentoSlice = createSlice({
  name: "plantillaDocumento",
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,

    guardando: false,
    guardarError: null,

    actioningId: null,
    actionError: null,

    porTipoDocumento: null,
    loadingPorTipo: false,
  },
  reducers: {
    limpiarErrorPlantillaDocumento: (state) => {
      state.error = null;
      state.guardarError = null;
      state.actionError = null;
    },
    limpiarPlantillaPorTipoDocumento: (state) => {
      state.porTipoDocumento = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlantillas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlantillas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchPlantillas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearPlantilla.pending, (state) => {
        state.guardando = true;
        state.guardarError = null;
      })
      .addCase(crearPlantilla.fulfilled, (state) => {
        state.guardando = false;
      })
      .addCase(crearPlantilla.rejected, (state, action) => {
        state.guardando = false;
        state.guardarError = action.payload;
      })
      .addCase(actualizarPlantilla.pending, (state) => {
        state.guardando = true;
        state.guardarError = null;
      })
      .addCase(actualizarPlantilla.fulfilled, (state) => {
        state.guardando = false;
      })
      .addCase(actualizarPlantilla.rejected, (state, action) => {
        state.guardando = false;
        state.guardarError = action.payload;
      })
      .addCase(desactivarPlantilla.pending, (state, action) => {
        state.actioningId = action.meta.arg;
        state.actionError = null;
      })
      .addCase(desactivarPlantilla.fulfilled, (state) => {
        state.actioningId = null;
      })
      .addCase(desactivarPlantilla.rejected, (state, action) => {
        state.actioningId = null;
        state.actionError = action.payload;
      })
      .addCase(fetchPlantillaPorTipoDocumento.pending, (state) => {
        state.loadingPorTipo = true;
      })
      .addCase(fetchPlantillaPorTipoDocumento.fulfilled, (state, action) => {
        state.loadingPorTipo = false;
        state.porTipoDocumento = action.payload;
      })
      .addCase(fetchPlantillaPorTipoDocumento.rejected, (state, action) => {
        state.loadingPorTipo = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorPlantillaDocumento, limpiarPlantillaPorTipoDocumento } = plantillaDocumentoSlice.actions;
export default plantillaDocumentoSlice.reducer;