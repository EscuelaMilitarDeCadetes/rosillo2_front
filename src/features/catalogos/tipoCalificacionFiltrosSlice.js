// src/features/catalogos/tipoCalificacionFiltrosSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// TipoCalificacionViewSet.evaluables — antes sin usar en React
export const fetchTiposCalificacionEvaluables = createAsyncThunk(
  'tipoCalificacionFiltros/fetchEvaluables',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('investigacion-formal/tipos-calificacion/evaluables/');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Error al cargar los tipos de calificación evaluables.'
      );
    }
  }
);

const tipoCalificacionFiltrosSlice = createSlice({
  name: 'tipoCalificacionFiltros',
  initialState: {
    evaluables: [],
    loading: false,
    error: null,
  },
  reducers: {
    limpiarTiposCalificacionEvaluables: (state) => {
      state.evaluables = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTiposCalificacionEvaluables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTiposCalificacionEvaluables.fulfilled, (state, action) => {
        state.loading = false;
        state.evaluables = action.payload;
      })
      .addCase(fetchTiposCalificacionEvaluables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarTiposCalificacionEvaluables } = tipoCalificacionFiltrosSlice.actions;
export default tipoCalificacionFiltrosSlice.reducer;