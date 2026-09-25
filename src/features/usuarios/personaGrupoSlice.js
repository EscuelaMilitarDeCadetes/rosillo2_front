// src/features/usuarios/personaGrupoSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Thunk para obtener las personas en grupos/facultades
export const fetchGroupUsers = createAsyncThunk(
  "personaGrupo/fetchGroupUsers",
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("institucional/persona-grupo/", {
        params: { page, page_size: pageSize },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// Thunk para asignar una persona a un grupo/facultad como investigador
export const assignResearcher = createAsyncThunk(
  "personaGrupo/assignResearcher",
  async (assignmentData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "institucional/persona-grupo/",
        assignmentData,
      );
      dispatch(fetchGroupUsers());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      let mensaje = "Error al asignar el investigador.";
      if (typeof data === "string") mensaje = data;
      else if (Array.isArray(data)) mensaje = data.join(" ");
      else if (data && typeof data === "object") {
        mensaje = data.error || Object.values(data).flat().join(" ") || mensaje;
      }
      return rejectWithValue(mensaje);
    }
  },
);

// Thunk para desvincular una persona de su grupo/facultad
export const borrarPersonaDeGrupo = createAsyncThunk(
  "personaGrupo/borrarPersonaDeGrupo",
  async (personaXGrupoId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(
        `institucional/persona-grupo/${personaXGrupoId}/`,
      );
      return { personaXGrupoId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al borrar del grupo.",
      );
    }
  },
);

/// Thunk para reactivar una vinculación previamente desvinculada
export const reactivarPersonaDeGrupo = createAsyncThunk(
  "personaGrupo/reactivarPersonaDeGrupo",
  async (personaXGrupoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `institucional/persona-grupo/${personaXGrupoId}/reactivar/`,
      );
      return { personaXGrupoId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al reactivar.",
      );
    }
  },
);

// Thunk para obtener el historial completo
export const fetchHistorialPersona = createAsyncThunk(
  "personaGrupo/fetchHistorialPersona",
  async (personaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `institucional/persona-grupo/persona/${personaId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Error al cargar el historial de la persona.");
    }
  },
);

const personaGrupoSlice = createSlice({
  name: "personaGrupo",
  initialState: {
    groupUsers: [],
    groupUsersTotal: 0,
    historialPersona: [],
    historialPersonaLoading: false,
    // Claves: personaXGrupoId (independiente del rowLoading de usuarioLifecycleSlice)
    rowLoading: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroupUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.groupUsers = action.payload.results ?? [];
        state.groupUsersTotal = action.payload.count ?? 0;
      })
      .addCase(fetchGroupUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(assignResearcher.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignResearcher.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(assignResearcher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(borrarPersonaDeGrupo.pending, (state, action) => {
        state.rowLoading[action.meta.arg] = true;
      })
      .addCase(borrarPersonaDeGrupo.fulfilled, (state, action) => {
        state.rowLoading[action.payload.personaXGrupoId] = false;
      })
      .addCase(borrarPersonaDeGrupo.rejected, (state, action) => {
        state.rowLoading[action.meta.arg] = false;
        state.error = action.payload;
      })
      .addCase(reactivarPersonaDeGrupo.pending, (state, action) => {
        state.rowLoading[action.meta.arg] = true;
      })
      .addCase(reactivarPersonaDeGrupo.fulfilled, (state, action) => {
        state.rowLoading[action.payload.personaXGrupoId] = false;
      })
      .addCase(reactivarPersonaDeGrupo.rejected, (state, action) => {
        state.rowLoading[action.meta.arg] = false;
        state.error = action.payload;
      })
      .addCase(fetchHistorialPersona.pending, (state) => {
        state.historialPersonaLoading = true;
      })
      .addCase(fetchHistorialPersona.fulfilled, (state, action) => {
        state.historialPersonaLoading = false;
        state.historialPersona = action.payload;
      })
      .addCase(fetchHistorialPersona.rejected, (state, action) => {
        state.historialPersonaLoading = false;
        state.error = action.payload;
      });
  },
});

export default personaGrupoSlice.reducer;