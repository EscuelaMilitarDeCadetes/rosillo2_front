// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';


export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password, sistema = 'formal' }, { rejectWithValue }) => {
    try {
      const endpoint = sistema === 'formativa'
        ? 'usuarios/login/formativa/'
        : 'usuarios/login/formal/';

      const { data: authData } = await axiosInstance.post(endpoint, {
        username,
        password,
      });
      localStorage.setItem('accessToken', authData.access);
      localStorage.setItem('refreshToken', authData.refresh);
      localStorage.setItem('sistemaActivo', sistema);
      const { data: profile } = await axiosInstance.get('usuarios/me/');
      return {
        user: profile,
        access: authData.access,
        refresh: authData.refresh,
        roles: profile.roles,
        facultadId: profile.facultad_id,
        grupoId: profile.grupo_id,
        personaId: profile.persona_id,   
        debeCambiarPassword: authData.debe_cambiar_password,
        sistema,
      };
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.error || 'Credenciales inválidas');
      }
      return rejectWithValue(error.message);
    }
  }
);

// --- RESTAURAR SESIÓN AL RECARGAR LA PÁGINA ---
// NOTA (fix 403 tras F5): isAuthenticated se restaura sincrónicamente desde
// localStorage en el estado inicial, pero `roles` NO — depende de este thunk
// asíncrono. Si PrivateRoute evalúa allowedRoles antes de que este thunk
// resuelva, ve roles=[] y expulsa al usuario a /forbidden aunque sí tenga el
// rol correcto. `sessionChecked` existe para que PrivateRoute pueda esperar
// (mostrando un loader) en vez de redirigir prematuramente.
export const loadSession = createAsyncThunk(
  'auth/loadSession',
  async (_, { rejectWithValue }) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return rejectWithValue('Sin sesión activa');
    }
    try {
      const { data: profile } = await axiosInstance.get('usuarios/me/');
      return {
        user: profile,
        access: accessToken,
        refresh: localStorage.getItem('refreshToken'),
        roles: profile.roles,
        facultadId: profile.facultad_id,
        grupoId: profile.grupo_id,
        personaId: profile.persona_id,
        debeCambiarPassword: profile.debe_cambiar_password,
        sistema: localStorage.getItem('sistemaActivo') || 'formal',
      };
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sistemaActivo');
      return rejectWithValue('Sesión inválida o expirada');
    }
  }
);

// --- LOGOUT ---
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await axiosInstance.post('usuarios/logout/', { refresh: refreshToken });
      }
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sistemaActivo');
    }
  }
);

// --- CAMBIAR CONTRASEÑA (usuario autenticado, con o sin debe_cambiar_password) ---
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ old_password, new_password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('usuarios/password/change-password/', {
        old_password,
        new_password,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

const initialState = {
  user: null,
  roles: [],
  facultadId: null,
  grupoId: null,
  personaId: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  debeCambiarPassword: false,
  sistemaActivo: localStorage.getItem('sistemaActivo') || null,
  loading: false,
  error: null,
  // true una vez que loadSession (o loginUser) resolvió al menos una vez.
  // Mientras sea false con isAuthenticated=true, PrivateRoute no debe decidir
  // aún si el usuario tiene o no los allowedRoles de la ruta.
  sessionChecked: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthData: (state) => {
      state.user = null;
      state.roles = [];
      state.facultadId = null;
      state.grupoId = null;
      state.personaId = null;
      state.isAuthenticated = false;
      state.debeCambiarPassword = false;
      state.sistemaActivo = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sistemaActivo');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.roles = action.payload.roles;
        state.facultadId = action.payload.facultadId;
        state.grupoId = action.payload.grupoId;
        state.personaId = action.payload.personaId;
        state.debeCambiarPassword = action.payload.debeCambiarPassword;
        state.sistemaActivo = action.payload.sistema;
        state.error = null;
        state.sessionChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.error = action.payload || 'Fallo en el inicio de sesión';
        state.sessionChecked = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.debeCambiarPassword = false;
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.roles = action.payload.roles;
        state.facultadId = action.payload.facultadId;
        state.grupoId = action.payload.grupoId;
        state.personaId = action.payload.personaId;
        state.debeCambiarPassword = action.payload.debeCambiarPassword;
        state.sistemaActivo = action.payload.sistema;
        state.sessionChecked = true;
      })
      .addCase(loadSession.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.facultadId = null;
        state.grupoId = null;
        state.personaId = null;
        state.sistemaActivo = null;
        state.sessionChecked = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.debeCambiarPassword = false;
        state.sistemaActivo = null;
        state.error = null;
        state.sessionChecked = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.facultadId = null;
        state.grupoId = null;
        state.personaId = null;
        state.sessionChecked = true;
      });
  },
});

export const { clearAuthData } = authSlice.actions;
export default authSlice.reducer;