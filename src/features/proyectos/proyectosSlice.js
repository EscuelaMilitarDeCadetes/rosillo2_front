// src/features/proyectos/proyectosSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";


// Thunk para obtener una lista filtrada de proyectos
export const fetchProjects = createAsyncThunk(
  "proyectos/fetchProjects",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== ''))
      ).toString();
      const response = await axiosInstance.get(
        `investigacion-formal/proyecto-convocatoria/buscar/?${params}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Error al cargar los proyectos.');
    }
  }
);

// Thunk para crear un proyecto externo
export const crearProyectoExterno = createAsyncThunk(
  "proyectos/crearProyectoExterno",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "investigacion-formal/proyectos/crear-externo/",
        payload
      );
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : data?.error ||
            (data && Object.values(data).flat().join(" ")) ||
            "Error al crear el proyecto externo.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para obtener los detalles de un proyecto específico
export const fetchProyecto = createAsyncThunk(
  "proyectos/fetchProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `investigacion-formal/proyectos/${proyectoId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar el proyecto."
      );
    }
  }
);

// Thunk para actualizar la fecha de cierre del proyecto
export const updateProjectDates = createAsyncThunk(
  "proyectos/updateProjectDates",
  async ({ proyectoId, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `investigacion-formal/proyectos/${proyectoId}/asignar-timeline/`,
        data
      );
      dispatch(fetchProyecto(proyectoId));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al actualizar las fechas del proyecto."
      );
    }
  }
);

export const editarFechaCierre = createAsyncThunk(
  "proyectos/editarFechaCierre",
  async ({ proyectoId, fechaFin }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `investigacion-formal/proyectos/${proyectoId}/editar-fecha-cierre/`,
        { fecha_fin: fechaFin }
      );
      dispatch(fetchProyecto(proyectoId));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al modificar la fecha de cierre del proyecto.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para cambiar el estado de aprobación del proyecto
export const cambiarEstadoAprobado = createAsyncThunk(
  "proyectos/cambiarEstadoAprobado",
  async ({ proyectoId, estadoAprobado }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `investigacion-formal/proyectos/${proyectoId}/cambiar-estado-aprobado/`,
        { estado_aprobado: estadoAprobado }
      );
      dispatch(fetchProyecto(proyectoId));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al cambiar el estado de aprobación del proyecto.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para registrar el acta de cierre formal (cierre definitivo del proyecto)
export const registrarActaCierre = createAsyncThunk(
  "proyectos/registrarActaCierre",
  async (proyectoId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `investigacion-formal/proyectos/${proyectoId}/registrar-acta-cierre/`
      );
      dispatch(fetchProyecto(proyectoId));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al registrar el acta de cierre del proyecto.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para listar proyectos directamente por su estado_aprobado
export const fetchProyectosPorEstadoAprobado = createAsyncThunk(
  "proyectos/fetchProyectosPorEstadoAprobado",
  async (estadoAprobado, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        "investigacion-formal/proyectos/por-estado-aprobado/",
        { params: { estado_aprobado: estadoAprobado } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los proyectos por estado de aprobación."
      );
    }
  }
);

// Thunk para subir proyecto a GrupLAC
export const uploadProjectToGruplac = createAsyncThunk(
  "proyectos/uploadProjectToGruplac",
  async (proyectoId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `investigacion-formal/proyectos/${proyectoId}/subir-gruplac/`
      );
      dispatch(fetchProyecto(proyectoId));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al subir el proyecto a GrupLAC."
      );
    }
  }
);

export const fetchMisProyectos = createAsyncThunk(
  'proyectos/fetchMisProyectos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        'investigacion-formal/proyecto-convocatoria/mis-proyectos/'
      );
      return response.data; // array plano
    } catch (error) {
      return rejectWithValue('Error al cargar tus proyectos.');
    }
  }
);

export const fetchProyectosPorFacultad = createAsyncThunk(
  'proyectos/fetchProyectosPorFacultad',
  async (facultadId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `investigacion-formal/proyecto-convocatoria/por-facultad/${facultadId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Error al cargar los proyectos de la facultad.');
    }
  }
);

export const fetchProyectosPorGrupo = createAsyncThunk(
  'proyectos/fetchProyectosPorGrupo',
  async (grupoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `investigacion-formal/proyecto-convocatoria/por-grupo/${grupoId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Error al cargar los proyectos del grupo.');
    }
  }
);

// Thunk para las opciones de los dropdowns de filtro (convocatoria, años).
export const fetchOpcionesFiltroProyectos = createAsyncThunk(
  'proyectos/fetchOpcionesFiltroProyectos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        'investigacion-formal/proyecto-convocatoria/opciones-filtro/'
      );
      return {
        convocatorias: response.data.convocatorias.map((c) => ({ label: c, value: c })),
        aniosInicio: response.data.anios_inicio.map((a) => ({ label: String(a), value: a })),
        aniosFin: response.data.anios_fin.map((a) => ({ label: String(a), value: a })),
        aniosConvocatoria: response.data.anios_convocatoria.map((a) => ({ label: String(a), value: a })),
      };
    } catch (error) {
      return rejectWithValue('Error al cargar las opciones de filtro.');
    }
  }
);

const proyectosSlice = createSlice({
  name: "proyectos",
  initialState: {
    filteredProjects: [],
    totalProjects: 0,
    proyectoActual: null,
    proyectosPorRol: [],
    proyectosPorEstadoAprobado: [],
    loading: false,
    error: null,
    loadingProyectosPorRol: false,
    errorProyectosPorRol: null,
    loadingPorEstadoAprobado: false,
    errorPorEstadoAprobado: null,
    opcionesFiltro: { convocatorias: [], aniosInicio: [], aniosFin: [], aniosConvocatoria: [] },
    loadingOpcionesFiltro: false,
    errorOpcionesFiltro: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredProjects = action.payload.results;
        state.totalProjects = action.payload.count;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.filteredProjects = [];
        state.totalProjects = 0;
      })
      .addCase(fetchMisProyectos.pending, (state) => {
        state.loadingProyectosPorRol = true;
        state.errorProyectosPorRol = null;
      })
      .addCase(fetchMisProyectos.fulfilled, (state, action) => {
        state.loadingProyectosPorRol = false;
        state.proyectosPorRol = action.payload;
      })
      .addCase(fetchMisProyectos.rejected, (state, action) => {
        state.loadingProyectosPorRol = false;
        state.errorProyectosPorRol = action.payload;
        state.proyectosPorRol = [];
      })
      .addCase(fetchProyectosPorFacultad.pending, (state) => {
        state.loadingProyectosPorRol = true;
        state.errorProyectosPorRol = null;
      })
      .addCase(fetchProyectosPorFacultad.fulfilled, (state, action) => {
        state.loadingProyectosPorRol = false;
        state.proyectosPorRol = action.payload;
      })
      .addCase(fetchProyectosPorFacultad.rejected, (state, action) => {
        state.loadingProyectosPorRol = false;
        state.errorProyectosPorRol = action.payload;
        state.proyectosPorRol = [];
      })
      .addCase(fetchProyectosPorGrupo.pending, (state) => {
        state.loadingProyectosPorRol = true;
        state.errorProyectosPorRol = null;
      })
      .addCase(fetchProyectosPorGrupo.fulfilled, (state, action) => {
        state.loadingProyectosPorRol = false;
        state.proyectosPorRol = action.payload;
      })
      .addCase(fetchProyectosPorGrupo.rejected, (state, action) => {
        state.loadingProyectosPorRol = false;
        state.errorProyectosPorRol = action.payload;
        state.proyectosPorRol = [];
      })
      .addCase(crearProyectoExterno.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearProyectoExterno.fulfilled, (state, action) => {
        state.loading = false;
        state.proyectoActual = action.payload;
      })
      .addCase(crearProyectoExterno.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.proyectoActual = action.payload;
      })
      .addCase(fetchProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProjectDates.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProjectDates.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateProjectDates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editarFechaCierre.pending, (state) => {
        state.loading = true;
      })
      .addCase(editarFechaCierre.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(editarFechaCierre.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadProjectToGruplac.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadProjectToGruplac.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadProjectToGruplac.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cambiarEstadoAprobado.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cambiarEstadoAprobado.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(cambiarEstadoAprobado.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registrarActaCierre.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registrarActaCierre.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registrarActaCierre.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProyectosPorEstadoAprobado.pending, (state) => {
        state.loadingPorEstadoAprobado = true;
        state.errorPorEstadoAprobado = null;
      })
      .addCase(fetchProyectosPorEstadoAprobado.fulfilled, (state, action) => {
        state.loadingPorEstadoAprobado = false;
        state.proyectosPorEstadoAprobado = action.payload;
      })
      .addCase(fetchProyectosPorEstadoAprobado.rejected, (state, action) => {
        state.loadingPorEstadoAprobado = false;
        state.errorPorEstadoAprobado = action.payload;
      })
      .addCase(fetchOpcionesFiltroProyectos.pending, (state) => {
        state.loadingOpcionesFiltro = true;
        state.errorOpcionesFiltro = null;
      })
      .addCase(fetchOpcionesFiltroProyectos.fulfilled, (state, action) => {
        state.loadingOpcionesFiltro = false;
        state.opcionesFiltro = action.payload;
      })
      .addCase(fetchOpcionesFiltroProyectos.rejected, (state, action) => {
        state.loadingOpcionesFiltro = false;
        state.errorOpcionesFiltro = action.payload;
      });
  },
});

export default proyectosSlice.reducer;