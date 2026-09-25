// src/features/catalogos/catalogosSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { CATALOGOS_CONFIG } from './catalogosConfig';

const estadoInicialCatalogo = () => ({
  items: [],
  total: 0,
  loading: false,
  saving: false,
  error: null,
  filtroActivo: false,
});

const estadoInicial = Object.keys(CATALOGOS_CONFIG).reduce((acc, key) => {
  acc[key] = estadoInicialCatalogo();
  return acc;
}, {});

export const fetchCatalogo = createAsyncThunk(
  'catalogos/fetchCatalogo',
  async ({ catalogKey, page = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const { endpoint } = CATALOGOS_CONFIG[catalogKey];
      const response = await axiosInstance.get(endpoint, { params: { page, page_size: pageSize } });
      return { catalogKey, data: response.data };
    } catch (error) {
      return rejectWithValue({ catalogKey, mensaje: 'Error al cargar el catálogo.' });
    }
  }
);

export const crearCatalogoItem = createAsyncThunk(
  'catalogos/crearCatalogoItem',
  async ({ catalogKey, payload }, { dispatch, rejectWithValue }) => {
    try {
      const { endpoint } = CATALOGOS_CONFIG[catalogKey];
      const response = await axiosInstance.post(endpoint, payload);
      dispatch(fetchCatalogo({ catalogKey }));
      return { catalogKey, data: response.data };
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === 'string'
          ? data
          : (data && Object.values(data).flat().join(' ')) || 'Error al crear el registro.';
      return rejectWithValue({ catalogKey, mensaje });
    }
  }
);

export const actualizarCatalogoItem = createAsyncThunk(
  'catalogos/actualizarCatalogoItem',
  async ({ catalogKey, id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const { endpoint, metodoActualizar } = CATALOGOS_CONFIG[catalogKey];
      // Se respeta 'metodoActualizar' de catalogosConfig.js
      // (por defecto 'PUT'; 'PATCH' solo donde el
      // backend realmente lo requiere).
      const metodo = (metodoActualizar || 'PUT').toLowerCase();
      const response = await axiosInstance[metodo](`${endpoint}${id}/`, payload);
      dispatch(fetchCatalogo({ catalogKey }));
      return { catalogKey, data: response.data };
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === 'string'
          ? data
          : (data && Object.values(data).flat().join(' ')) || 'Error al editar el registro.';
      return rejectWithValue({ catalogKey, mensaje });
    }
  }
);

export const fetchCatalogoFiltrado = createAsyncThunk(
  'catalogos/fetchCatalogoFiltrado',
  async ({ catalogKey, valor }, { rejectWithValue }) => {
    try {
      const { filtro } = CATALOGOS_CONFIG[catalogKey];
      const response = await axiosInstance.get(filtro.endpoint, {
        params: { [filtro.campo]: valor },
      });
      return { catalogKey, data: response.data }; // por-grupo devuelve array plano, sin paginar
    } catch (error) {
      return rejectWithValue({ catalogKey, mensaje: 'Error al filtrar el catálogo.' });
    }
  }
);


const catalogosSlice = createSlice({
  name: 'catalogos',
  initialState: estadoInicial,
  reducers: {
    limpiarErrorCatalogo: (state, action) => {
      const catalogKey = action.payload;
      if (state[catalogKey]) state[catalogKey].error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogo.pending, (state, action) => {
        state[action.meta.arg.catalogKey].loading = true;
      })
      .addCase(fetchCatalogo.fulfilled, (state, action) => {
        const { catalogKey, data } = action.payload;
        state[catalogKey].loading = false;
        state[catalogKey].items = data.results ?? [];
        state[catalogKey].total = data.count ?? 0;
        state[catalogKey].filtroActivo = false;
      })
      .addCase(fetchCatalogo.rejected, (state, action) => {
        const { catalogKey, mensaje } = action.payload;
        state[catalogKey].loading = false;
        state[catalogKey].error = mensaje;
      })
      .addCase(fetchCatalogoFiltrado.pending, (state, action) => {
        state[action.meta.arg.catalogKey].loading = true;
      })
      .addCase(fetchCatalogoFiltrado.fulfilled, (state, action) => {
        const { catalogKey, data } = action.payload;
        state[catalogKey].loading = false;
        state[catalogKey].items = data ?? [];
        state[catalogKey].total = (data ?? []).length;
        state[catalogKey].filtroActivo = true;
      })
      .addCase(fetchCatalogoFiltrado.rejected, (state, action) => {
        const { catalogKey, mensaje } = action.payload;
        state[catalogKey].loading = false;
        state[catalogKey].error = mensaje;
      })
      .addCase(crearCatalogoItem.pending, (state, action) => {
        state[action.meta.arg.catalogKey].saving = true;
        state[action.meta.arg.catalogKey].error = null;
      })
      .addCase(crearCatalogoItem.fulfilled, (state, action) => {
        state[action.payload.catalogKey].saving = false;
      })
      .addCase(crearCatalogoItem.rejected, (state, action) => {
        const { catalogKey, mensaje } = action.payload;
        state[catalogKey].saving = false;
        state[catalogKey].error = mensaje;
      })
      .addCase(actualizarCatalogoItem.pending, (state, action) => {
        state[action.meta.arg.catalogKey].saving = true;
        state[action.meta.arg.catalogKey].error = null;
      })
      .addCase(actualizarCatalogoItem.fulfilled, (state, action) => {
        state[action.payload.catalogKey].saving = false;
      })
      .addCase(actualizarCatalogoItem.rejected, (state, action) => {
        const { catalogKey, mensaje } = action.payload;
        state[catalogKey].saving = false;
        state[catalogKey].error = mensaje;
      });
  },
});

export const { limpiarErrorCatalogo } = catalogosSlice.actions;
export default catalogosSlice.reducer;