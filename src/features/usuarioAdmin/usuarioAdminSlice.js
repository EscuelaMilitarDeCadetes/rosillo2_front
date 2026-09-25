// src/features/usuarioAdmin/usuarioAdminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'usuarios/usuarios/';

export const fetchUsuarios = createAsyncThunk(
  'usuarioAdmin/fetchUsuarios',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar los usuarios.');
    }
  }
);

export const fetchUsuario = createAsyncThunk(
  'usuarioAdmin/fetchUsuario',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Usuario no encontrado.');
    }
  }
);

export const fetchUsuariosInactivos = createAsyncThunk(
  'usuarioAdmin/fetchUsuariosInactivos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}inactivos/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar los usuarios inactivos.');
    }
  }
);

export const fetchAdminDashboard = createAsyncThunk(
  'usuarioAdmin/fetchAdminDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}admin-dashboard/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar el dashboard de administración.');
    }
  }
);

export const fetchRolesActivosUsuario = createAsyncThunk(
  'usuarioAdmin/fetchRolesActivosUsuario',
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}${usuarioId}/roles-activos/`);
      return { usuarioId, roles: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar los roles activos.');
    }
  }
);

export const desactivarUsuario = createAsyncThunk(
  'usuarioAdmin/desactivarUsuario',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/desactivar/`);
      dispatch(fetchUsuariosCreadosPorMi());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al desactivar el usuario.');
    }
  }
);

export const activarUsuario = createAsyncThunk(
  'usuarioAdmin/activarUsuario',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/activar/`);
      dispatch(fetchUsuariosCreadosPorMi());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al activar el usuario.');
    }
  }
);

export const fetchUsuariosCreadosPorMi = createAsyncThunk(
  'usuarioAdmin/fetchUsuariosCreadosPorMi',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}creados-por-mi/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar tus usuarios creados.');
    }
  }
);

export const buscarUsuarios = createAsyncThunk(
  'usuarioAdmin/buscarUsuarios',
  async ({ q = '', page = 1, pageSize = 15 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}buscar/`, {
        params: { q, page, page_size: pageSize },
      });
      return response.data; // paginado: { count, results, ... }
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al buscar usuarios.');
    }
  }
);

const usuarioAdminSlice = createSlice({
  name: 'usuarioAdmin',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    seleccionado: null,
    seleccionadoLoading: false,
    inactivos: [],
    inactivosLoading: false,
    dashboard: null,
    dashboardLoading: false,
    rolesActivosPorUsuario: {},
    rolesActivosLoading: false,
    creadosPorMi: [], 
    creadosPorMiLoading: false, 
    transicionandoId: null,
    error: null,
  },
  reducers: {
    limpiarErrorUsuarioAdmin: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsuarios.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsuario.pending, (state) => {
        state.seleccionadoLoading = true;
      })
      .addCase(fetchUsuario.fulfilled, (state, action) => {
        state.seleccionadoLoading = false;
        state.seleccionado = action.payload;
      })
      .addCase(fetchUsuario.rejected, (state, action) => {
        state.seleccionadoLoading = false;
        state.error = action.payload;
      })
            .addCase(fetchUsuariosCreadosPorMi.pending, (state) => {
        state.creadosPorMiLoading = true;
      })
      .addCase(fetchUsuariosCreadosPorMi.fulfilled, (state, action) => {
        state.creadosPorMiLoading = false;
        state.creadosPorMi = action.payload ?? [];
      })
      .addCase(fetchUsuariosCreadosPorMi.rejected, (state, action) => {
        state.creadosPorMiLoading = false;
        state.error = action.payload;
      })
      .addCase(desactivarUsuario.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
      })
      .addCase(desactivarUsuario.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(desactivarUsuario.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(activarUsuario.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
      })
      .addCase(activarUsuario.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(activarUsuario.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(fetchUsuariosInactivos.pending, (state) => {
        state.inactivosLoading = true;
      })
      .addCase(fetchUsuariosInactivos.fulfilled, (state, action) => {
        state.inactivosLoading = false;
        state.inactivos = action.payload ?? [];
      })
      .addCase(fetchUsuariosInactivos.rejected, (state, action) => {
        state.inactivosLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.dashboardLoading = true;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRolesActivosUsuario.pending, (state) => {
        state.rolesActivosLoading = true;
      })
      .addCase(fetchRolesActivosUsuario.fulfilled, (state, action) => {
        state.rolesActivosLoading = false;
        state.rolesActivosPorUsuario[action.payload.usuarioId] = action.payload.roles;
      })
      .addCase(fetchRolesActivosUsuario.rejected, (state, action) => {
        state.rolesActivosLoading = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorUsuarioAdmin } = usuarioAdminSlice.actions;
export default usuarioAdminSlice.reducer;