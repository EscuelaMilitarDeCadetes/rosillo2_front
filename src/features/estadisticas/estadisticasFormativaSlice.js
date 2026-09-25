// src/features/estadisticas/estadisticasFormativaSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const BASE = 'investigacion-formativa/estadisticas/';

const buildParams = (filtros = {}) => {
  const params = {};
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params[key] = value;
    }
  });
  return params;
};

export const fetchOpcionesFiltroFormativa = createAsyncThunk(
  'estadisticasFormativa/fetchOpcionesFiltroFormativa',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}filtros/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar los filtros de estadísticas.');
    }
  }
);

export const fetchProcesosPorAnio = createAsyncThunk(
  'estadisticasFormativa/fetchProcesosPorAnio',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}procesos-por-anio/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar procesos por año.');
    }
  }
);

export const fetchProcesosPorModalidad = createAsyncThunk(
  'estadisticasFormativa/fetchProcesosPorModalidad',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}procesos-por-modalidad/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar procesos por modalidad.');
    }
  }
);

export const fetchAprobadosVsReprobadosPorAnio = createAsyncThunk(
  'estadisticasFormativa/fetchAprobadosVsReprobadosPorAnio',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}aprobados-vs-reprobados-por-anio/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar aprobados vs. reprobados.');
    }
  }
);

export const fetchPromedioNotaFinalPorModalidad = createAsyncThunk(
  'estadisticasFormativa/fetchPromedioNotaFinalPorModalidad',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}promedio-nota-final-por-modalidad/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar el promedio de nota final.');
    }
  }
);

export const fetchProcesosPorEstadoGeneral = createAsyncThunk(
  'estadisticasFormativa/fetchProcesosPorEstadoGeneral',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}procesos-por-estado-general/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar procesos por estado general.');
    }
  }
);

export const fetchSegundaInstanciaPorAnio = createAsyncThunk(
  'estadisticasFormativa/fetchSegundaInstanciaPorAnio',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}segunda-instancia-por-anio/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar segunda instancia por año.');
    }
  }
);

export const fetchPromedioAvancePorModalidad = createAsyncThunk(
  'estadisticasFormativa/fetchPromedioAvancePorModalidad',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}promedio-avance-por-modalidad/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar el promedio de avance.');
    }
  }
);

export const fetchCertificacionesPorTipoYAnio = createAsyncThunk(
  'estadisticasFormativa/fetchCertificacionesPorTipoYAnio',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}certificaciones-por-tipo-y-anio/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar certificaciones por tipo y año.');
    }
  }
);

export const fetchTasaAprobacionPorModalidad = createAsyncThunk(
  'estadisticasFormativa/fetchTasaAprobacionPorModalidad',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}tasa-aprobacion-por-modalidad/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar la tasa de aprobación.');
    }
  }
);

export const fetchPromedioHorasAcumuladasPorModalidad = createAsyncThunk(
  'estadisticasFormativa/fetchPromedioHorasAcumuladasPorModalidad',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}promedio-horas-acumuladas-por-modalidad/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar el promedio de horas acumuladas.');
    }
  }
);

export const fetchDistribucionEstadoActual = createAsyncThunk(
  'estadisticasFormativa/fetchDistribucionEstadoActual',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}distribucion-estado-actual/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar la distribución por estado actual.');
    }
  }
);

export const fetchPromedioAvanceTiempoPorAnio = createAsyncThunk(
  'estadisticasFormativa/fetchPromedioAvanceTiempoPorAnio',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}promedio-avance-tiempo-por-anio/`, { params: buildParams(filtros) });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar el promedio de avance en tiempo por año.');
    }
  }
);

const initialState = {
  opcionesFiltro: {
    modalidades: [],
    facultades: [],
  },
  procesosPorAnio: [],
  procesosPorModalidad: [],
  aprobadosVsReprobadosPorAnio: [],
  promedioNotaFinalPorModalidad: [],
  procesosPorEstadoGeneral: [],
  segundaInstanciaPorAnio: [],
  promedioAvancePorModalidad: [],
  certificacionesPorTipoYAnio: [],
  tasaAprobacionPorModalidad: [],
  promedioHorasAcumuladasPorModalidad: [],
  distribucionEstadoActual: [],
  promedioAvanceTiempoPorAnio: [],
  loading: {
    opciones: false,
    procesosPorAnio: false,
    procesosPorModalidad: false,
    aprobadosVsReprobadosPorAnio: false,
    promedioNotaFinalPorModalidad: false,
    procesosPorEstadoGeneral: false,
    segundaInstanciaPorAnio: false,
    promedioAvancePorModalidad: false,
    certificacionesPorTipoYAnio: false,
    tasaAprobacionPorModalidad: false,
    promedioHorasAcumuladasPorModalidad: false,
    distribucionEstadoActual: false,
    promedioAvanceTiempoPorAnio: false,
  },
  error: null,
};

const registrarCaso = (builder, thunk, campo) => {
  builder
    .addCase(thunk.pending, (state) => { state.loading[campo] = true; })
    .addCase(thunk.fulfilled, (state, action) => {
      state.loading[campo] = false;
      state[campo] = action.payload;
    })
    .addCase(thunk.rejected, (state, action) => {
      state.loading[campo] = false;
      state.error = action.payload;
    });
};

const estadisticasFormativaSlice = createSlice({
  name: 'estadisticasFormativa',
  initialState,
  reducers: {
    limpiarErrorEstadisticasFormativa: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpcionesFiltroFormativa.pending, (state) => { state.loading.opciones = true; })
      .addCase(fetchOpcionesFiltroFormativa.fulfilled, (state, action) => {
        state.loading.opciones = false;
        state.opcionesFiltro = action.payload;
      })
      .addCase(fetchOpcionesFiltroFormativa.rejected, (state, action) => {
        state.loading.opciones = false;
        state.error = action.payload;
      });

    registrarCaso(builder, fetchProcesosPorAnio, 'procesosPorAnio');
    registrarCaso(builder, fetchProcesosPorModalidad, 'procesosPorModalidad');
    registrarCaso(builder, fetchAprobadosVsReprobadosPorAnio, 'aprobadosVsReprobadosPorAnio');
    registrarCaso(builder, fetchPromedioNotaFinalPorModalidad, 'promedioNotaFinalPorModalidad');
    registrarCaso(builder, fetchProcesosPorEstadoGeneral, 'procesosPorEstadoGeneral');
    registrarCaso(builder, fetchSegundaInstanciaPorAnio, 'segundaInstanciaPorAnio');
    registrarCaso(builder, fetchPromedioAvancePorModalidad, 'promedioAvancePorModalidad');
    registrarCaso(builder, fetchCertificacionesPorTipoYAnio, 'certificacionesPorTipoYAnio');
    registrarCaso(builder, fetchTasaAprobacionPorModalidad, 'tasaAprobacionPorModalidad');
    registrarCaso(builder, fetchPromedioHorasAcumuladasPorModalidad, 'promedioHorasAcumuladasPorModalidad');
    registrarCaso(builder, fetchDistribucionEstadoActual, 'distribucionEstadoActual');
    registrarCaso(builder, fetchPromedioAvanceTiempoPorAnio, 'promedioAvanceTiempoPorAnio');
  },
});

export const { limpiarErrorEstadisticasFormativa } = estadisticasFormativaSlice.actions;
export default estadisticasFormativaSlice.reducer;