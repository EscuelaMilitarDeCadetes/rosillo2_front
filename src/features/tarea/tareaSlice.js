// src/features/tarea/tareaSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const BASE = "common/tarea/";

// --- Listado general y CRUD -----------------------------------------------

export const fetchTareas = createAsyncThunk(
  "tarea/fetchTareas",
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data; // { count, results }
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las tareas.");
    }
  }
);

// El backend resuelve el objeto relacionado a partir de
// content_type_app_label + content_type_model + object_id (igual patrón
// que documento-firma). "objeto" puede ser cualquier modelo: Proyecto,
// Tesis, DocumentoFirma, etc.
export const crearTarea = createAsyncThunk(
  "tarea/crearTarea",
  async ({ descripcion, fechaLimite, contentTypeAppLabel, contentTypeModel, objectId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(BASE, {
      descripcion,
      fecha_limite: fechaLimite || undefined,
      content_type_app_label: contentTypeAppLabel,
      content_type_model: contentTypeModel,
      object_id: objectId,
    });
    return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string" ? data : (data && Object.values(data).flat().join(" ")) || "Error al crear la tarea.";
      return rejectWithValue(mensaje);
    }
  }
);

export const eliminarTarea = createAsyncThunk(
  "tarea/eliminarTarea",
  async (tareaId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${tareaId}/`);
      return tareaId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al eliminar la tarea.");
    }
  }
);

export const reasignarTarea = createAsyncThunk(
  "tarea/reasignarTarea",
  async ({ tareaId, nuevoAsignadoId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${tareaId}/reasignar/`, {
        asignado_a: nuevoAsignadoId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al reasignar la tarea.");
    }
  }
);

// Permitido tanto al asignado de la tarea como a Decano/Supervisor
// (el backend valida ambos casos; aquí solo se dispara la acción).
export const completarTarea = createAsyncThunk(
  "tarea/completarTarea",
  async (tareaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${tareaId}/completar/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue("Solo el usuario asignado o un Decano/Supervisor pueden completar esta tarea.");
      }
      return rejectWithValue(error.response?.data?.detail || "Error al completar la tarea.");
    }
  }
);

// --- Consultas específicas -------------------------------------------------

export const fetchTareasPorUsuario = createAsyncThunk(
  "tarea/fetchPorUsuario",
  async ({ usuarioId, soloPendientes = false }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-usuario/${usuarioId}/`, {
        params: { solo_pendientes: soloPendientes },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue("No tiene permiso para consultar las tareas de este usuario.");
      }
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las tareas del usuario.");
    }
  }
);

export const fetchTareasPorObjeto = createAsyncThunk(
  "tarea/fetchPorObjeto",
  async ({ contentTypeAppLabel, contentTypeModel, objectId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-objeto/`, {
        params: {
          content_type_app_label: contentTypeAppLabel,
          content_type_model: contentTypeModel,
          object_id: objectId,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las tareas del objeto.");
    }
  }
);

export const fetchTareasVencidas = createAsyncThunk(
  "tarea/fetchVencidas",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}vencidas/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las tareas vencidas.");
    }
  }
);

export const fetchTareasProximasAVencer = createAsyncThunk(
  "tarea/fetchProximasAVencer",
  async (dias = 3, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}proximas-a-vencer/`, { params: { dias } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las tareas próximas a vencer.");
    }
  }
);

// --- Slice ------------------------------------------------------------------

const actualizarEnTodasLasListas = (state, tareaActualizada) => {
  const reemplazar = (lista) => lista.map((t) => (t.id === tareaActualizada.id ? tareaActualizada : t));
  state.items = reemplazar(state.items);
  state.porUsuario = reemplazar(state.porUsuario);
  state.porObjeto = reemplazar(state.porObjeto);
  state.vencidas = reemplazar(state.vencidas);
  state.proximasAVencer = reemplazar(state.proximasAVencer);
};

const quitarDeTodasLasListas = (state, tareaId) => {
  const quitar = (lista) => lista.filter((t) => t.id !== tareaId);
  state.items = quitar(state.items);
  state.porUsuario = quitar(state.porUsuario);
  state.porObjeto = quitar(state.porObjeto);
  state.vencidas = quitar(state.vencidas);
  state.proximasAVencer = quitar(state.proximasAVencer);
};

const tareaSlice = createSlice({
  name: "tarea",
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,

    porUsuario: [],
    loadingPorUsuario: false,
    errorPorUsuario: null,

    porObjeto: [],
    loadingPorObjeto: false,

    vencidas: [],
    loadingVencidas: false,

    proximasAVencer: [],
    loadingProximas: false,

    creando: false,
    crearError: null,

    actioningId: null,
    actionError: null,
  },
  reducers: {
    limpiarErrorTarea: (state) => {
      state.error = null;
      state.crearError = null;
      state.actionError = null;
      state.errorPorUsuario = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // listado general
      .addCase(fetchTareas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTareas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchTareas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // crear
      .addCase(crearTarea.pending, (state) => {
        state.creando = true;
        state.crearError = null;
      })
      .addCase(crearTarea.fulfilled, (state) => {
        state.creando = false;
      })
      .addCase(crearTarea.rejected, (state, action) => {
        state.creando = false;
        state.crearError = action.payload;
      })
      // eliminar
      .addCase(eliminarTarea.pending, (state, action) => {
        state.actioningId = action.meta.arg;
        state.actionError = null;
      })
      .addCase(eliminarTarea.fulfilled, (state, action) => {
        state.actioningId = null;
        quitarDeTodasLasListas(state, action.payload);
      })
      .addCase(eliminarTarea.rejected, (state, action) => {
        state.actioningId = null;
        state.actionError = action.payload;
      })
      // reasignar
      .addCase(reasignarTarea.pending, (state, action) => {
        state.actioningId = action.meta.arg.tareaId;
        state.actionError = null;
      })
      .addCase(reasignarTarea.fulfilled, (state, action) => {
        state.actioningId = null;
        actualizarEnTodasLasListas(state, action.payload);
      })
      .addCase(reasignarTarea.rejected, (state, action) => {
        state.actioningId = null;
        state.actionError = action.payload;
      })
      // completar
      .addCase(completarTarea.pending, (state, action) => {
        state.actioningId = action.meta.arg;
        state.actionError = null;
      })
      .addCase(completarTarea.fulfilled, (state, action) => {
        state.actioningId = null;
        actualizarEnTodasLasListas(state, action.payload);
      })
      .addCase(completarTarea.rejected, (state, action) => {
        state.actioningId = null;
        state.actionError = action.payload;
      })
      // por usuario
      .addCase(fetchTareasPorUsuario.pending, (state) => {
        state.loadingPorUsuario = true;
        state.errorPorUsuario = null;
      })
      .addCase(fetchTareasPorUsuario.fulfilled, (state, action) => {
        state.loadingPorUsuario = false;
        state.porUsuario = action.payload ?? [];
      })
      .addCase(fetchTareasPorUsuario.rejected, (state, action) => {
        state.loadingPorUsuario = false;
        state.errorPorUsuario = action.payload;
      })
      // por objeto
      .addCase(fetchTareasPorObjeto.pending, (state) => {
        state.loadingPorObjeto = true;
      })
      .addCase(fetchTareasPorObjeto.fulfilled, (state, action) => {
        state.loadingPorObjeto = false;
        state.porObjeto = action.payload ?? [];
      })
      .addCase(fetchTareasPorObjeto.rejected, (state, action) => {
        state.loadingPorObjeto = false;
        state.error = action.payload;
      })
      // vencidas
      .addCase(fetchTareasVencidas.pending, (state) => {
        state.loadingVencidas = true;
      })
      .addCase(fetchTareasVencidas.fulfilled, (state, action) => {
        state.loadingVencidas = false;
        state.vencidas = action.payload ?? [];
      })
      .addCase(fetchTareasVencidas.rejected, (state, action) => {
        state.loadingVencidas = false;
        state.error = action.payload;
      })
      // próximas a vencer
      .addCase(fetchTareasProximasAVencer.pending, (state) => {
        state.loadingProximas = true;
      })
      .addCase(fetchTareasProximasAVencer.fulfilled, (state, action) => {
        state.loadingProximas = false;
        state.proximasAVencer = action.payload ?? [];
      })
      .addCase(fetchTareasProximasAVencer.rejected, (state, action) => {
        state.loadingProximas = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorTarea } = tareaSlice.actions;
export default tareaSlice.reducer;