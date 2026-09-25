// src/features/notificaciones/notificacionesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchNotificacionesIniciales = createAsyncThunk(
  'notificaciones/fetchIniciales',
  async (usuarioId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`common/notificacion/por-usuario/${usuarioId}/`, {
        params: { solo_no_leidas: true },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk para marcar una notificación individual como leída
export const marcarLeida = createAsyncThunk(
  'notificaciones/marcarLeida',
  async (notificacionId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`common/notificacion/${notificacionId}/marcar-leida/`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const marcarTodasLeidas = createAsyncThunk(
  'notificaciones/marcarTodasLeidas',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post('common/notificacion/marcar-todas-leidas/');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Disparo manual y masivo de recordatorios de tareas (además de la corrida
// automática vía Celery beat que ya existe en el backend). Solo accesible a
// usuarios is_staff (permiso IsAdminUser en el backend), por eso el thunk se
// mantiene separado del resto del flujo de autoservicio de notificaciones.
export const enviarRecordatoriosTareas = createAsyncThunk(
  'notificaciones/enviarRecordatorios',
  async (diasAnticipacion = 3, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('common/notificacion/enviar-recordatorios/', {
        dias_anticipacion: diasAnticipacion,
      });
      return data; // { notificaciones_creadas }
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue('No tiene permiso para disparar recordatorios masivos.');
      }
      return rejectWithValue(error.response?.data?.detail || 'Error al enviar los recordatorios.');
    }
  }
);

const notificacionesSlice = createSlice({
  name: 'notificaciones',
  initialState: {
    items: [],
    noLeidas: 0,
    status: 'idle',

    // Recordatorios masivos (administrativo)
    enviandoRecordatorios: false,
    recordatoriosError: null,
    ultimoResultadoRecordatorios: null, // { notificaciones_creadas }
  },
  reducers: {
    notificacionRecibida: (state, action) => {
      state.items.unshift(action.payload);
      state.noLeidas += 1;
    },
    limpiarResultadoRecordatorios: (state) => {
      state.ultimoResultadoRecordatorios = null;
      state.recordatoriosError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificacionesIniciales.fulfilled, (state, action) => {
        state.items = action.payload;
        state.noLeidas = action.payload.length;
        state.status = 'succeeded';
      })
      .addCase(marcarLeida.fulfilled, (state, action) => {
        // items solo contiene no-leídas (fetch con solo_no_leidas=true), así
        // que al marcar como leída simplemente sale de la lista.
        const habiaSinLeer = state.items.some((n) => n.id === action.payload.id);
        state.items = state.items.filter((n) => n.id !== action.payload.id);
        if (habiaSinLeer) {
          state.noLeidas = Math.max(0, state.noLeidas - 1);
        }
      })
      .addCase(marcarTodasLeidas.fulfilled, (state) => {
        state.items = [];
        state.noLeidas = 0;
      })
      .addCase(enviarRecordatoriosTareas.pending, (state) => {
        state.enviandoRecordatorios = true;
        state.recordatoriosError = null;
      })
      .addCase(enviarRecordatoriosTareas.fulfilled, (state, action) => {
        state.enviandoRecordatorios = false;
        state.ultimoResultadoRecordatorios = action.payload;
      })
      .addCase(enviarRecordatoriosTareas.rejected, (state, action) => {
        state.enviandoRecordatorios = false;
        state.recordatoriosError = action.payload;
      });
  },
});

export const { notificacionRecibida, limpiarResultadoRecordatorios } = notificacionesSlice.actions;
export default notificacionesSlice.reducer;