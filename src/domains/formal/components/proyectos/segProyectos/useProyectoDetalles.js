// src/domains/formal/components/proyectos/segProyectos/useProyectoDetalles.js
import { useEffect, useState } from "react";
import axiosInstance from "../../../../../api/axiosInstance";

/**
 * Carga en paralelo el detalle "pesado" de cada fila visible (avance ponderado,
 * fecha de fin, año de convocatoria y montos) que no viene en el listado
 * paginado de proyecto-convocatoria.
 */
const cargarDetalleFila = async (row) => {
  const [avanceRes, proyectoRes, convocatoriaRes, montoRes] = await Promise.allSettled([
    axiosInstance.get(`investigacion-formal/proyectos/${row.proyecto}/avance-ponderado/`),
    axiosInstance.get(`investigacion-formal/proyectos/${row.proyecto}/`),
    axiosInstance.get(`investigacion-formal/convocatorias/${row.convocatoria}/`),
    row.monto_id
      ? axiosInstance.get(`investigacion-formal/montos/${row.monto_id}/`)
      : Promise.resolve(null),
  ]);
  return {
    id: row.id,
    avance: avanceRes.status === "fulfilled" ? avanceRes.value.data.avance_ponderado : null,
    fechaFin: proyectoRes.status === "fulfilled" ? proyectoRes.value.data.fecha_fin : null,
    anioConvocatoria:
      convocatoriaRes.status === "fulfilled" ? convocatoriaRes.value.data.anio_convocatoria : null,
    contrapartida:
      montoRes.status === "fulfilled" && montoRes.value ? montoRes.value.data.contrapartida : null,
    total: montoRes.status === "fulfilled" && montoRes.value ? montoRes.value.data.total : null,
    ejecutado: montoRes.status === "fulfilled" && montoRes.value ? montoRes.value.data.ejecutado : null,
  };
};

export default function useProyectoDetalles(filteredProjects) {
  const [detalles, setDetalles] = useState({});
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  useEffect(() => {
    if (!filteredProjects.length) {
      setDetalles({});
      return;
    }
    let cancelado = false;
    setCargandoDetalles(true);

    Promise.all(filteredProjects.map(cargarDetalleFila)).then((resultados) => {
      if (cancelado) return;
      const mapa = {};
      resultados.forEach((r) => { mapa[r.id] = r; });
      setDetalles(mapa);
      setCargandoDetalles(false);
    });

    return () => { cancelado = true; };
  }, [filteredProjects]);

  const detalle = (row) => detalles[row.id];

  return { detalles, cargandoDetalles, detalle };
}