// src/features/reportesInstitucionales/reportesInstitucionalesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE_FACULTADES = 'institucional/facultades/';
const BASE_GRUPOS = 'institucional/grupos/';

export const fetchFacultadPorUsuario = createAsyncThunk(
  'reportesInstitucionales/fetchFacultadPorUsuario',
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE_FACULTADES}por-usuario/${usuarioId}/`);
      return response.status === 204 ? null : response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        return rejectWithValue({ ambiguo: true, mensaje: error.response.data?.error });
      }
      return rejectWithValue({
        ambiguo: false,
        mensaje: error.response?.data?.detail || 'Error al consultar la facultad del usuario.',
      });
    }
  }
);

export const fetchFacultadesPorGrupo = createAsyncThunk(
  'reportesInstitucionales/fetchFacultadesPorGrupo',
  async (grupoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE_FACULTADES}por-grupo/`, { params: { grupo_id: grupoId } });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || error.response?.data?.error || 'Error al consultar las facultades del grupo.'
      );
    }
  }
);

export const fetchGrupoPorUsuario = createAsyncThunk(
  'reportesInstitucionales/fetchGrupoPorUsuario',
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE_GRUPOS}por-usuario/${usuarioId}/`);
      return response.status === 204 ? null : response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        return rejectWithValue({ ambiguo: true, mensaje: error.response.data?.error });
      }
      return rejectWithValue({
        ambiguo: false,
        mensaje: error.response?.data?.detail || 'Error al consultar el grupo del usuario.',
      });
    }
  }
);

const reportesInstitucionalesSlice = createSlice({
  name: 'reportesInstitucionales',
  initialState: {
    facultadPorUsuario: null,
    facultadPorUsuarioLoading: false,
    facultadPorUsuarioError: null, // 

    grupoPorUsuario: null,
    grupoPorUsuarioLoading: false,
    grupoPorUsuarioError: null, // 

    facultadesPorGrupo: [],
    facultadesPorGrupoLoading: false,
    error: null,
  },
  reducers: {
    limpiarReportePorUsuario: (state) => {
      state.facultadPorUsuario = null;
      state.facultadPorUsuarioError = null;
      state.grupoPorUsuario = null;
      state.grupoPorUsuarioError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacultadPorUsuario.pending, (state) => {
        state.facultadPorUsuarioLoading = true;
        state.facultadPorUsuarioError = null;
      })
      .addCase(fetchFacultadPorUsuario.fulfilled, (state, action) => {
        state.facultadPorUsuarioLoading = false;
        state.facultadPorUsuario = action.payload;
      })
      .addCase(fetchFacultadPorUsuario.rejected, (state, action) => {
        state.facultadPorUsuarioLoading = false;
        state.facultadPorUsuario = null;
        state.facultadPorUsuarioError = action.payload;
      })
      .addCase(fetchGrupoPorUsuario.pending, (state) => {
        state.grupoPorUsuarioLoading = true;
        state.grupoPorUsuarioError = null;
      })
      .addCase(fetchGrupoPorUsuario.fulfilled, (state, action) => {
        state.grupoPorUsuarioLoading = false;
        state.grupoPorUsuario = action.payload;
      })
      .addCase(fetchGrupoPorUsuario.rejected, (state, action) => {
        state.grupoPorUsuarioLoading = false;
        state.grupoPorUsuario = null;
        state.grupoPorUsuarioError = action.payload;
      })
      .addCase(fetchFacultadesPorGrupo.pending, (state) => {
        state.facultadesPorGrupoLoading = true;
        state.error = null;
      })
      .addCase(fetchFacultadesPorGrupo.fulfilled, (state, action) => {
        state.facultadesPorGrupoLoading = false;
        state.facultadesPorGrupo = action.payload;
      })
      .addCase(fetchFacultadesPorGrupo.rejected, (state, action) => {
        state.facultadesPorGrupoLoading = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarReportePorUsuario } = reportesInstitucionalesSlice.actions;
export default reportesInstitucionalesSlice.reducer;