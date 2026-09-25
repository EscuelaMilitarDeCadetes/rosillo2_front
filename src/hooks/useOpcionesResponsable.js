// src/hooks/useOpcionesResponsable.js
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const SIN_PAGINAR = { params: { page_size: 200 } };

/**
 * Obtiene facultades y grupos, y arma las opciones agrupadas
 * para el dropdown de "Responsable" en el filtro de proyectos.
 */
export default function useOpcionesResponsable() {
  const [facultades, setFacultades] = useState([]);
  const [grupos, setGrupos] = useState([]);

  useEffect(() => {
    Promise.all([
      axiosInstance.get("institucional/facultades/", SIN_PAGINAR),
      axiosInstance.get("institucional/grupos/", SIN_PAGINAR),
    ]).then(([resFac, resGru]) => {
      setFacultades(resFac.data.results ?? resFac.data);
      setGrupos(resGru.data.results ?? resGru.data);
    });
  }, []);

  const opcionesResponsableAgrupadas = useMemo(
    () => [
      {
        label: "Facultades",
        items: facultades.map((f) => ({
          label: f.abreviatura,
          value: `FAC:${f.abreviatura}`,
        })),
      },
      {
        label: "Grupos y Otros",
        items: grupos.map((g) => ({
          label: g.sigla_grupo,
          value: `GRU:${g.sigla_grupo}`,
        })),
      },
    ],
    [facultades, grupos]
  );

  return { opcionesResponsableAgrupadas };
}