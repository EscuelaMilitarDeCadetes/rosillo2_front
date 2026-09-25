// src/domains/formal/components/proyectos/SegProyectosTable.js
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import axiosInstance from "../../../../api/axiosInstance";
import { fetchProjects, fetchOpcionesFiltroProyectos } from "../../../../features/proyectos/proyectosSlice";
import InvestigadoresProyectoTable from "./InvestigadoresProyectoTable";
import ProductosProyectoTable from "./ProductosProyectoTable";
import { SIN_PAGINAR, OPCIONES_CALIFICACION } from "./segProyectos/formatters";
import useProyectoDetalles from "./segProyectos/useProyectoDetalles";
import { buildSegProyectosColumns } from "./segProyectos/segProyectosColumns";

const SegProyectosTable = () => {
  const dispatch = useDispatch();
  const { filteredProjects, totalProjects, loading, opcionesFiltro } = useSelector((state) => state.proyectos);
  const [facultades, setFacultades] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [filtros, setFiltros] = useState({
    convocatoria: "", codigo: "", titulo: "", financiado: null, alianza: null,
    responsable: null, calificacion: null, anio_inicio: null, anio_fin: null,
    interno: null, gruplac: null, estado: null,
  });
  const [page, setPage] = useState(1);
  const [modalInvestigadoresVisible, setModalInvestigadoresVisible] = useState(false);
  const [modalProductosVisible, setModalProductosVisible] = useState(false);
  const [proyectoIdModal, setProyectoIdModal] = useState(null);
  const [exportando, setExportando] = useState(null);  

  const { cargandoDetalles, detalle } = useProyectoDetalles(filteredProjects);

  useEffect(() => {
    Promise.all([
      axiosInstance.get("institucional/facultades/", SIN_PAGINAR),
      axiosInstance.get("institucional/grupos/", SIN_PAGINAR),
    ]).then(([resFac, resGru]) => {
      setFacultades(resFac.data.results ?? resFac.data);
      setGrupos(resGru.data.results ?? resGru.data);
    });
  }, []);

  useEffect(() => {
    dispatch(fetchProjects({ ...filtros, page }));
  }, [dispatch, filtros, page]);

  useEffect(() => {
    dispatch(fetchOpcionesFiltroProyectos());
  }, [dispatch]);

  const opcionesResponsable = useMemo(
    () => [
      ...facultades.map((f) => ({ label: f.abreviatura, value: `FAC:${f.abreviatura}` })),
      ...grupos.map((g) => ({ label: g.sigla_grupo, value: `GRU:${g.sigla_grupo}` })),
    ],
    [facultades, grupos]
  );

  const setFiltro = (campo, valor) => {
    setPage(1);
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const abrirInvestigadores = (row) => { setProyectoIdModal(row.proyecto); setModalInvestigadoresVisible(true); };
  const abrirProductos = (row) => { setProyectoIdModal(row.proyecto); setModalProductosVisible(true); };

  const handleExport = async (tipo) => {
    setExportando(tipo);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== null && v !== undefined && v !== ""))
      ).toString();
      const response = await axiosInstance.get(
        `investigacion-formal/proyecto-convocatoria/export/${tipo}/?${params}`,
        { responseType: "blob" }
      );
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = tipo === "excel" ? "proyectos.xlsx" : "proyectos.pdf";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExportando(null);
    }
  };

  const columnas = useMemo(
    () => buildSegProyectosColumns({ detalle, cargandoDetalles, onVerInvestigadores: abrirInvestigadores, onVerProductos: abrirProductos }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [detalle, cargandoDetalles]
  );

  return (
    <div className="container-fluid mt-4">
      <div className="text-center mb-4">
        <h4>SEGUIMIENTO Y CONTROL</h4>
        <h6>A PROYECTOS</h6>
        <p>
          Señor usuario este módulo tiene la posibilidad de realizar seguimiento a todos los
          proyectos de investigación tanto internos como externos registrados en la ESMIC
        </p>
      </div>
      <div className="d-flex justify-content-center gap-2 mb-4">
        <Button label="Descargar Excel" icon="pi pi-file-excel" className="p-button-info" loading={exportando === "excel"} onClick={() => handleExport("excel")} />
        <Button label="Descargar PDF" icon="pi pi-file-pdf" className="p-button-info" loading={exportando === "pdf"} onClick={() => handleExport("pdf")} />
      </div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <Dropdown placeholder="Convocatoria" options={opcionesFiltro.convocatorias} value={filtros.convocatoria} onChange={(e) => setFiltro("convocatoria", e.value)} showClear />
        <InputText placeholder="Código" value={filtros.codigo} onChange={(e) => setFiltro("codigo", e.target.value)} />
        <InputText placeholder="Título" value={filtros.titulo} onChange={(e) => setFiltro("titulo", e.target.value)} />
        <Dropdown placeholder="Financiado" options={[{ label: "Sí", value: true }, { label: "No", value: false }]} value={filtros.financiado} onChange={(e) => setFiltro("financiado", e.value)} showClear />
        <Dropdown placeholder="Alianza" options={[{ label: "Sí", value: true }, { label: "No", value: false }]} value={filtros.alianza} onChange={(e) => setFiltro("alianza", e.value)} showClear />
        <Dropdown placeholder="Responsable" options={opcionesResponsable} value={filtros.responsable} onChange={(e) => setFiltro("responsable", e.value)} showClear />
        <Dropdown placeholder="Calificación" options={OPCIONES_CALIFICACION} value={filtros.calificacion} onChange={(e) => setFiltro("calificacion", e.value)} showClear />
        <Dropdown placeholder="Año Convocatoria" options={opcionesFiltro.aniosConvocatoria} value={filtros.anio_convocatoria} onChange={(e) => setFiltro("anio_convocatoria", e.value)} showClear />
        <Dropdown placeholder="Año inicio" options={opcionesFiltro.aniosInicio} value={filtros.anio_inicio} onChange={(e) => setFiltro("anio_inicio", e.value)} showClear />
        <Dropdown placeholder="Año fin" options={opcionesFiltro.aniosFin} value={filtros.anio_fin} onChange={(e) => setFiltro("anio_fin", e.value)} showClear />
        <Dropdown placeholder="Tipo de convocatoria" options={[{ label: "Interna", value: true }, { label: "Externa", value: false }]} value={filtros.interno} onChange={(e) => setFiltro("interno", e.value)} showClear />
        <Dropdown placeholder="GruLAC" options={[{ label: "Sí", value: true }, { label: "No", value: false }]} value={filtros.gruplac} onChange={(e) => setFiltro("gruplac", e.value)} showClear />
        <Dropdown placeholder="Estado" options={[{ label: "En curso", value: true }, { label: "Finalizado", value: false }]} value={filtros.estado} onChange={(e) => setFiltro("estado", e.value)} showClear />
      </div>
      <DataTable
        value={filteredProjects} loading={loading} paginator rows={10} totalRecords={totalProjects}
        lazy first={(page - 1) * 10} onPage={(e) => setPage(e.page + 1)}
        emptyMessage="No hay registros disponibles." responsiveLayout="scroll" scrollable
      >
        {columnas.map((col) => (
          <Column key={col.key} field={col.field} header={col.header} body={col.body} />
        ))}
      </DataTable>
      <Dialog header="Investigadores del proyecto" visible={modalInvestigadoresVisible} style={{ width: "60vw" }} onHide={() => setModalInvestigadoresVisible(false)}>
        {proyectoIdModal && <InvestigadoresProyectoTable proyectoId={proyectoIdModal} />}
      </Dialog>
      <Dialog header="Productos del proyecto" visible={modalProductosVisible} style={{ width: "60vw" }} onHide={() => setModalProductosVisible(false)}>
        {proyectoIdModal && <ProductosProyectoTable proyectoId={proyectoIdModal} />}
      </Dialog>
    </div>
  );
};

export default SegProyectosTable;