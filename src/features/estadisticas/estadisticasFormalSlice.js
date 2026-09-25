// src/features/estadisticas/estadisticasFormalSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const BASE = 'investigacion-formal/estadisticas/';

const buildParams = (filtros = {}) => {
  const params = {};
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params[key] = value;
    }
  });
  return params;
};

export const fetchOpcionesFiltro = createAsyncThunk(
  'estadisticasFormal/fetchOpcionesFiltro',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}filtros/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar los filtros de estadísticas.');
    }
  }
);

export const fetchProyectosPorEntidad = createAsyncThunk(
  'estadisticasFormal/fetchProyectosPorEntidad',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}proyectos-por-entidad/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar proyectos por entidad.');
    }
  }
);

export const fetchProductosPorEntidad = createAsyncThunk(
  'estadisticasFormal/fetchProductosPorEntidad',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}productos-por-entidad/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar productos por entidad.');
    }
  }
);

export const fetchProyectosPorAnio = createAsyncThunk(
  'estadisticasFormal/fetchProyectosPorAnio',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}proyectos-por-anio/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar proyectos por año.');
    }
  }
);

export const fetchProduccionPorAnio = createAsyncThunk(
  'estadisticasFormal/fetchProduccionPorAnio',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}produccion-por-anio/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar la producción por año.');
    }
  }
);

export const fetchFinalizadosVsEjecucion = createAsyncThunk(
  'estadisticasFormal/fetchFinalizadosVsEjecucion',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}finalizados-vs-ejecucion/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar finalizados vs. en ejecución.');
    }
  }
);

export const fetchEjecucionPresupuestalPorAnio = createAsyncThunk(
  'estadisticasFormal/fetchEjecucionPresupuestalPorAnio',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}ejecucion-presupuestal-por-anio/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar la ejecución presupuestal.');
    }
  }
);

export const fetchAvancePonderadoPorAnio = createAsyncThunk(
  'estadisticasFormal/fetchAvancePonderadoPorAnio',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}avance-ponderado-por-anio/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar el avance ponderado.');
    }
  }
);

const initialState = {
  opcionesFiltro: {
    convocatorias: [],
    facultades: [],
    grupos: [],
    productos_minciencias: [],
    grupos_minciencias: [],
  },
  proyectosPorEntidad: [],
  productosPorEntidad: [],
  proyectosPorAnio: [],
  produccionPorAnio: [],
  finalizadosVsEjecucion: [],
  ejecucionPresupuestalPorAnio: [],
  avancePonderadoPorAnio: [],
  loading: {
    opciones: false,
    proyectosPorEntidad: false,
    productosPorEntidad: false,
    proyectosPorAnio: false,
    produccionPorAnio: false,
    finalizadosVsEjecucion: false,
    ejecucionPresupuestalPorAnio: false,
    avancePonderadoPorAnio: false,
  },
  error: null,
};

const estadisticasFormalSlice = createSlice({
  name: 'estadisticasFormal',
  initialState,
  reducers: {
    limpiarErrorEstadisticas: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpcionesFiltro.pending, (state) => { state.loading.opciones = true; })
      .addCase(fetchOpcionesFiltro.fulfilled, (state, action) => {
        state.loading.opciones = false;
        state.opcionesFiltro = action.payload;
      })
      .addCase(fetchOpcionesFiltro.rejected, (state, action) => {
        state.loading.opciones = false;
        state.error = action.payload;
      })

      .addCase(fetchProyectosPorEntidad.pending, (state) => { state.loading.proyectosPorEntidad = true; })
      .addCase(fetchProyectosPorEntidad.fulfilled, (state, action) => {
        state.loading.proyectosPorEntidad = false;
        state.proyectosPorEntidad = action.payload;
      })
      .addCase(fetchProyectosPorEntidad.rejected, (state, action) => {
        state.loading.proyectosPorEntidad = false;
        state.error = action.payload;
      })

      .addCase(fetchProductosPorEntidad.pending, (state) => { state.loading.productosPorEntidad = true; })
      .addCase(fetchProductosPorEntidad.fulfilled, (state, action) => {
        state.loading.productosPorEntidad = false;
        state.productosPorEntidad = action.payload;
      })
      .addCase(fetchProductosPorEntidad.rejected, (state, action) => {
        state.loading.productosPorEntidad = false;
        state.error = action.payload;
      })

      .addCase(fetchProyectosPorAnio.pending, (state) => { state.loading.proyectosPorAnio = true; })
      .addCase(fetchProyectosPorAnio.fulfilled, (state, action) => {
        state.loading.proyectosPorAnio = false;
        state.proyectosPorAnio = action.payload;
      })
      .addCase(fetchProyectosPorAnio.rejected, (state, action) => {
        state.loading.proyectosPorAnio = false;
        state.error = action.payload;
      })
      .addCase(fetchProduccionPorAnio.pending, (state) => { 
        state.loading.produccionPorAnio = true; 
      })
      .addCase(fetchProduccionPorAnio.fulfilled, (state, action) => {
        state.loading.produccionPorAnio = false;
        state.produccionPorAnio = action.payload;
      })
      .addCase(fetchProduccionPorAnio.rejected, (state, action) => {
        state.loading.produccionPorAnio = false;
        state.error = action.payload;
      })
      .addCase(fetchFinalizadosVsEjecucion.pending, (state) => { state.loading.finalizadosVsEjecucion = true; })
      .addCase(fetchFinalizadosVsEjecucion.fulfilled, (state, action) => {
        state.loading.finalizadosVsEjecucion = false;
        state.finalizadosVsEjecucion = action.payload;
      })
      .addCase(fetchFinalizadosVsEjecucion.rejected, (state, action) => {
        state.loading.finalizadosVsEjecucion = false;
        state.error = action.payload;
      })

      .addCase(fetchEjecucionPresupuestalPorAnio.pending, (state) => { state.loading.ejecucionPresupuestalPorAnio = true; })
      .addCase(fetchEjecucionPresupuestalPorAnio.fulfilled, (state, action) => {
        state.loading.ejecucionPresupuestalPorAnio = false;
        state.ejecucionPresupuestalPorAnio = action.payload;
      })
      .addCase(fetchEjecucionPresupuestalPorAnio.rejected, (state, action) => {
        state.loading.ejecucionPresupuestalPorAnio = false;
        state.error = action.payload;
      })

      .addCase(fetchAvancePonderadoPorAnio.pending, (state) => { state.loading.avancePonderadoPorAnio = true; })
      .addCase(fetchAvancePonderadoPorAnio.fulfilled, (state, action) => {
        state.loading.avancePonderadoPorAnio = false;
        state.avancePonderadoPorAnio = action.payload;
      })
      .addCase(fetchAvancePonderadoPorAnio.rejected, (state, action) => {
        state.loading.avancePonderadoPorAnio = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorEstadisticas } = estadisticasFormalSlice.actions;
export default estadisticasFormalSlice.reducer;