// src/features/participanteProceso/participanteProcesoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/participante-proceso/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchParticipantesProceso = createAsyncThunk(
  'participanteProceso/fetchParticipantesProceso',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los participantes.'));
    }
  }
);

export const fetchParticipantesPorProceso = createAsyncThunk(
  'participanteProceso/fetchParticipantesPorProceso',
  async (procesoFormativoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proceso/${procesoFormativoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por proceso.'));
    }
  }
);

export const crearParticipanteProceso = createAsyncThunk(
  'participanteProceso/crearParticipanteProceso',
  // payload: { proceso_formativo, persona, rol_en_modalidad, fecha_finalizacion?, usuario_revisor? }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchParticipantesProceso());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al vincular el participante.'));
    }
  }
);

export const actualizarParticipanteProceso = createAsyncThunk(
  'participanteProceso/actualizarParticipanteProceso',
  // El viewset solo implementa update() (PUT), no partial_update(). Solo
  // rol_en_modalidad y fecha_finalizacion son editables (proceso_formativo y
  // persona son inmutables tras la creación).
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchParticipantesProceso());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar el participante.'));
    }
  }
);

export const eliminarParticipanteProceso = createAsyncThunk(
  'participanteProceso/eliminarParticipanteProceso',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchParticipantesProceso());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al desactivar el participante.'));
    }
  }
);

export const finalizarParticipanteProceso = createAsyncThunk(
  'participanteProceso/finalizarParticipanteProceso',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/finalizar/`);
      dispatch(fetchParticipantesProceso());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al finalizar la participación.'));
    }
  }
);

const participanteProcesoSlice = createSlice({
  name: 'participanteProceso',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    transicionandoId: null,
    error: null,
    procesoFiltro: null,
  },
  reducers: {
    limpiarErrorParticipanteProceso: (state) => {
      state.error = null;
    },
    establecerFiltroProcesoParticipante: (state, action) => {
      state.procesoFiltro = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParticipantesProceso.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchParticipantesProceso.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchParticipantesProceso.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchParticipantesPorProceso.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchParticipantesPorProceso.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchParticipantesPorProceso.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearParticipanteProceso.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearParticipanteProceso.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearParticipanteProceso.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarParticipanteProceso.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarParticipanteProceso.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarParticipanteProceso.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarParticipanteProceso.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarParticipanteProceso.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarParticipanteProceso.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      })
      .addCase(finalizarParticipanteProceso.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(finalizarParticipanteProceso.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(finalizarParticipanteProceso.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorParticipanteProceso,
  establecerFiltroProcesoParticipante,
} = participanteProcesoSlice.actions;
export default participanteProcesoSlice.reducer;