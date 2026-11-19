// src/features/formatos/formatosSlice.js
// Diligenciamiento semiautomático de formatos I+D+i:
//  - Importación de la propuesta (.docx) -> revisión -> confirmación.
//  - Generación de borradores .docx (Acta de Inicio, Control de Cambios,
//    Acta de Cierre, Informe Final) con los datos ya registrados.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { extraerMensajeError } from '../../utils/notificador';

const BASE = 'investigacion-formal/formatos/';

const mensaje = (error, porDefecto) =>
  extraerMensajeError(error.response?.data, error.response?.status) || porDefecto;

export const fetchTiposGenerables = createAsyncThunk(
  'formatos/fetchTiposGenerables',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}generables/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(mensaje(error, 'Error al cargar los formatos generables.'));
    }
  }
);

export const fetchImportacionesPropuesta = createAsyncThunk(
  'formatos/fetchImportaciones',
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}importaciones/`, {
        params: { proyecto: proyectoId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(mensaje(error, 'Error al cargar las importaciones de la propuesta.'));
    }
  }
);

export const subirPropuestaDocx = createAsyncThunk(
  'formatos/subirPropuesta',
  async ({ proyectoId, archivo }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('proyecto', proyectoId);
      formData.append('archivo', archivo, archivo.name);
      const response = await axiosInstance.post(`${BASE}importaciones/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(fetchImportacionesPropuesta(proyectoId));
      return response.data;
    } catch (error) {
      return rejectWithValue(mensaje(error, 'No fue posible leer la propuesta.'));
    }
  }
);

export const confirmarImportacionPropuesta = createAsyncThunk(
  'formatos/confirmarImportacion',
  async ({ importacionId, proyectoId, datos, reemplazarObjetivos }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}importaciones/${importacionId}/confirmar/`, {
        datos,
        reemplazar_objetivos: !!reemplazarObjetivos,
      });
      dispatch(fetchImportacionesPropuesta(proyectoId));
      return response.data;
    } catch (error) {
      return rejectWithValue(mensaje(error, 'Error al confirmar los datos de la propuesta.'));
    }
  }
);

export const descartarImportacionPropuesta = createAsyncThunk(
  'formatos/descartarImportacion',
  async ({ importacionId, proyectoId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}importaciones/${importacionId}/descartar/`);
      dispatch(fetchImportacionesPropuesta(proyectoId));
      return response.data;
    } catch (error) {
      return rejectWithValue(mensaje(error, 'Error al descartar la importación.'));
    }
  }
);

// Descarga directa (no pasa por Redux: el resultado es un archivo).
export const descargarBorradorFormato = async ({ proyectoId, tipoDocumentoId, controlCambiosId }) => {
  const response = await axiosInstance.get(`${BASE}generar/`, {
    params: {
      proyecto: proyectoId,
      tipo_documento: tipoDocumentoId,
      ...(controlCambiosId ? { control_cambios: controlCambiosId } : {}),
    },
    responseType: 'blob',
  });
  const disposition = response.headers['content-disposition'] || '';
  const coincidencia = disposition.match(/filename="?([^"]+)"?/);
  const nombre = coincidencia ? coincidencia[1] : 'borrador.docx';
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.setAttribute('download', nombre);
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(url);
  return nombre;
};

const formatosSlice = createSlice({
  name: 'formatos',
  initialState: {
    tiposGenerables: [],
    importaciones: [],
    loading: false,
    subiendo: false,
    confirmando: false,
    error: null,
    ultimoResumen: null,
  },
  reducers: {
    limpiarResumenImportacion: (state) => {
      state.ultimoResumen = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTiposGenerables.fulfilled, (state, action) => {
        state.tiposGenerables = action.payload;
      })
      .addCase(fetchImportacionesPropuesta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImportacionesPropuesta.fulfilled, (state, action) => {
        state.loading = false;
        state.importaciones = action.payload;
      })
      .addCase(fetchImportacionesPropuesta.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(subirPropuestaDocx.pending, (state) => {
        state.subiendo = true;
        state.error = null;
        state.ultimoResumen = null;
      })
      .addCase(subirPropuestaDocx.fulfilled, (state) => {
        state.subiendo = false;
      })
      .addCase(subirPropuestaDocx.rejected, (state, action) => {
        state.subiendo = false;
        state.error = action.payload;
      })
      .addCase(confirmarImportacionPropuesta.pending, (state) => {
        state.confirmando = true;
        state.error = null;
      })
      .addCase(confirmarImportacionPropuesta.fulfilled, (state, action) => {
        state.confirmando = false;
        state.ultimoResumen = action.payload.resumen;
      })
      .addCase(confirmarImportacionPropuesta.rejected, (state, action) => {
        state.confirmando = false;
        state.error = action.payload;
      })
      .addCase(descartarImportacionPropuesta.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { limpiarResumenImportacion } = formatosSlice.actions;
export default formatosSlice.reducer;
