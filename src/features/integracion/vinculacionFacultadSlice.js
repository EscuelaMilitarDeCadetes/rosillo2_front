// src/features/integracion/vinculacionFacultadSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'integracion/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

// payload en los tres casos: { grado_id, nombre, apellido, documento, celular,
//   correo, cvlac?, rol_plataforma_id, facultad_id, rol_grupo_id, username?, password? }

export const crearEstudianteFacultad = createAsyncThunk(
  'vinculacionFacultad/crearEstudianteFacultad',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}crear-estudiante/`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear el estudiante.'));
    }
  }
);

export const crearJuradoFacultad = createAsyncThunk(
  'vinculacionFacultad/crearJuradoFacultad',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}crear-jurado/`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear el jurado.'));
    }
  }
);

export const crearTutorFacultad = createAsyncThunk(
  'vinculacionFacultad/crearTutorFacultad',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}crear-tutor/`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear el tutor.'));
    }
  }
);

const vinculacionFacultadSlice = createSlice({
  name: 'vinculacionFacultad',
  initialState: {
    saving: false,
    error: null,
    ultimoResultado: null,
  },
  reducers: {
    limpiarErrorVinculacionFacultad: (state) => {
      state.error = null;
    },
    limpiarResultadoVinculacionFacultad: (state) => {
      state.ultimoResultado = null;
    },
  },
  extraReducers: (builder) => {
    const casosCreacion = [crearEstudianteFacultad, crearJuradoFacultad, crearTutorFacultad];
    casosCreacion.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.saving = true;
          state.error = null;
          state.ultimoResultado = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.saving = false;
          state.ultimoResultado = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.saving = false;
          state.error = action.payload;
        });
    });
  },
});

export const {
  limpiarErrorVinculacionFacultad,
  limpiarResultadoVinculacionFacultad,
} = vinculacionFacultadSlice.actions;
export default vinculacionFacultadSlice.reducer;