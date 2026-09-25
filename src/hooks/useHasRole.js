// src/hooks/useHasRole.js
import { useSelector } from 'react-redux';

export default function useHasRole(rolOrRoles) {
  const roles = useSelector((state) => state.auth.roles);
  const requeridos = Array.isArray(rolOrRoles) ? rolOrRoles : [rolOrRoles];
  return requeridos.some((rol) => roles.includes(rol));
}