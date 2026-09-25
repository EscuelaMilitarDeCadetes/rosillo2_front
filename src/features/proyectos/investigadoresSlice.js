// src/features/proyectos/investigadoresSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Thunk para obtener los investigadores de un proyecto específico
export const fetchInvestigadoresPorProyecto = createAsyncThunk(
  "investigadores/fetchInvestigadoresPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `investigacion-formal/investigadores/por-proyecto/${proyectoId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los investigadores."
      );
    }
  }
);

// Thunk para agregar al proyecto un investigador que YA tiene una PersonaXGrupo activa
export const addInvestigadorProyecto = createAsyncThunk(
  "investigadores/addInvestigadorProyecto",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "investigacion-formal/investigadores/",
        payload
      );
      dispatch(fetchInvestigadoresPorProyecto(payload.proyecto));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al agregar el investigador al proyecto.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para registrar un investigador NUEVO desde cero
export const createInvestigadorCompleto = createAsyncThunk(
  "investigadores/createInvestigadorCompleto",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "investigacion-formal/investigadores/registrar-completo/",
        payload
      );
      dispatch(fetchInvestigadoresPorProyecto(payload.proyecto));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al registrar el investigador.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para retirar a un investigador de un proyecto.
export const deleteInvestigadorProyecto = createAsyncThunk(
  "investigadores/deleteInvestigadorProyecto",
  async ({ id, proyectoId }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`investigacion-formal/investigadores/${id}/`);
      dispatch(fetchInvestigadoresPorProyecto(proyectoId));
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al retirar al investigador."
      );
    }
  }
);

const investigadoresSlice = createSlice({
  name: "investigadores",
  initialState: {
    investigadores: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestigadoresPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestigadoresPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.investigadores = action.payload;
      })
      .addCase(fetchInvestigadoresPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addInvestigadorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInvestigadorProyecto.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addInvestigadorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createInvestigadorCompleto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvestigadorCompleto.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createInvestigadorCompleto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteInvestigadorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvestigadorProyecto.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteInvestigadorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default investigadoresSlice.reducer;