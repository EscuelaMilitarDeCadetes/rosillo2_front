// src/features/proyectos/gastoSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { fetchMontoPorProyecto } from "./montoSlice";

const BASE = "investigacion-formal/ejecuciones/";


// Thunk para obtener los gastos de un proyecto específico
export const fetchGastosPorProyecto = createAsyncThunk(
  "proyectos/fetchGastosPorProyecto",
  async (montoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${BASE}por-monto/${montoId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los gastos."
      );
    }
  }
);

// Thunk para agregar un gasto
export const addGasto = createAsyncThunk(
  "gastos/addGasto",
  async ({ proyectoId, data }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("monto", data.montoId); // ID del monto asociado al proyecto
      formData.append("tipo_rubro", data.tipo_rubro);
      formData.append("nombre", data.nombre);
      formData.append("costo", data.costo);
      formData.append("descripcion", data.descripcion);
      formData.append(
        "documento_file",
        data.documento_file,
        data.documento_file.name
      );
      await axiosInstance.post(BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchGastosPorProyecto(data.montoId)); // Refrescar la lista de gastos
      dispatch(fetchMontoPorProyecto(proyectoId)); // Refrescar el monto para actualizar ejecutado
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al agregar el gasto."
      );
    }
  }
);

// Thunk para borrar un documento de presupuesto
export const deleteDocumentoPresupuesto = createAsyncThunk(
  "proyectos/deleteDocumentoPresupuesto",
  async ({ documentoId, montoId }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`common/documento-firma/${documentoId}/`);
      dispatch(fetchGastosPorProyecto(montoId)); // Refrescar la lista de gastos
      return documentoId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          "Error al borrar el documento de presupuesto."
      );
    }
  }
);

// Thunk para borrar una ejecución (gasto)
export const deleteEjecucion = createAsyncThunk(
  "proyectos/deleteEjecucion",
  async ({ ejecucionId, proyectoId, montoId }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE}${ejecucionId}/`);
      dispatch(fetchGastosPorProyecto(montoId)); // Refrescar la lista de gastos
      dispatch(fetchMontoPorProyecto(proyectoId)); // Refrescar el monto para actualizar ejecutado
      return ejecucionId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al borrar la ejecución."
      );
    }
  }
);

const gastoSlice = createSlice({
  name: "gastos",
  initialState: {
    gastos: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGastosPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGastosPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.gastos = action.payload;
      })
      .addCase(fetchGastosPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addGasto.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGasto.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addGasto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteDocumentoPresupuesto.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDocumentoPresupuesto.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteDocumentoPresupuesto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteEjecucion.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEjecucion.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteEjecucion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default gastoSlice.reducer;