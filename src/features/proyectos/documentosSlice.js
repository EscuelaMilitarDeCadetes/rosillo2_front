// src/features/proyectos/documentosSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Thunk para obtener los documentos de un proyecto específico
export const fetchDocumentosPorProyecto = createAsyncThunk(
  "documentos/fetchDocumentosPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        "common/documento-firma/por-objeto/",
        {
          params: {
            content_type_app_label: "investigacion_formal",
            content_type_model: "proyecto",
            object_id: proyectoId,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los documentos."
      );
    }
  }
);

// Thunk para agregar un documento al proyecto
export const addDocumentoProyecto = createAsyncThunk(
  "documentos/addDocumentoProyecto",
  async ({ proyectoId, data }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("content_type_app_label", "investigacion_formal");
      formData.append("content_type_model", "proyecto");
      formData.append("object_id", proyectoId);
      formData.append("tipo_documento", data.tipo_documento);
      formData.append("archivo", data.documento_file, data.documento_file.name);
      if (data.estado) {
        formData.append("estado", data.estado);
      }
      await axiosInstance.post("common/documento-firma/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchDocumentosPorProyecto(proyectoId));
      return true;
    } catch (error) {
      const errData = error.response?.data;
      return rejectWithValue(
        typeof errData === "string"
          ? errData
          : errData?.error || "Error al agregar el documento."
      );
    }
  }
);

// Thunk para borrar un documento del proyecto
export const deleteDocumentoProyecto = createAsyncThunk(
  "documentos/deleteDocumentoProyecto",
  async ({ documentoId, proyectoId }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`common/documento-firma/${documentoId}/`);
      dispatch(fetchDocumentosPorProyecto(proyectoId));
      return documentoId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al borrar el documento."
      );
    }
  }
);

export const fetchTiposDocumentoProyecto = createAsyncThunk(
  "documentos/fetchTiposDocumentoProyecto",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('common/tipos-documento/por-grupo/', {
        params: { grupo: 'proyecto' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los tipos de documento."
      );
    }
  }
);

const documentosSlice = createSlice({
  name: "documentos",
  initialState: {
    documentos: [],
    tiposDocumentoProyecto: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentosPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentosPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.documentos = action.payload;
      })
      .addCase(fetchDocumentosPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTiposDocumentoProyecto.fulfilled, (state, action) => {
        state.tiposDocumentoProyecto = action.payload;
      })
      .addCase(addDocumentoProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDocumentoProyecto.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addDocumentoProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteDocumentoProyecto.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDocumentoProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.documentos = state.documentos.filter((d) => d.id !== action.payload);
      })
      .addCase(deleteDocumentoProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default documentosSlice.reducer;