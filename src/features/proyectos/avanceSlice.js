// src/features/proyectos/avanceSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { fetchObjetivosPorProyecto, fetchObjetivoXPuntoPorProyecto } from "./objetivosSlice";


// Thunk para registrar un avance sobre un ObjetivoXPunto ya existente
export const addAvance = createAsyncThunk(
  "avance/addAvance",
  async (
    { puntoControlId, proyectoId, descripcion_avance, avance, mes_avance, anio_avance },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        `investigacion-formal/objetivo-punto/agregar-avance/${puntoControlId}/`,
        { descripcion_avance, avance, mes_avance, anio_avance }
      );
      if (proyectoId) {
        dispatch(fetchObjetivosPorProyecto(proyectoId));
        dispatch(fetchObjetivoXPuntoPorProyecto(proyectoId));
      }
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al registrar el avance.";
      return rejectWithValue(mensaje);
    }
  }
);

const avanceSlice = createSlice({
  name: "avance",
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addAvance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAvance.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addAvance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default avanceSlice.reducer;