// src/features/usuarios/usuarioLifecycleSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { fetchPlatformUsers } from "./rolesUsuarioSlice";
import { fetchGroupUsers } from "./personaGrupoSlice";

// Thunk para crear un nuevo usuario
export const createUser = createAsyncThunk(
  "usuarioLifecycle/createUser",
  async ({ endpoint, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `integracion/${endpoint}/`,
        payload,
      );
      dispatch(fetchPlatformUsers());
      dispatch(fetchGroupUsers());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : data?.error ||
            (data && Object.values(data).flat().join(" ")) ||
            "Error al crear el usuario.";
      return rejectWithValue(mensaje);
    }
  },
);

// Thunk para reemplazar la Persona vinculada a un Usuario existente
export const reemplazarUsuario = createAsyncThunk(
  "usuarioLifecycle/reemplazarUsuario",
  async ({ usuario_id, ...datosPersona }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("integracion/reemplazar/", {
        usuario_id,
        ...datosPersona,
      });
      dispatch(fetchPlatformUsers());
      dispatch(fetchGroupUsers());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : data?.error ||
            (data && Object.values(data).flat().join(" ")) ||
            "Error al reemplazar el usuario.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para retirar un usuario completo
export const retirarUsuario = createAsyncThunk(
  "usuarioLifecycle/retirarUsuario",
  async ({ usuario_id, fecha_retiro }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("integracion/retirar/", {
        usuario_id,
        ...(fecha_retiro ? { fecha_retiro } : {}),
      });
      dispatch(fetchPlatformUsers());
      dispatch(fetchGroupUsers());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : data?.error || "Error al retirar el usuario.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para asignar un rol de plataforma a un usuario existente.
// Si el rol requiere vínculo institucional (facultad o grupo), el backend
// crea/actualiza el PersonaXGrupo correspondiente en la misma operación
// (integracion/asignar-rol-existente/).
export const asignarRolExistente = createAsyncThunk(
  "usuarioLifecycle/asignarRolExistente",
  async ({ usuario_id, rol_plataforma_id, facultad_id, grupo_id, rol_grupo_id }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("integracion/asignar-rol-existente/", {
        usuario_id,
        rol_plataforma_id,
        ...(facultad_id ? { facultad_id } : {}),
        ...(grupo_id ? { grupo_id } : {}),
        ...(rol_grupo_id ? { rol_grupo_id } : {}),
      });
      dispatch(fetchPlatformUsers());
      dispatch(fetchGroupUsers());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : data?.error ||
            (data && Object.values(data).flat().join(" ")) ||
            "Error al asignar el rol.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para activar o desactivar un usuario
export const toggleUserStatus = createAsyncThunk(
  "usuarioLifecycle/toggleUserStatus",
  async ({ userId, activar }, { rejectWithValue }) => {
    try {
      const accion = activar ? "activar" : "desactivar";
      const response = await axiosInstance.post(
        `usuarios/${userId}/${accion}/`,
      );
      return { userId, activar, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          "Error al cambiar el estado del usuario.",
      );
    }
  },
);

const usuarioLifecycleSlice = createSlice({
  name: "usuarioLifecycle",
  initialState: {
    loading: false,
    error: null,
    // Claves: userId (independiente del rowLoading de personaGrupoSlice)
    rowLoading: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(reemplazarUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reemplazarUsuario.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(reemplazarUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(retirarUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retirarUsuario.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(retirarUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(asignarRolExistente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(asignarRolExistente.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(asignarRolExistente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleUserStatus.pending, (state, action) => {
        state.rowLoading[action.meta.arg.userId] = true;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.rowLoading[userId] = false;
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.rowLoading[action.meta.arg.userId] = false;
        state.error = action.payload;
      });
  },
});

export default usuarioLifecycleSlice.reducer;