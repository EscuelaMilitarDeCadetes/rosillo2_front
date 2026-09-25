// src/features/catalogos/productoXGrupoFiltrosSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formal/productos-grupo/';

export const fetchProductoXGrupoPorProductoMinciencias = createAsyncThunk(
  'productoXGrupoFiltros/porProductoMinciencias',
  async (productoMincienciasId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-producto-minciencias/${productoMincienciasId}/`);
      // El backend devuelve un único objeto (o 204 si no existe relación)
      return response.status === 204 || !response.data ? [] : [response.data];
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al filtrar por Producto Minciencias.');
    }
  }
);

export const fetchProductoXGrupoPorGrupoMinciencias = createAsyncThunk(
  'productoXGrupoFiltros/porGrupoMinciencias',
  async (grupoMincienciasId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-grupo-minciencias/${grupoMincienciasId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al filtrar por Grupo Minciencias.');
    }
  }
);

export const fetchProductoXGrupoPorTipoProducto = createAsyncThunk(
  'productoXGrupoFiltros/porTipoProducto',
  async (tipoProductoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-tipo-producto/${tipoProductoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al filtrar por Tipo de Producto.');
    }
  }
);

const productoXGrupoFiltrosSlice = createSlice({
  name: 'productoXGrupoFiltros',
  initialState: {
    resultados: [],
    filtroActivo: null, // 'producto_minciencias' | 'grupo_minciencias' | 'tipo_producto'
    loading: false,
    error: null,
  },
  reducers: {
    limpiarFiltroProductoXGrupo: (state) => {
      state.resultados = [];
      state.filtroActivo = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (tipo) => (state) => {
      state.loading = true;
      state.error = null;
      state.filtroActivo = tipo;
    };
    const fulfilled = (state, action) => {
      state.loading = false;
      state.resultados = action.payload;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };
    builder
      .addCase(fetchProductoXGrupoPorProductoMinciencias.pending, pending('producto_minciencias'))
      .addCase(fetchProductoXGrupoPorProductoMinciencias.fulfilled, fulfilled)
      .addCase(fetchProductoXGrupoPorProductoMinciencias.rejected, rejected)
      .addCase(fetchProductoXGrupoPorGrupoMinciencias.pending, pending('grupo_minciencias'))
      .addCase(fetchProductoXGrupoPorGrupoMinciencias.fulfilled, fulfilled)
      .addCase(fetchProductoXGrupoPorGrupoMinciencias.rejected, rejected)
      .addCase(fetchProductoXGrupoPorTipoProducto.pending, pending('tipo_producto'))
      .addCase(fetchProductoXGrupoPorTipoProducto.fulfilled, fulfilled)
      .addCase(fetchProductoXGrupoPorTipoProducto.rejected, rejected);
  },
});

export const { limpiarFiltroProductoXGrupo } = productoXGrupoFiltrosSlice.actions;
export default productoXGrupoFiltrosSlice.reducer;