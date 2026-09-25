// src/features/proyectos/montoSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const BASE = "investigacion-formal/montos/";


// Thunk para obtener proyectos con sus montos
export const fetchProjectsWithBudgets = createAsyncThunk(
  "montos/fetchWithBudgets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE);
      return response.data;
    } catch (error) {
      return rejectWithValue("Error al cargar los presupuestos.");
    }
  }
);

// Thunk para actualizar un monto
export const updateBudget = createAsyncThunk(
  "montos/updateBudget",
  async ({ montoId, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${BASE}${montoId}/asignar-aprobado/`,
        data
      );
      dispatch(fetchProjectsWithBudgets());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al actualizar el monto."
      );
    }
  }
);

// Thunk para obtener el monto de un proyecto específico
export const fetchMontoPorProyecto = createAsyncThunk(
  "montos/fetchMontoPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${BASE}por-proyecto/${proyectoId}/`
      );
      return response.status === 204 || !response.data ? null : response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar el monto."
      );
    }
  }
);

// Thunk para modificar el valor aprobado de un Monto YA asignado
export const editarValorAprobado = createAsyncThunk(
  "montos/editarValorAprobado",
  async ({ montoId, aprobado, proyectoId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${BASE}${montoId}/editar-valor-aprobado/`,
        { aprobado }
      );
      if (proyectoId) dispatch(fetchMontoPorProyecto(proyectoId));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al modificar el monto aprobado.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para el reporte de montos aprobados de proyectos ya calificados
export const fetchMontosAprobadosCalificados = createAsyncThunk(
  "montos/fetchAprobadosCalificados",
  async (interno = true, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${BASE}aprobados-calificados/`,
        { params: { interno } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar el reporte de montos aprobados calificados."
      );
    }
  }
);

// Thunk para el reporte de contrapartida de proyectos ya calificados
export const fetchMontosContrapartidaCalificados = createAsyncThunk(
  "montos/fetchContrapartidaCalificados",
  async (interno = true, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${BASE}contrapartida-calificados/`,
        { params: { interno } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar el reporte de contrapartida de proyectos calificados."
      );
    }
  }
);

// Thunk para el reporte de totales (aprobado + contrapartida) de proyectos calificados
export const fetchMontosTotalesCalificados = createAsyncThunk(
  "montos/fetchTotalesCalificados",
  async (interno = true, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${BASE}totales-calificados/`,
        { params: { interno } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar el reporte de totales de proyectos calificados."
      );
    }
  }
);

// Thunk para el widget aislado de % de avance presupuestal de un proyecto
export const fetchAvancePresupuestalProyecto = createAsyncThunk(
  "montos/fetchAvancePresupuestalProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${BASE}avance-presupuestal/${proyectoId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar el avance presupuestal."
      );
    }
  }
);

export const asignarContrapartida = createAsyncThunk(
  "montos/asignarContrapartida",
  async ({ montoId, contrapartida }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${BASE}${montoId}/asignar-contrapartida/`,
        { contrapartida }
      );
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      return rejectWithValue(
        (data && Object.values(data).flat().join(" ")) || "Error al asignar la contrapartida."
      );
    }
  }
);


const montoSlice = createSlice({
  name: "montos",
  initialState: {
    projectsWithBudgets: [],
    montoProyecto: null,
    reporteMontosCalificados: {
      aprobados: [],
      contrapartida: [],
      totales: [],
    },
    avancePresupuestal: null,
    loading: false,
    loadingReporte: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectsWithBudgets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjectsWithBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.projectsWithBudgets = action.payload;
      })
      .addCase(fetchProjectsWithBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBudget.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBudget.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMontoPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMontoPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.montoProyecto = action.payload;
      })
      .addCase(fetchMontoPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editarValorAprobado.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editarValorAprobado.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(editarValorAprobado.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMontosAprobadosCalificados.pending, (state) => {
        state.loadingReporte = true;
        state.error = null;
      })
      .addCase(fetchMontosAprobadosCalificados.fulfilled, (state, action) => {
        state.loadingReporte = false;
        state.reporteMontosCalificados.aprobados = action.payload;
      })
      .addCase(fetchMontosAprobadosCalificados.rejected, (state, action) => {
        state.loadingReporte = false;
        state.error = action.payload;
      })
      .addCase(fetchMontosContrapartidaCalificados.pending, (state) => {
        state.loadingReporte = true;
        state.error = null;
      })
      .addCase(fetchMontosContrapartidaCalificados.fulfilled, (state, action) => {
        state.loadingReporte = false;
        state.reporteMontosCalificados.contrapartida = action.payload;
      })
      .addCase(fetchMontosContrapartidaCalificados.rejected, (state, action) => {
        state.loadingReporte = false;
        state.error = action.payload;
      })
      .addCase(fetchMontosTotalesCalificados.pending, (state) => {
        state.loadingReporte = true;
        state.error = null;
      })
      .addCase(fetchMontosTotalesCalificados.fulfilled, (state, action) => {
        state.loadingReporte = false;
        state.reporteMontosCalificados.totales = action.payload;
      })
      .addCase(fetchMontosTotalesCalificados.rejected, (state, action) => {
        state.loadingReporte = false;
        state.error = action.payload;
      })
      .addCase(fetchAvancePresupuestalProyecto.pending, (state) => {
        state.loadingReporte = true;
      })
      .addCase(fetchAvancePresupuestalProyecto.fulfilled, (state, action) => {
        state.loadingReporte = false;
        state.avancePresupuestal = action.payload;
      })
      .addCase(fetchAvancePresupuestalProyecto.rejected, (state, action) => {
        state.loadingReporte = false;
        state.error = action.payload;
      });
  },
});

export default montoSlice.reducer;