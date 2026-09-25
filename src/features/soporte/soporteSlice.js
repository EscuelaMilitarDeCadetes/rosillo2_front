// src/features/soporte/soporteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const enviarSolicitudSoporte = createAsyncThunk(
  'soporte/enviarSolicitud',
  async ({ asunto, mensaje }, { rejectWithValue }) => {
    try {
      await axiosInstance.post('common/soporte/', { asunto, mensaje });
      return true;
    } catch (error) {
      const data = error.response?.data;
      const mensajeError =
        typeof data === 'string'
          ? data
          : (data && Object.values(data).flat().join(' ')) ||
            'No se pudo enviar la solicitud de soporte.';
      return rejectWithValue(mensajeError);
    }
  }
);

const soporteSlice = createSlice({
  name: 'soporte',
  initialState: {
    enviando: false,
    error: null,
    enviadoConExito: false,
  },
  reducers: {
    limpiarEstadoSoporte: (state) => {
      state.error = null;
      state.enviadoConExito = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(enviarSolicitudSoporte.pending, (state) => {
        state.enviando = true;
        state.error = null;
        state.enviadoConExito = false;
      })
      .addCase(enviarSolicitudSoporte.fulfilled, (state) => {
        state.enviando = false;
        state.enviadoConExito = true;
      })
      .addCase(enviarSolicitudSoporte.rejected, (state, action) => {
        state.enviando = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarEstadoSoporte } = soporteSlice.actions;
export default soporteSlice.reducer;