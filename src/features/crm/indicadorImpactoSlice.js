// src/features/crm/indicadorImpactoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'crm/indicador-impacto/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchIndicadores = createAsyncThunk(
  'indicadorImpacto/fetchIndicadores',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los indicadores de impacto.'));
    }
  }
);

// apps/crm/urls.py -> por-proyecto/(?P<proyecto_id>...) es path param, no paginado.
export const fetchIndicadoresPorProyecto = createAsyncThunk(
  'indicadorImpacto/fetchIndicadoresPorProyecto',
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proyecto/${proyectoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por proyecto.'));
    }
  }
);

// Opciones para el <Dropdown> de proyecto en el formulario y el filtro de la
// tabla. Mismo endpoint y misma limitación de ámbito ('formal' en el JWT)
// que ya se documentó en interaccionSlice.js — aquí `proyecto` sí es
// obligatorio (a diferencia de Interaccion.proyecto_asociado).
export const fetchProyectosOpciones = createAsyncThunk(
  'indicadorImpacto/fetchProyectosOpciones',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('investigacion-formal/proyectos/', {
        params: { page_size: 100 },
      });
      return response.data.results ?? [];
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los proyectos.'));
    }
  }
);

export const crearIndicador = createAsyncThunk(
  'indicadorImpacto/crearIndicador',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchIndicadores());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar el indicador de impacto.'));
    }
  }
);

export const actualizarIndicador = createAsyncThunk(
  'indicadorImpacto/actualizarIndicador',
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/`, payload);
      dispatch(fetchIndicadores());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar el indicador de impacto.'));
    }
  }
);

// Atajo de negocio: solo actualiza el avance (valor_real), sin tocar la
// meta ni el proyecto/KPI. apps/crm/services/indicador_impacto_service.py
// -> actualizar_valor_real().
export const actualizarValorReal = createAsyncThunk(
  'indicadorImpacto/actualizarValorReal',
  async ({ id, valor_real }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/actualizar-valor-real/`, { valor_real });
      dispatch(fetchIndicadores());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar el avance del indicador.'));
    }
  }
);

export const eliminarIndicador = createAsyncThunk(
  'indicadorImpacto/eliminarIndicador',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchIndicadores());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al eliminar el indicador de impacto.'));
    }
  }
);

const indicadorImpactoSlice = createSlice({
  name: 'indicadorImpacto',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    actualizandoAvanceId: null,
    deletingId: null,
    error: null,
    // null = sin filtro (lista paginada normal); id de proyecto = filtrado
    proyectoFiltro: null,
    proyectosOpciones: [],
    proyectosOpcionesLoading: false,
  },
  reducers: {
    limpiarErrorIndicador: (state) => {
      state.error = null;
    },
    establecerFiltroProyecto: (state, action) => {
      state.proyectoFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIndicadores.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIndicadores.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchIndicadores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchIndicadoresPorProyecto.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIndicadoresPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchIndicadoresPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProyectosOpciones.pending, (state) => {
        state.proyectosOpcionesLoading = true;
      })
      .addCase(fetchProyectosOpciones.fulfilled, (state, action) => {
        state.proyectosOpcionesLoading = false;
        state.proyectosOpciones = action.payload;
      })
      .addCase(fetchProyectosOpciones.rejected, (state) => {
        state.proyectosOpcionesLoading = false;
      })
      .addCase(crearIndicador.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearIndicador.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearIndicador.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarIndicador.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarIndicador.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarIndicador.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarValorReal.pending, (state, action) => {
        state.actualizandoAvanceId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(actualizarValorReal.fulfilled, (state) => {
        state.actualizandoAvanceId = null;
      })
      .addCase(actualizarValorReal.rejected, (state, action) => {
        state.actualizandoAvanceId = null;
        state.error = action.payload;
      })
      .addCase(eliminarIndicador.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarIndicador.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarIndicador.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorIndicador, establecerFiltroProyecto } = indicadorImpactoSlice.actions;
export default indicadorImpactoSlice.reducer;