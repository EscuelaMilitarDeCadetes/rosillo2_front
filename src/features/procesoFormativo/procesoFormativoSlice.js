// src/features/procesoFormativo/procesoFormativoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formativa/proceso-formativo/';

const extraerMensajeError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.flat().join(' ');
  return Object.values(data).flat().join(' ') || fallback;
};

export const fetchProcesosFormativos = createAsyncThunk(
  'procesoFormativo/fetchProcesosFormativos',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar los procesos formativos.'));
    }
  }
);

export const fetchProcesosPorPersona = createAsyncThunk(
  'procesoFormativo/fetchProcesosPorPersona',
  async (personaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-persona/${personaId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al filtrar por persona.'));
    }
  }
);

// buscar() SÍ está paginado.
export const buscarProcesosFormativos = createAsyncThunk(
  'procesoFormativo/buscarProcesosFormativos',
  async ({ filtros = {}, page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}buscar/`, {
        params: { ...filtros, page, page_size: pageSize },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al buscar procesos formativos.'));
    }
  }
);

export const fetchAvanceProceso = createAsyncThunk(
  'procesoFormativo/fetchAvanceProceso',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}${id}/avance/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al cargar el avance del proceso.'));
    }
  }
);

export const crearProcesoFormativo = createAsyncThunk(
  'procesoFormativo/crearProcesoFormativo',
  // payload: { flujo_version, titulo, observacion, fecha_inicio, fecha_fin, idea?,
  //   entidad_externa?, palabras_clave?, requiere_sustentacion?, permite_segunda_instancia? }
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchProcesosFormativos());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al crear el proceso formativo.'));
    }
  }
);

export const actualizarProcesoFormativo = createAsyncThunk(
  'procesoFormativo/actualizarProcesoFormativo',
  // El viewset solo implementa update() (PUT), no partial_update(). Rechazado
  // si estado_actual === 'FINALIZADO'. flujo_version es inmutable.
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, payload);
      dispatch(fetchProcesosFormativos());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al actualizar el proceso formativo.'));
    }
  }
);

export const eliminarProcesoFormativo = createAsyncThunk(
  'procesoFormativo/eliminarProcesoFormativo',
  // Soft-delete (activo=False). Rechazado si ya estaba inactivo.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${id}/`);
      dispatch(fetchProcesosFormativos());
      return { id };
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al desactivar el proceso formativo.'));
    }
  }
);

export const calificarProcesoFormativo = createAsyncThunk(
  'procesoFormativo/calificarProcesoFormativo',
  // Solo una vez: rechazado si proceso.aprobado ya no es null.
  async ({ id, aprobado, notaFinal }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/calificar/`, {
        aprobado,
        nota_final: notaFinal,
      });
      dispatch(fetchProcesosFormativos());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al calificar el proceso formativo.'));
    }
  }
);

export const activarSegundaInstanciaProceso = createAsyncThunk(
  'procesoFormativo/activarSegundaInstanciaProceso',
  // Reabre la calificación (aprobado -> null). Requiere permite_segunda_instancia
  // = true, segunda_instancia_consumida = false y aprobado = false.
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE}${id}/activar-segunda-instancia/`);
      dispatch(fetchProcesosFormativos());
      return response.data;
    } catch (error) {
      return rejectWithValue(extraerMensajeError(error, 'Error al activar la segunda instancia.'));
    }
  }
);

const extraerMensajeErrorBlob = async (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (!(data instanceof Blob)) {
    return typeof data === 'string' ? data : Object.values(data).flat().join(' ') || fallback;
  }
  try {
    const texto = await data.text();
    const json = JSON.parse(texto);
    return typeof json === 'string' ? json : Object.values(json).flat().join(' ') || fallback;
  } catch {
    return fallback;
  }
};

// Exportación: no son thunks, no hay estado que guardar en Redux — el
// binario se descarga directamente en el navegador.
export const descargarProcesosExcel = async (filtros = {}) => {
  try {
    const response = await axiosInstance.get(`${BASE}export/excel/`, {
      params: filtros,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'procesos_formativos.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(await extraerMensajeErrorBlob(error, 'Error al exportar a Excel.'));
  }
};

export const descargarProcesosPdf = async (filtros = {}) => {
  try {
    const response = await axiosInstance.get(`${BASE}export/pdf/`, {
      params: filtros,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'procesos_formativos.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(await extraerMensajeErrorBlob(error, 'Error al exportar a PDF.'));
  }
};

const procesoFormativoSlice = createSlice({
  name: 'procesoFormativo',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    saving: false,
    deletingId: null,
    transicionandoId: null,
    error: null,
    // 'lista' | 'activos' | 'porPersona' | 'busqueda'
    modoVista: 'lista',
    personaFiltro: null,
    filtrosBusqueda: {},
    avance: null,
    cargandoAvance: false,
  },
  reducers: {
    limpiarErrorProcesoFormativo: (state) => {
      state.error = null;
    },
    establecerModoLista: (state) => {
      state.modoVista = 'lista';
      state.personaFiltro = null;
      state.filtrosBusqueda = {};
    },
    establecerModoActivos: (state) => {
      state.modoVista = 'activos';
    },
    establecerFiltroPersonaProceso: (state, action) => {
      state.modoVista = 'porPersona';
      state.personaFiltro = action.payload || null;
    },
    establecerFiltrosBusquedaProceso: (state, action) => {
      state.modoVista = 'busqueda';
      state.filtrosBusqueda = action.payload || {};
    },
    limpiarAvanceProceso: (state) => {
      state.avance = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProcesosFormativos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProcesosFormativos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchProcesosFormativos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProcesosPorPersona.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProcesosPorPersona.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.total = (action.payload ?? []).length;
      })
      .addCase(fetchProcesosPorPersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(buscarProcesosFormativos.pending, (state) => {
        state.loading = true;
      })
      .addCase(buscarProcesosFormativos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(buscarProcesosFormativos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAvanceProceso.pending, (state) => {
        state.cargandoAvance = true;
      })
      .addCase(fetchAvanceProceso.fulfilled, (state, action) => {
        state.cargandoAvance = false;
        state.avance = action.payload;
      })
      .addCase(fetchAvanceProceso.rejected, (state, action) => {
        state.cargandoAvance = false;
        state.error = action.payload;
      })
      .addCase(crearProcesoFormativo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearProcesoFormativo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearProcesoFormativo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarProcesoFormativo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarProcesoFormativo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarProcesoFormativo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarProcesoFormativo.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(eliminarProcesoFormativo.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarProcesoFormativo.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      })
      .addCase(calificarProcesoFormativo.pending, (state, action) => {
        state.transicionandoId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(calificarProcesoFormativo.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(calificarProcesoFormativo.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      })
      .addCase(activarSegundaInstanciaProceso.pending, (state, action) => {
        state.transicionandoId = action.meta.arg;
        state.error = null;
      })
      .addCase(activarSegundaInstanciaProceso.fulfilled, (state) => {
        state.transicionandoId = null;
      })
      .addCase(activarSegundaInstanciaProceso.rejected, (state, action) => {
        state.transicionandoId = null;
        state.error = action.payload;
      });
  },
});

export const {
  limpiarErrorProcesoFormativo,
  establecerModoLista,
  establecerModoActivos,
  establecerFiltroPersonaProceso,
  establecerFiltrosBusquedaProceso,
  limpiarAvanceProceso,
} = procesoFormativoSlice.actions;
export default procesoFormativoSlice.reducer;