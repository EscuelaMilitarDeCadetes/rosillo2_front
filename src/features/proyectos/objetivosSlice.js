// src/features/proyectos/objetivosSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";


export const fetchObjetivosPorProyecto = createAsyncThunk(
  "objetivos/fetchObjetivosPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `investigacion-formal/objetivos/por-proyecto/${proyectoId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los objetivos."
      );
    }
  }
);

// Thunk para obtener los ObjetivoXPunto de un proyecto.
export const fetchObjetivoXPuntoPorProyecto = createAsyncThunk(
  "objetivos/fetchObjetivoXPuntoPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `investigacion-formal/objetivo-punto/por-proyecto/${proyectoId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los puntos de control."
      );
    }
  }
);

// Thunk para obtener los ObjetivoXPunto de UN objetivo específico
export const fetchObjetivoXPuntoPorObjetivo = createAsyncThunk(
  "objetivos/fetchObjetivoXPuntoPorObjetivo",
  async (objetivoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `investigacion-formal/objetivo-punto/por-objetivo/${objetivoId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los puntos de control del objetivo seleccionado."
      );
    }
  }
);

// Thunk para crear el objetivo general del proyecto
export const createObjetivoGeneral = createAsyncThunk(
  "objetivos/createObjetivoGeneral",
  async ({ proyecto, objetivo }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "investigacion-formal/objetivos/objetivo-general/",
        { proyecto, objetivo }
      );
      dispatch(fetchObjetivosPorProyecto(proyecto));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al crear el objetivo general.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para crear un objetivo específico nuevo
export const createObjetivoEspecifico = createAsyncThunk(
  "objetivos/createObjetivoEspecifico",
  async ({ proyecto, objetivo }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "investigacion-formal/objetivos/objetivo-especifico/",
        { proyecto, objetivo }
      );
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al crear el objetivo específico.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para crear un PuntoControl y vincularlo a un objetivo ya existente
export const createPuntoControl = createAsyncThunk(
  "objetivos/createPuntoControl",
  async ({ objetivo, control, peso, proyectoId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "investigacion-formal/objetivo-punto/",
        { objetivo, control, peso }
      );
      dispatch(fetchObjetivosPorProyecto(proyectoId));
      dispatch(fetchObjetivoXPuntoPorProyecto(proyectoId));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al crear el punto de control.";
      return rejectWithValue(mensaje);
    }
  }
);

export const actualizarObjetivo = createAsyncThunk(
  "objetivos/actualizarObjetivo",
  async ({ id, objetivo, proyectoId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `investigacion-formal/objetivos/${id}/`,
        { objetivo }
      );
      if (proyectoId) dispatch(fetchObjetivosPorProyecto(proyectoId));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al actualizar el objetivo.";
      return rejectWithValue(mensaje);
    }
  }
);

// El backend hace un borrado lógico (estado=False), no elimina el registro:
// ObjetivosService.eliminar() desactiva el objetivo, que a partir de ahí deja
// de aparecer en por-proyecto/{id}/ (que por defecto trae solo_activos=true).
export const eliminarObjetivo = createAsyncThunk(
  "objetivos/eliminarObjetivo",
  async ({ id, proyectoId }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`investigacion-formal/objetivos/${id}/`);
      if (proyectoId) dispatch(fetchObjetivosPorProyecto(proyectoId));
      return { id };
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al eliminar el objetivo.";
      return rejectWithValue(mensaje);
    }
  }
);

const objetivosSlice = createSlice({
  name: "objetivos",
  initialState: {
    objetivos: [],
    objetivoXPunto: [],
    objetivoXPuntoPorObjetivo: [],
    loading: false,
    saving: false,
    deletingId: null,
    error: null,
  },
  reducers: {
    limpiarObjetivoXPuntoPorObjetivo: (state) => {
      state.objetivoXPuntoPorObjetivo = [];
    },
    limpiarErrorObjetivos: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchObjetivosPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchObjetivosPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.objetivos = action.payload;
      })
      .addCase(fetchObjetivosPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchObjetivoXPuntoPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchObjetivoXPuntoPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.objetivoXPunto = action.payload;
      })
      .addCase(fetchObjetivoXPuntoPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createObjetivoGeneral.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createObjetivoGeneral.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createObjetivoGeneral.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createObjetivoEspecifico.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createObjetivoEspecifico.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createObjetivoEspecifico.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPuntoControl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPuntoControl.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createPuntoControl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchObjetivoXPuntoPorObjetivo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchObjetivoXPuntoPorObjetivo.fulfilled, (state, action) => {
        state.loading = false;
        state.objetivoXPuntoPorObjetivo = action.payload;
      })
      .addCase(fetchObjetivoXPuntoPorObjetivo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(actualizarObjetivo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarObjetivo.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarObjetivo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(eliminarObjetivo.pending, (state, action) => {
        state.deletingId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(eliminarObjetivo.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(eliminarObjetivo.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      });
  },
});

export const { limpiarObjetivoXPuntoPorObjetivo, limpiarErrorObjetivos } = objetivosSlice.actions;
export default objetivosSlice.reducer;