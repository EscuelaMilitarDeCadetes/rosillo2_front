// src/features/catalogos/catalogosConfig.js
// Se agrega 'metodoActualizar' explícito a cada catálogo y
// catalogosSlice.js ahora lo respeta en vez de asumir PATCH para todos.
export const CATALOGOS_CONFIG = {
  rol_plataforma: {
    key: 'rol_plataforma',
    titulo: 'Roles de Plataforma',
    tituloSingular: 'Rol de Plataforma',
    // apps/usuarios/urls.py -> router.register(r'roles', RolPlataformaViewSet)
    endpoint: 'usuarios/roles/',
    permiteEliminar: false,
    metodoActualizar: 'PATCH', // RolPlataformaViewSet solo define partial_update()
    campos: [
      { name: 'nombre_rol', label: 'Nombre del Rol', type: 'text', required: true, maxLength: 50 },
      { name: 'descripcion', label: 'Descripción', type: 'text', required: true, maxLength: 180 },
    ],
  },
  
  grado_estudios: {
    key: 'grado_estudios',
    titulo: 'Grados de Estudio',
    tituloSingular: 'Grado de Estudio',
    // apps/institucional/urls.py -> router.register(r'grados', GradoEstudiosViewSet)
    endpoint: 'institucional/grados/',
    permiteEliminar: false,
    metodoActualizar: 'PUT', // GradoEstudiosViewSet solo define update()
    campos: [
      { name: 'sigla_grado', label: 'Sigla', type: 'text', required: true, maxLength: 3 },
      { name: 'descripcion', label: 'Descripción', type: 'text', required: true, maxLength: 150 },
    ],
  },
  
  facultad_escuela: {
    key: 'facultad_escuela',
    titulo: 'Facultades / Escuelas',
    tituloSingular: 'Facultad',
    // apps/institucional/urls.py -> router.register(r'facultades', FacultadEscuelaViewSet)
    endpoint: 'institucional/facultades/',
    permiteEliminar: false,
    metodoActualizar: 'PUT', // FacultadEscuelaViewSet solo define update()
    campos: [
      { name: 'nombre_facultad', label: 'Nombre de la Facultad', type: 'text', required: true, maxLength: 30 },
      { name: 'abreviatura', label: 'Abreviatura', type: 'text', required: true, maxLength: 5 },
    ],
  },
  
  grupo_investigacion: {
    key: 'grupo_investigacion',
    titulo: 'Grupos de Investigación',
    tituloSingular: 'Grupo de Investigación',
    // apps/institucional/urls.py -> router.register(r'grupos', GrupoInvestigacionViewSet)
    endpoint: 'institucional/grupos/',
    permiteEliminar: false,
    metodoActualizar: 'PUT', // GrupoInvestigacionViewSet solo define update()
    campos: [
      { name: 'nombre_grupo', label: 'Nombre del Grupo', type: 'text', required: true, maxLength: 50 },
      { name: 'sigla_grupo', label: 'Sigla', type: 'text', required: true, maxLength: 8 },
      { name: 'clasificacion_grupo', label: 'Clasificación', type: 'text', required: false, maxLength: 3 },
    ],
  },
  
  facultad_x_grupo: {
    key: 'facultad_x_grupo',
    titulo: 'Facultades por Grupo de Investigación',
    tituloSingular: 'Vínculo Facultad-Grupo',
    // apps/institucional/urls.py -> router.register(r'facultad-grupo', FacultadXGrupoViewSet)
    endpoint: 'institucional/facultad-grupo/',
    permiteEliminar: false, // docstring del ViewSet: "Sin destroy(): tabla estructural permanente"
    metodoActualizar: 'PUT', // FacultadXGrupoViewSet solo define update()
    campos: [
      {
        name: 'grupo',
        label: 'Grupo de Investigación',
        type: 'select',
        required: true,
        optionsSource: 'grupos',       
        optionLabel: 'nombre_grupo',
        optionValue: 'id',
        columnField: 'grupo_nombre',   
      },
      {
        name: 'facultad',
        label: 'Facultad',
        type: 'select',
        required: true,
        optionsSource: 'facultades',   
        optionLabel: 'nombre_facultad',
        optionValue: 'id',
        columnField: 'facultad_nombre', 
      },
    ],
  },
  
  rol_grupo: {
    key: 'rol_grupo',
    titulo: 'Roles de Grupo',
    tituloSingular: 'Rol de Grupo',
    // apps/institucional/urls.py -> router.register(r'roles-grupo', RolGrupoViewSet)
    endpoint: 'institucional/roles-grupo/',
    permiteEliminar: false,
    metodoActualizar: 'PUT', // RolGrupoViewSet solo define update()
    campos: [
      { name: 'cargo', label: 'Cargo', type: 'text', required: true, maxLength: 50 },
    ],
  },
  
  rol_investigador: {
    key: 'rol_investigador',
    titulo: 'Roles de Investigador',
    tituloSingular: 'Rol de Investigador',
    // apps/investigacion_formal/urls.py -> router.register(r'roles-investigador', RolInvestigadorViewSet)
    endpoint: 'investigacion-formal/roles-investigador/',
    permiteEliminar: false,
    metodoActualizar: 'PUT', // RolInvestigadorViewSet solo define update()
    avisoPermiso:
      'Para crear o editar roles de investigador tu sesión debe haberse iniciado desde el módulo de Investigación Formal.',
    campos: [
      { name: 'nombre_rol_investigador', label: 'Nombre del Rol', type: 'text', required: true, maxLength: 50 },
      { name: 'descripcion', label: 'Descripción', type: 'text', required: true, maxLength: 150 },
    ],
  },
  
  tipo_documento: {
    key: 'tipo_documento',
    titulo: 'Tipos de Documento',
    tituloSingular: 'Tipo de Documento',
    endpoint: 'common/tipos-documento/',
    permiteEliminar: false,
    metodoActualizar: 'PUT', // TipoDocumentoViewSet solo define update()
    campos: [
      { name: 'nombre_documento', label: 'Nombre del Documento', type: 'text', required: true, maxLength: 40 },
      { name: 'grupo', label: 'Grupo (ej: convocatoria, proyecto, evaluacion)', type: 'text', required: true, maxLength: 30 },
    ],
    // apps/common/urls.py -> tipos-documento/por-grupo/?grupo=<valor>
    filtro: {
      campo: 'grupo',
      label: 'Grupo',
      placeholder: 'Ej: proyecto, convocatoria...',
      endpoint: 'common/tipos-documento/por-grupo/',
    },
  },
  
  tipo_calificacion: {
    key: 'tipo_calificacion',
    titulo: 'Tipos de Calificación',
    tituloSingular: 'Tipo de Calificación',
    // apps/investigacion_formal/urls.py -> router.register(r'tipos-calificacion', TipoCalificacionViewSet)
    endpoint: 'investigacion-formal/tipos-calificacion/',
    permiteEliminar: false,
    metodoActualizar: 'PUT', // TipoCalificacionViewSet solo define update()
    avisoPermiso:
      'Para crear o editar tipos de calificación tu sesión debe haberse iniciado desde el módulo de Investigación Formal.',
    campos: [
      { name: 'tipo_calificacion', label: 'Tipo de Calificación', type: 'text', required: true, maxLength: 30 },
      { name: 'descripcion', label: 'Descripción', type: 'text', required: true, maxLength: 150 },
      { name: 'evaluacion', label: '¿Es Evaluación?', type: 'checkbox' },
      {
        name: 'ordenFase',
        label: 'Orden de la Fase',
        type: 'number',
        required: true,
      },
    ],
  },
  
  producto_minciencias: {
    key: 'producto_minciencias',
    titulo: 'Productos Minciencias',
    tituloSingular: 'Producto Minciencias',
    // apps/investigacion_formal/urls.py -> router.register(r'productos-minciencias', ProductoMincienciasViewSet)
    endpoint: 'investigacion-formal/productos-minciencias/',
    permiteEliminar: false,
    metodoActualizar: 'PUT', // ProductoMincienciasViewSet solo define update()
    avisoPermiso:
      'Para crear o editar productos Minciencias tu sesión debe haberse iniciado desde el módulo de Investigación Formal.',
    campos: [
      { name: 'nombre_producto', label: 'Nombre del Producto', type: 'text', required: true, maxLength: 200 },
      { name: 'nomenclatura', label: 'Nomenclatura', type: 'text', required: true, maxLength: 20 },
      { name: 'peso', label: 'Peso', type: 'number', required: true },
      { name: 'vigencia', label: 'Vigencia (años)', type: 'number', required: true },
    ],
  },
  
  grupo_minciencias: {
    key: 'grupo_minciencias',
    titulo: 'Grupos Minciencias',
    tituloSingular: 'Grupo Minciencias',
    // apps/investigacion_formal/urls.py -> router.register(r'grupos-minciencias', GrupoMincienciasViewSet)
    endpoint: 'investigacion-formal/grupos-minciencias/',
    permiteEliminar: false,
    metodoActualizar: 'PUT', // GrupoMincienciasViewSet solo define update()
    avisoPermiso:
      'Para crear o editar grupos Minciencias tu sesión debe haberse iniciado desde el módulo de Investigación Formal.',
    campos: [
      { name: 'nombre_grupo_minciencias', label: 'Nombre del Grupo Minciencias', type: 'text', required: true, maxLength: 150 },
    ],
  },
  
  tipo_producto: {
    key: 'tipo_producto',
    titulo: 'Tipos de Producto',
    tituloSingular: 'Tipo de Producto',
    // apps/investigacion_formal/urls.py -> router.register(r'tipos-producto', TipoProductoViewSet)
    endpoint: 'investigacion-formal/tipos-producto/',
    permiteEliminar: false,
    metodoActualizar: 'PUT', // TipoProductoViewSet solo define update()
    avisoPermiso:
      'Para crear o editar tipos de producto tu sesión debe haberse iniciado desde el módulo de Investigación Formal.',
    campos: [
      { name: 'tipo_producto', label: 'Tipo de Producto', type: 'text', required: true, maxLength: 200 },
      { name: 'aplica', label: '¿Aplica?', type: 'checkbox' },
    ],
  },
  
  producto_x_grupo: {
    key: 'producto_x_grupo',
    titulo: 'Productos por Grupo',
    tituloSingular: 'Producto x Grupo',
    // apps/investigacion_formal/urls.py -> router.register(r'productos-grupo', ProductoXGrupoViewSet)
    endpoint: 'investigacion-formal/productos-grupo/',
    permiteEliminar: false, 
    metodoActualizar: 'PUT', // ProductoXGrupoViewSet solo define update()
    avisoPermiso:
      'Para crear o editar aquí tu sesión debe haberse iniciado desde el módulo de Investigación Formal. A diferencia de los demás catálogos, EsSoporte no es el único rol habilitado: también pueden escribir aquí los roles operativos definidos en ROLES_CREACION_OPERATIVA / ROLES_ESCRITURA_GESTION.',
    campos: [
      {
        name: 'producto_minciencias',
        label: 'Producto Minciencias',
        type: 'select',
        required: true,
        optionsSource: 'productosMinciencias',
        optionLabel: 'nombre_producto',
        optionValue: 'id',
        columnField: 'producto_nombre', 
      },
      {
        name: 'grupo_minciencias',
        label: 'Grupo Minciencias',
        type: 'select',
        required: true,
        optionsSource: 'gruposMinciencias',
        optionLabel: 'nombre_grupo_minciencias',
        optionValue: 'id',
        columnField: 'grupo_nombre',
      },
      {
        name: 'tipo_producto',
        label: 'Tipo de Producto',
        type: 'select',
        required: true,
        optionsSource: 'tiposProducto',
        optionLabel: 'tipo_producto',
        optionValue: 'id',
        columnField: 'tipo_producto_nombre', 
      },
    ],
  },
  
  tipo_rubro: {
    key: 'tipo_rubro',
    titulo: 'Tipos de Rubro',
    tituloSingular: 'Tipo de Rubro',
    endpoint: 'investigacion-formal/tipos-rubro/',
    permiteEliminar: false,
    metodoActualizar: 'PUT', // TipoRubroViewSet solo define update()
    avisoPermiso:
      'Para crear o editar tipos de rubro tu sesión debe haberse iniciado desde el módulo de Investigación Formal.',
    campos: [
      { name: 'nombre_rubro', label: 'Nombre del Rubro', type: 'text', required: true, maxLength: 50 },
      { name: 'aplica', label: '¿Aplica?', type: 'checkbox' },
    ],
  },    
};