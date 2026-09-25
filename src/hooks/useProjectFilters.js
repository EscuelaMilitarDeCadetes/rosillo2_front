// src/hooks/useProjectFilters.js
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchProjects } from "../features/proyectos/proyectosSlice";

const FILTROS_INICIALES = {
  convocatoria: null,
  codigo: "",
  titulo: "",
  financiado: null,
  alianza: null,
  responsable: null,
  anio_convocatoria: null,
  anio_inicio: null,
  anio_fin: null,
};

/**
 * Maneja el estado del formulario de filtros, la paginación, y despacha
 * fetchProjects cuando cambian. Se omite el fetch cuando rolParam está
 * presente (ese caso lo maneja el efecto de "proyectos por rol" en la página).
 */
export default function useProjectFilters({ calificacion, esModoExterno, rolParam }) {
  const dispatch = useDispatch();
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [page, setPage] = useState(1);

  const recargar = useCallback(() => {
    if (rolParam) return;
    dispatch(fetchProjects({ ...filtros, calificacion, interno: !esModoExterno, page }));
  }, [dispatch, filtros, calificacion, esModoExterno, page, rolParam]);

  useEffect(() => {
    if (rolParam) return; // el fetch por rol se maneja aparte
    const params = {
      ...filtros,
      calificacion,
      interno: esModoExterno ? false : true,
      page,
    };
    dispatch(fetchProjects(params));
  }, [dispatch, filtros, calificacion, esModoExterno, page, rolParam]);

  useEffect(() => { recargar(); }, [recargar]);

  return { filtros, setFiltros, page, setPage, recargar };
}