// src/features/certificacionExterna/certificacionExternaSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/certificacion-externa/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchCertificacionesExternas = createAsyncThunk(
  'certificacionExterna/fetchCertificacionesExternas',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las certificaciones externas.'));
    }
  }
);

export const fetchCertificacionesPorProceso = createAsyncThunk(
  'certificacionExterna/fetchCertificacionesPorProceso',
  async (procesoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-proceso/${procesoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por proceso.'));
    }
  }
);

export const fetchCertificacionesPendientesValidacion = createAsyncThunk(
  'certificacionExterna/fetchCertificacionesPendientesValidacion',
  async (procesoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}pendientes-validacion/`, {
        params: procesoId ? { proceso: procesoId } : undefined,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar las certificaciones pendientes.'));
    }
  }
);

export const crearCertificacionExterna = createAsyncThunk(
  'certificacionExterna/crearCertificacionExterna',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchCertificacionesExternas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al registrar la certificación externa.'));
    }
  }
);

export const actualizarCertificacionExterna = createAsyncThunk(
  'certificacionExterna/actualizarCertificacionExterna',
  // El viewset solo implementa update() (PUT), no partial_update(). Rechazado
  // si la certificación ya fue validada.
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchCertificacionesExternas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar la certificación externa.'));
    }
  }
);

export const eliminarCertificacionExterna = createAsyncThunk(
  'certificacionExterna/eliminarCertificacionExterna',
  // Soft-delete; rechazado si ya fue validada.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchCertificacionesExternas());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al eliminar la certificación externa.'));
    }
  }
);

export const adjuntarCertificadoAsistencia = createAsyncThunk(
  'certificacionExterna/adjuntarCertificadoAsistencia',
  async ({ id, documentoId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/certificado-asistencia/`, {
        documento: documentoId,
      });
      dispatch(fetchCertificacionesExternas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al adjuntar el certificado de asistencia.'));
    }
  }
);

export const adjuntarCertificadoAprobacion = createAsyncThunk(
  'certificacionExterna/adjuntarCertificadoAprobacion',
  async ({ id, documentoId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/certificado-aprobacion/`, {
        documento: documentoId,
      });
      dispatch(fetchCertificacionesExternas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al adjuntar el certificado de aprobación.'));
    }
  }
);

export const validarHorasCertificacion = createAsyncThunk(
  'certificacionExterna/validarHorasCertificacion',
  // validado_por siempre es request.user en el backend; no se envía desde aquí.
  async ({ id, horasValidadas }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/validar-horas/`, {
        horas_validadas: horasValidadas,
      });
      dispatch(fetchCertificacionesExternas());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al validar las horas de la certificación.'));
    }
  }
);

const certificacionExternaSlice = createSlice({
  name: 'certificacionExterna',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    transicionandoId: null,
    error: null,
    procesoFiltro: null,
    pendientesActivo: false,
  },
  reducers: {
    limpiarErrorCertificacionExterna: (state) => {
      state.error = null;
    },
    establecerFiltroProcesoCertificacion: (state, action) => {
      state.procesoFiltro = action.payload || null;
      state.pendientesActivo = false;
    },
    establecerFiltroPendientesCertificacion: (state, action) => {
      state.pendientesActivo = true;
      state.procesoFiltro = action.payload ?? null;
    },
    limpiarFiltrosCertificacionExterna: (state) => {
      state.procesoFiltro = null;
      state.pendientesActivo = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificacionesExternas.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCertificacionesExternas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchCertificacionesExternas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCertificacionesPorProceso.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCertificacionesPorProceso.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchCertificacionesPorProceso.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCertificacionesPendientesValidacion.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCertificacionesPendientesValidacion.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchCertificacionesPendientesValidacion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(crearCertificacionExterna.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearCertificacionExterna.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearCertificacionExterna.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarCertificacionExterna.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarCertificacionExterna.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarCertificacionExterna.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarCertificacionExterna.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarCertificacionExterna.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarCertificacionExterna.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      })
      // certificado-asistencia / certificado-aprobacion / validar-horas comparten "transicionandoId"
      .addCase(adjuntarCertificadoAsistencia.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(adjuntarCertificadoAsistencia.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(adjuntarCertificadoAsistencia.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(adjuntarCertificadoAprobacion.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(adjuntarCertificadoAprobacion.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(adjuntarCertificadoAprobacion.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(validarHorasCertificacion.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(validarHorasCertificacion.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(validarHorasCertificacion.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorCertificacionExterna,
  establecerFiltroProcesoCertificacion,
  establecerFiltroPendientesCertificacion,
  limpiarFiltrosCertificacionExterna,
} = certificacionExternaSlice.actions;
export default certificacionExternaSlice.reducer;