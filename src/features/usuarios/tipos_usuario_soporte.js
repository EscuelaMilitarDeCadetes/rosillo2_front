// src/features/usuarios/tipos_usuario_soporte.js
/*
 * Tipos de usuario que el rol EsSoporte puede crear.
 */
export const TIPOS_USUARIO_SOPORTE = [
  {
    key: 'soporte',
    endpoint: 'crear-soporte',
    label: 'Soporte',
    flujo: 'administrativo',
    rolCandidatos: ['SOPORTE', 'ROLE_SOPORTE'],
  },
  {
    key: 'supervisor',
    endpoint: 'crear-supervisor',
    label: 'Supervisor',
    flujo: 'administrativo',
    rolCandidatos: ['SUPERVISOR', 'ROLE_SUPERVISOR'],
  },
  {
    key: 'gerente',
    endpoint: 'crear-gerente',
    label: 'Gerente',
    flujo: 'administrativo',
    rolCandidatos: ['GERENTE', 'ROLE_GERENTE', 'ROLE_GERENTES'],
  },
  {
    key: 'decano',
    endpoint: 'crear-decano',
    label: 'Decano',
    flujo: 'facultad',
    rolCandidatos: ['DECANO', 'ROLE_DECANOS', 'ROLE_DECANO'],
  },
  {
    key: 'facultad',
    endpoint: 'crear-facultad',
    label: 'Facultad',
    flujo: 'facultad',
    rolCandidatos: ['FACULTAD', 'ROLE_FACULTADES', 'ROLE_FACULTAD'],
  },
  {
    key: 'grupo',
    endpoint: 'crear-grupo',
    label: 'Grupo de investigación',
    flujo: 'grupo',
    rolCandidatos: ['GRUPO', 'ROLE_GRUPOS', 'ROLE_GRUPO'],
  },
  {
    key: 'cinterno',
    endpoint: 'crear-cinterno',
    label: 'Investigador interno (CInterno)',
    flujo: 'grupo',
    rolCandidatos: ['CINTERNO', 'ROLE_CINTERNOS', 'ROLE_CINTERNO'],
  },
  {
    key: 'cexterno',
    endpoint: 'crear-cexterno',
    label: 'Investigador externo (CExterno)',
    flujo: 'grupo',
    rolCandidatos: ['CEXTERNO', 'ROLE_CEXTERNOS', 'ROLE_CEXTERNO'],
  },
  {
    key: 'asesor',
    endpoint: 'crear-asesor',
    label: 'Asesor',
    flujo: 'grupo',
    rolCandidatos: ['ASESOR', 'ROLE_ASESORES', 'ROLE_ASESOR'],
  },
];

export function resolverRolPlataforma(roles, tipo) {
  if (!roles?.length || !tipo) return null;

  const porCandidatoExacto = roles.find((r) =>
    tipo.rolCandidatos.some(
      (candidato) => candidato.toLowerCase() === r.nombre_rol?.toLowerCase()
    )
  );
  if (porCandidatoExacto) return porCandidatoExacto;

  const porCoincidenciaParcial = roles.find((r) =>
    r.nombre_rol?.toLowerCase().includes(tipo.key.toLowerCase())
  );
  return porCoincidenciaParcial ?? null;
}