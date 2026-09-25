// src/features/personaXGrupo/personaXGrupoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'institucional/persona-grupo/';

export const trasladarGrupo = createAsyncThunk(
  'personaXGrupo/trasladarGrupo',
  async ({ id, nuevo_grupo_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/trasladar-grupo/`, { nuevo_grupo_id });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al trasladar de grupo.');
    }
  }
);

export const trasladarFacultad = createAsyncThunk(
  'personaXGrupo/trasladarFacultad',
  async ({ id, nueva_facultad_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/trasladar-facultad/`, { nueva_facultad_id });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al trasladar de facultad.');
    }
  }
);

export const cambiarRolGrupo = createAsyncThunk(
  'personaXGrupo/cambiarRolGrupo',
  async ({ id, nuevo_rol_grupo_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/cambiar-rol/`, { nuevo_rol_grupo_id });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al cambiar el rol.');
    }
  }
);

export const fetchConGrupo = createAsyncThunk(
  'personaXGrupo/fetchConGrupo',
  async ({ excluirRolGrupoId } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (excluirRolGrupoId) params.excluir_rol_grupo_id = excluirRolGrupoId;
      const response = await axiosInstance.get(`${BASE}con-grupo/`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar los vínculos con grupo.');
    }
  }
);

export const fetchPorPersona = createAsyncThunk(
  'personaXGrupo/fetchPorPersona',
  async ({ personaId, soloActivos = true }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-persona/${personaId}/`, {
        params: { solo_activos: soloActivos },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar los vínculos de la persona.');
    }
  }
);

export const fetchActivasPersona = createAsyncThunk(
  'personaXGrupo/fetchActivasPersona',
  async (personaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}persona/${personaId}/activas/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar las vinculaciones activas.');
    }
  }
);

export const fetchFacultadActivaPersona = createAsyncThunk(
  'personaXGrupo/fetchFacultadActivaPersona',
  async (personaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}persona/${personaId}/facultad/`);
      return response.status === 204 ? null : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al consultar la facultad activa.');
    }
  }
);

export const fetchGrupoActivoPersona = createAsyncThunk(
  'personaXGrupo/fetchGrupoActivoPersona',
  async (personaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}persona/${personaId}/grupo/`);
      return response.status === 204 ? null : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al consultar el grupo activo.');
    }
  }
);

export const fetchTipoPersona = createAsyncThunk(
  'personaXGrupo/fetchTipoPersona',
  async (personaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}persona/${personaId}/tipo/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al consultar el tipo de persona.');
    }
  }
);

/**
 * Thunk compuesto: trae de una sola vez todo lo necesario para pintar el
 * panel "Perfil institucional" de una persona (tipo, facultad activa,
 * grupo activo, vinculaciones activas y el histórico por-persona). Evita
 * 5 despachos manuales sueltos desde el componente.
 */
export const fetchPerfilInstitucionalPersona = createAsyncThunk(
  'personaXGrupo/fetchPerfilInstitucionalPersona',
  async (personaId, { dispatch, rejectWithValue }) => {
    try {
      const [tipo, facultad, grupo, activas, porPersona] = await Promise.all([
        dispatch(fetchTipoPersona(personaId)).unwrap(),
        dispatch(fetchFacultadActivaPersona(personaId)).unwrap(),
        dispatch(fetchGrupoActivoPersona(personaId)).unwrap(),
        dispatch(fetchActivasPersona(personaId)).unwrap(),
        dispatch(fetchPorPersona({ personaId, soloActivos: false })).unwrap(),
      ]);
      return { personaId, tipo, facultad, grupo, activas, porPersona };
    } catch (error) {
      return rejectWithValue(typeof error === 'string' ? error : 'Error al cargar el perfil institucional.');
    }
  }
);

const personaXGrupoSlice = createSlice({
  name: 'personaXGrupo',
  initialState: {
    conGrupo: [],
    conGrupoLoading: false,
    porPersona: [],
    porPersonaLoading: false,
    activas: [],
    facultadActiva: null,
    grupoActivo: null,
    tipo: null,
    perfilLoading: false,
    saving: false,
    error: null,
  },
  reducers: {
    limpiarErrorPersonaXGrupo: (state) => {
      state.error = null;
    },
    limpiarPerfilPersona: (state) => {
      state.activas = [];
      state.facultadActiva = null;
      state.grupoActivo = null;
      state.tipo = null;
      state.porPersona = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(trasladarGrupo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(trasladarGrupo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(trasladarGrupo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(trasladarFacultad.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(trasladarFacultad.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(trasladarFacultad.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(cambiarRolGrupo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(cambiarRolGrupo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(cambiarRolGrupo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(fetchConGrupo.pending, (state) => {
        state.conGrupoLoading = true;
      })
      .addCase(fetchConGrupo.fulfilled, (state, action) => {
        state.conGrupoLoading = false;
        state.conGrupo = action.payload;
      })
      .addCase(fetchConGrupo.rejected, (state, action) => {
        state.conGrupoLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPorPersona.pending, (state) => {
        state.porPersonaLoading = true;
      })
      .addCase(fetchPorPersona.fulfilled, (state, action) => {
        state.porPersonaLoading = false;
        state.porPersona = action.payload;
      })
      .addCase(fetchPorPersona.rejected, (state, action) => {
        state.porPersonaLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchActivasPersona.fulfilled, (state, action) => {
        state.activas = action.payload;
      })
      .addCase(fetchFacultadActivaPersona.fulfilled, (state, action) => {
        state.facultadActiva = action.payload;
      })
      .addCase(fetchGrupoActivoPersona.fulfilled, (state, action) => {
        state.grupoActivo = action.payload;
      })
      .addCase(fetchTipoPersona.fulfilled, (state, action) => {
        state.tipo = action.payload?.tipo ?? null;
      })
      .addCase(fetchPerfilInstitucionalPersona.pending, (state) => {
        state.perfilLoading = true;
        state.error = null;
      })
      .addCase(fetchPerfilInstitucionalPersona.fulfilled, (state, action) => {
        state.perfilLoading = false;
        state.tipo = action.payload.tipo?.tipo ?? null;
        state.facultadActiva = action.payload.facultad;
        state.grupoActivo = action.payload.grupo;
        state.activas = action.payload.activas;
        state.porPersona = action.payload.porPersona;
      })
      .addCase(fetchPerfilInstitucionalPersona.rejected, (state, action) => {
        state.perfilLoading = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorPersonaXGrupo, limpiarPerfilPersona } = personaXGrupoSlice.actions;
export default personaXGrupoSlice.reducer;