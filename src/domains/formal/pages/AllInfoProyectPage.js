// src/domains/formal/pages/AllInfoProyectPage.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchProyecto } from "../../../features/proyectos/proyectosSlice";
import { fetchInvestigadoresPorProyecto } from "../../../features/proyectos/investigadoresSlice";
import { fetchObjetivosPorProyecto } from "../../../features/proyectos/objetivosSlice";
import { fetchProductosPorProyecto } from "../../../features/proyectos/productosSlice";
import { fetchDocumentosPorProyecto } from "../../../features/proyectos/documentosSlice";
import useHasRole from "../../../hooks/useHasRole";
import { TabView, TabPanel } from "primereact/tabview";
import ProyectoInfo from "../components/proyectos/ProyectoInfo";
import InvestigadoresProyectoTable from "../components/proyectos/InvestigadoresProyectoTable";
import ObjetivosProyectoTable from "../components/proyectos/ObjetivosProyectoTable";
import ProductosProyectoTable from "../components/proyectos/ProductosProyectoTable";
import DocumentosProyectoTable from "../components/proyectos/DocumentosProyectoTable";
import GastosProyectoTable from "../components/proyectos/GastosProyectoTable";
import { ProgressSpinner } from "primereact/progressspinner";
import ControlCambiosTable from "../components/proyectos/ControlCambiosTable";


const AllInfoProyectPage = () => {
  const { id } = useParams(); 
  const dispatch = useDispatch();
  const { proyectoActual, loading, error } = useSelector(
    (state) => state.proyectos
  );
  const puedeGestionar = useHasRole(["CINTERNO", "CEXTERNO"]);
  const esResponsableProyecto = useHasRole(["FACULTAD", "GRUPO"]);
  const bloqueadoPorActaInicio = esResponsableProyecto && !proyectoActual?.tiene_acta_inicio;

  useEffect(() => {
    dispatch(fetchProyecto(id));
    // Cargar todos los datos relacionados al proyecto
    dispatch(fetchInvestigadoresPorProyecto(id));
    dispatch(fetchObjetivosPorProyecto(id));
    dispatch(fetchProductosPorProyecto(id));
    dispatch(fetchDocumentosPorProyecto(id));
  }, [dispatch, id]);

  if (loading && !proyectoActual) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <>
      <ProyectoInfo proyecto={proyectoActual} />
      <div className="card mt-4">
        {bloqueadoPorActaInicio && (
          <div className="alert alert-warning mt-3">
            CINTERNO aún no ha cargado el <strong>Acta de inicio</strong> del proyecto.
            Las acciones de investigadores, objetivos, productos, avance e informe de
            seguimiento se habilitan cuando ese documento quede registrado.
          </div>
        )}
        <TabView scrollable>
          {" "}
          {/* Añadimos scrollable para muchas pestañas */}
          <TabPanel header="Investigadores">
            <InvestigadoresProyectoTable proyectoId={id} readOnly={!puedeGestionar || bloqueadoPorActaInicio} />
          </TabPanel>
          <TabPanel header="Objetivos">
            <ObjetivosProyectoTable proyectoId={id} readOnly={!puedeGestionar || bloqueadoPorActaInicio} />
          </TabPanel>
          <TabPanel header="Control de Cambios">
            <ControlCambiosTable proyectoId={id} readOnly={!puedeGestionar || bloqueadoPorActaInicio} />
          </TabPanel>
          <TabPanel header="Productos">
            <ProductosProyectoTable proyectoId={id} readOnly={!puedeGestionar || bloqueadoPorActaInicio} />
          </TabPanel>
          <TabPanel header="Documentos">
            <DocumentosProyectoTable proyectoId={id} bloqueadoPorActaInicio={bloqueadoPorActaInicio}/>
          </TabPanel>
          {proyectoActual?.financiado && (
            <TabPanel header="Gastos y Presupuesto">
              <GastosProyectoTable proyectoId={id} />
            </TabPanel>
          )}
        </TabView>
      </div>
    </>
  );
};

export default AllInfoProyectPage;