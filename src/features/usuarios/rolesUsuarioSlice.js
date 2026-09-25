// src/features/usuarios/rolesUsuarioSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { fetchMetadata } from "../metadata/metadataSlice";

// Thunk para obtener los usuarios con roles de plataforma
export const fetchPlatformUsers = createAsyncThunk(
  "rolesUsuario/fetchPlatformUsers",
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("usuarios/roles-usuario/", {
        params: { page, page_size: pageSize },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// Thunk para agregar un nuevo rol de plataforma a un usuario
export const addRoleToUser = createAsyncThunk(
  "rolesUsuario/addRoleToUser",
  async ({ usuario_id, rol_id }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "usuarios/roles-usuario/agregar-rol/",
        { usuario_id, rol_id },
      );
      dispatch(fetchPlatformUsers());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al agregar el rol.",
      );
    }
  },
);

// Thunk para editar un rol de plataforma existente
export const updateRole = createAsyncThunk(
  "rolesUsuario/updateRole",
  async ({ id, ...cambios }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `usuarios/roles/${id}/`,
        cambios,
      );
      dispatch(fetchMetadata());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al editar el rol.";
      return rejectWithValue(mensaje);
    }
  },
);

// Thunk para obtener los roles de un usuario específico
export const fetchRolesForUser = createAsyncThunk(
  "rolesUsuario/fetchRolesForUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `usuarios/roles-usuario/ver-roles/${userId}/`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Error al cargar los roles del usuario.");
    }
  },
);

// Thunk para borrar un rol de un usuario
export const deleteRoleFromUser = createAsyncThunk(
  "rolesUsuario/deleteRoleFromUser",
  async ({ usuario_id, rol_id }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post("usuarios/roles-usuario/borrar-rol/", {
        usuario_id,
        rol_id,
      });
      dispatch(fetchPlatformUsers());
      return { usuario_id, rol_id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al borrar el rol.",
      );
    }
  },
);

export const buscarRolXUsuario = createAsyncThunk(
  "rolesUsuario/buscarRolXUsuario",
  async ({ usuario_id, rol_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("usuarios/roles-usuario/buscar/", {
        params: { usuario_id, rol_id },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al buscar la asignación de rol.");
    }
  }
);

export const fetchHistoricoRoles = createAsyncThunk(
  "rolesUsuario/fetchHistoricoRoles",
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`usuarios/roles-usuario/historico/${usuarioId}/`);
      return { usuarioId, historico: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar el histórico de roles.");
    }
  }
);

const rolesUsuarioSlice = createSlice({
  name: "rolesUsuario",
  initialState: {
    platformUsers: [],
    platformUsersTotal: 0,
    userRoles: [],
    resultadosBusquedaRol: [],
    buscandoRol: false,
    historicoRolesLoading: false,
    historicoRolesPorUsuario: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatformUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.platformUsers = action.payload.results ?? [];
        state.platformUsersTotal = action.payload.count ?? 0;
      })
      .addCase(fetchPlatformUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addRoleToUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(addRoleToUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addRoleToUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRolesForUser.pending, (state) => {
        state.loading = true;
        state.userRoles = [];
      })
      .addCase(fetchRolesForUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userRoles = action.payload;
      })
      .addCase(fetchRolesForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteRoleFromUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRoleFromUser.fulfilled, (state) => {
        state.loading = false;
        state.userRoles = [];
      })
      .addCase(deleteRoleFromUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(buscarRolXUsuario.pending, (state) => {
        state.buscandoRol = true;
        state.error = null;
      })
      .addCase(buscarRolXUsuario.fulfilled, (state, action) => {
        state.buscandoRol = false;
        state.resultadosBusquedaRol = action.payload;
      })
      .addCase(buscarRolXUsuario.rejected, (state, action) => {
        state.buscandoRol = false;
        state.error = action.payload;
      })
      .addCase(fetchHistoricoRoles.pending, (state) => {
        state.historicoRolesLoading = true;
      })
      .addCase(fetchHistoricoRoles.fulfilled, (state, action) => {
        state.historicoRolesLoading = false;
        state.historicoRolesPorUsuario = state.historicoRolesPorUsuario || {};
        state.historicoRolesPorUsuario[action.payload.usuarioId] = action.payload.historico;
      })
      .addCase(fetchHistoricoRoles.rejected, (state, action) => {
        state.historicoRolesLoading = false;
        state.error = action.payload;
      });
  },
});

export default rolesUsuarioSlice.reducer;