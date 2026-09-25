// src/features/metadata/metadataSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const extraerResultados = (data) => (Array.isArray(data) ? data : data?.results ?? []);

const SIN_PAGINAR = { params: { page_size: 200 } };

const cfg = { ...SIN_PAGINAR, suppressErrorRedirect: true };

const fetchEnParalelo = async (endpointsPorKey) => {
  const keys = Object.keys(endpointsPorKey);
  const resultados = await Promise.allSettled(
    keys.map((k) => axiosInstance.get(endpointsPorKey[k], cfg))
  );
  return keys.reduce((acc, key, i) => {
    const r = resultados[i];
    acc[key] = r.status === 'fulfilled' ? extraerResultados(r.value.data) : [];
    return acc;
  }, {});
};

// ---------------------------------------------------------------------
// Thunk "paraguas": trae TODOS los catálogos. Se conserva por
// compatibilidad con las pantallas existentes que ya hacen
// dispatch(fetchMetadata()) sin distinguir qué necesitan. Nuevas
// pantallas (o migraciones futuras) deberían preferir los thunks
// scoped de abajo, que piden solo lo que realmente usan.
// ---------------------------------------------------------------------
export const fetchMetadata = createAsyncThunk(
  'metadata/fetchMetadata',
  async () => {
    return fetchEnParalelo({
      // apps/institucional/urls.py -> router.register(r'grados', ...)
      grados: 'institucional/grados/',
      // apps/usuarios/urls.py -> router.register(r'roles', RolPlataformaViewSet)
      roles: 'usuarios/roles/',
      // apps/institucional/urls.py -> router.register(r'facultades', ...)
      facultades: 'institucional/facultades/',
      // apps/institucional/urls.py -> router.register(r'grupos', ...)
      grupos: 'institucional/grupos/',
      // apps/institucional/urls.py -> router.register(r'roles-grupo', RolGrupoViewSet)
      rolesGrupo: 'institucional/roles-grupo/',
      // apps/usuarios/urls.py -> router.register(r'usuarios', UsuarioViewSet)
      usuarios: 'usuarios/usuarios/',
      // apps/institucional/urls.py -> router.register(r'personas', PersonaViewSet)
      personas: 'institucional/personas/',
      tiposDocumento: 'common/tipos-documento/',
      productosMinciencias: 'investigacion-formal/productos-minciencias/',
      tiposProducto: 'investigacion-formal/tipos-producto/',
      tiposRubro: 'investigacion-formal/tipos-rubro/',
      puntosControl: 'investigacion-formal/puntos-control/',
      // apps/institucional/urls.py -> router.register(r'persona-grupo', ...)
      personasXGrupo: 'institucional/persona-grupo/',
      rolesInvestigador: 'investigacion-formal/roles-investigador/',
      // apps/investigacion_formal/urls.py -> router.register(r'grupos-minciencias', GrupoMincienciasViewSet)
      gruposMinciencias: 'investigacion-formal/grupos-minciencias/',
    });
  }
);

// ---------------------------------------------------------------------
// Thunks scoped por dominio — usar estos en pantallas nuevas o al ir
// migrando pantallas existentes, para no pedir (ni exponerse a 403 de)
// catálogos que la pantalla no necesita.
// ---------------------------------------------------------------------

// Solo el catálogo de grados (ej. ProfilePage: dropdown "Grado")
export const fetchGrados = createAsyncThunk(
  'metadata/fetchGrados',
  async () => fetchEnParalelo({ grados: 'institucional/grados/' })
);

// Roles de la plataforma (usuarios/roles/)
export const fetchRolesPlataforma = createAsyncThunk(
  'metadata/fetchRolesPlataforma',
  async () => fetchEnParalelo({ roles: 'usuarios/roles/' })
);

// Catálogo de usuarios (usuarios/usuarios/) — usado en varios selects/autocompletes
export const fetchUsuarios = createAsyncThunk(
  'metadata/fetchUsuarios',
  async () => fetchEnParalelo({ usuarios: 'usuarios/usuarios/' })
);

export const fetchTiposDocumento = createAsyncThunk(
  'metadata/fetchTiposDocumento',
  async () => fetchEnParalelo({ tiposDocumento: 'common/tipos-documento/' })
);

// Catálogos institucionales: facultades, grupos, roles-grupo, personas, persona-grupo
export const fetchCatalogosInstitucionales = createAsyncThunk(
  'metadata/fetchCatalogosInstitucionales',
  async () =>
    fetchEnParalelo({
      facultades: 'institucional/facultades/',
      grupos: 'institucional/grupos/',
      rolesGrupo: 'institucional/roles-grupo/',
      personas: 'institucional/personas/',
      personasXGrupo: 'institucional/persona-grupo/',
    })
);

export const fetchCatalogosInvestigacionFormal = createAsyncThunk(
  'metadata/fetchCatalogosInvestigacionFormal',
  async () =>
    fetchEnParalelo({
      productosMinciencias: 'investigacion-formal/productos-minciencias/',
      tiposProducto: 'investigacion-formal/tipos-producto/',
      tiposRubro: 'investigacion-formal/tipos-rubro/',
      puntosControl: 'investigacion-formal/puntos-control/',
      rolesInvestigador: 'investigacion-formal/roles-investigador/',
      gruposMinciencias: 'investigacion-formal/grupos-minciencias/',
    })
);

const THUNKS_METADATA = [
  fetchMetadata,
  fetchGrados,
  fetchRolesPlataforma,
  fetchUsuarios,
  fetchTiposDocumento,
  fetchCatalogosInstitucionales,
  fetchCatalogosInvestigacionFormal,
];

const metadataSlice = createSlice({
  name: 'metadata',
  initialState: {
    grados: [],
    roles: [],
    facultades: [],
    grupos: [],
    rolesGrupo: [],
    usuarios: [],
    personas: [],
    tiposDocumento: [],
    productosMinciencias: [],
    tiposProducto: [],
    tiposRubro: [],
    puntosControl: [],
    personasXGrupo: [],
    rolesInvestigador: [],
    gruposMinciencias: [],
    peticionesEnVuelo: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    THUNKS_METADATA.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.peticionesEnVuelo += 1;
          state.loading = true;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.peticionesEnVuelo = Math.max(0, state.peticionesEnVuelo - 1);
          state.loading = state.peticionesEnVuelo > 0;
          Object.assign(state, action.payload);
        })
        .addCase(thunk.rejected, (state, action) => {
          state.peticionesEnVuelo = Math.max(0, state.peticionesEnVuelo - 1);
          state.loading = state.peticionesEnVuelo > 0;
          state.error = action.error?.message ?? 'Error al cargar los datos maestros.';
        });
    });
  },
});

export default metadataSlice.reducer;