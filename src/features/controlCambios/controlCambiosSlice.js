// src/features/controlCambios/controlCambiosSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formal/control-cambios/';


export const fetchControlCambiosPorProyecto = createAsyncThunk(
  'controlCambios/fetchPorProyecto',
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${BASE}por-proyecto/${proyectoId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Error al cargar el control de cambios.'
      );
    }
  }
);

export const addControlCambio = createAsyncThunk(
  'controlCambios/add',
  async ({ proyectoId, data }, { dispatch, rejectWithValue }) => {
    try {
      const payload = {
        proyecto: proyectoId,
        tipo_cambio: data.tipo_cambio,
        fecha_cambio: data.fecha_cambio,
        cambio_tiempo: data.cambio_tiempo,
        cambio_investigador: data.cambio_investigador,
        cambio_costo: data.cambio_costo,
        cambio_producto: data.cambio_producto,
      };
      const response = await axiosInstance.post(BASE, payload);
      dispatch(fetchControlCambiosPorProyecto(proyectoId));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === 'string'
          ? data
          : (data && Object.values(data).flat().join(' ')) ||
            'Error al registrar el cambio.';
      return rejectWithValue(mensaje);
    }
  }
);

export const actualizarBanderasControlCambio = createAsyncThunk(
  'controlCambios/actualizarBanderas',
  async ({ controlCambioId, proyectoId, banderas }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${BASE}${controlCambioId}/banderas/`,
        banderas
      );
      dispatch(fetchControlCambiosPorProyecto(proyectoId));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === 'string'
          ? data
          : (data && Object.values(data).flat().join(' ')) ||
            'Error al actualizar las banderas del cambio.';
      return rejectWithValue(mensaje);
    }
  }
);

const controlCambiosSlice = createSlice({
  name: 'controlCambios',
  initialState: {
    registros: [],
    loading: false,
    error: null,
  },
  reducers: {
    limpiarErrorControlCambios: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchControlCambiosPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchControlCambiosPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.registros = action.payload;
      })
      .addCase(fetchControlCambiosPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addControlCambio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addControlCambio.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addControlCambio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(actualizarBanderasControlCambio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actualizarBanderasControlCambio.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(actualizarBanderasControlCambio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorControlCambios } = controlCambiosSlice.actions;
export default controlCambiosSlice.reducer;