// src/features/catalogos/tipoRubroFiltrosSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchTiposRubroAplicables = createAsyncThunk(
  'tipoRubroFiltros/fetchAplicables',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('investigacion-formal/tipos-rubro/aplicables/');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Error al cargar los tipos de rubro aplicables.'
      );
    }
  }
);

const tipoRubroFiltrosSlice = createSlice({
  name: 'tipoRubroFiltros',
  initialState: { aplicables: [], loading: false, error: null },
  reducers: {
    limpiarTiposRubroAplicables: (state) => {
      state.aplicables = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTiposRubroAplicables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTiposRubroAplicables.fulfilled, (state, action) => {
        state.loading = false;
        state.aplicables = action.payload;
      })
      .addCase(fetchTiposRubroAplicables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarTiposRubroAplicables } = tipoRubroFiltrosSlice.actions;
export default tipoRubroFiltrosSlice.reducer;