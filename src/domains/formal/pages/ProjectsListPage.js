// src/domains/formal/pages/ProjectsListPage.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import {
  fetchMisProyectos,
  fetchProyectosPorFacultad,
  fetchProyectosPorGrupo,
  fetchOpcionesFiltroProyectos,
  updateProjectDates,
} from "../../../features/proyectos/proyectosSlice";
import { asignarContrapartida, updateBudget } from "../../../features/proyectos/montoSlice";
import useHasRole from "../../../hooks/useHasRole";
import useProjectFilters from "../../../hooks/useProjectFilters";
import useOpcionesResponsable from "../../../hooks/useOpcionesResponsable";
import RegisterInvestigatorModal from "../components/proyectos/RegisterInvestigatorModal";
import AddInvestigadorProyectoModal from "../components/proyectos/AddInvestigadorProyectoModal";
import AddProductoProyectoModal from "../components/proyectos/AddProductProjectModal";
import AddObjetivoModal from "../components/proyectos/AddObjetivoModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const ESTADO_A_CALIFICACION = {
  aprobado: "APROBADO",
  rechazado: "NO_APROBADO",
};

const ProjectsListPage = () => {
  const dispatch = useDispatch();
  const toast = React.useRef(null);
  const [searchParams] = useSearchParams();
  const estadoParam = searchParams.get("estado"); // 'aprobado' | 'rechazado' | null
  const tipoParam = searchParams.get("tipo"); // 'externo' | null
  const rolParam = searchParams.get("rol"); // 'supervisor' | 'facultad' | 'grupo' | null
  const esModoExterno = tipoParam === "externo";

  const calificacion = esModoExterno
    ? "APROBADO"
    : ESTADO_A_CALIFICACION[estadoParam] || null;

  const puedeGestionar = useHasRole(
    esModoExterno
      ? ["CEXTERNO"]
      : ["CINTERNO", "CEXTERNO", "FACULTAD", "GRUPO"]
  );

  const { filteredProjects, totalProjects, loading, proyectosPorRol, loadingProyectosPorRol, opcionesFiltro } = useSelector(
    (state) => state.proyectos
  );
  const { facultadId, grupoId } = useSelector((state) => state.auth);

  const { filtros, setFiltros, page, setPage, recargar } = useProjectFilters({ calificacion, esModoExterno, rolParam });
  const { opcionesResponsableAgrupadas } = useOpcionesResponsable();

  const [modalMontoVisible, setModalMontoVisible] = useState(false);
  const [modalFechasVisible, setModalFechasVisible] = useState(false);
  const [modalInvestigadorVisible, setModalInvestigadorVisible] = useState(false);
  const [modalRegistrarInvestigadorVisible, setModalRegistrarInvestigadorVisible] = useState(false);
  const [modalProductoVisible, setModalProductoVisible] = useState(false);
  const [modalObjetivoVisible, setModalObjetivoVisible] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [proyectoIdAccion, setProyectoIdAccion] = useState(null);
  const [aprobado, setAprobado] = useState(0);
  const [contrapartida, setContrapartida] = useState(0);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [fechasError, setFechasError] = useState("");
  const [isConfirmFechasVisible, setIsConfirmFechasVisible] = useState(false);
  const [modalContrapartidaVisible, setModalContrapartidaVisible] = useState(false);

  const datosTabla = rolParam ? proyectosPorRol : filteredProjects;
  const cargandoTabla = rolParam ? loadingProyectosPorRol : loading;

  const recargarLista = () => {
    if (rolParam === "supervisor") dispatch(fetchMisProyectos());
    else if (rolParam === "facultad" && facultadId) dispatch(fetchProyectosPorFacultad(facultadId));
    else if (rolParam === "grupo" && grupoId) dispatch(fetchProyectosPorGrupo(grupoId));
    else recargar();
  };

  useEffect(() => {
    if (rolParam === "supervisor") {
      dispatch(fetchMisProyectos());
    } else if (rolParam === "facultad" && facultadId) {
      dispatch(fetchProyectosPorFacultad(facultadId));
    } else if (rolParam === "grupo" && grupoId) {
      dispatch(fetchProyectosPorGrupo(grupoId));
    }
  }, [dispatch, rolParam, facultadId, grupoId]);  

  useEffect(() => {
    dispatch(fetchOpcionesFiltroProyectos());
  }, [dispatch]);

  const abrirModalMonto = (rowData) => {
    setProyectoSeleccionado(rowData);
    setAprobado(0);
    setContrapartida(0);
    setModalMontoVisible(true);
  };

  const abrirModalContrapartida = (row) => {
    setProyectoSeleccionado(row);
    setContrapartida(row.monto_contrapartida ?? 0);
    setModalContrapartidaVisible(true);
  };

  const abrirModalFechas = (rowData) => {
    setProyectoSeleccionado(rowData);
    setFechaInicio(null);
    setFechaFin(null);
    setFechasError("");
    setModalFechasVisible(true);
  };

  const abrirModalInvestigador = (rowData) => {
    setProyectoIdAccion(rowData.proyecto);
    setModalInvestigadorVisible(true);
  };

  const abrirModalRegistrarNuevoInvestigador = () => {
    setModalInvestigadorVisible(false);
    setModalRegistrarInvestigadorVisible(true);
  };

  const abrirModalProducto = (rowData) => {
    setProyectoIdAccion(rowData.proyecto);
    setModalProductoVisible(true);
  };

  const abrirModalObjetivo = (rowData) => {
    setProyectoIdAccion(rowData.proyecto);
    setModalObjetivoVisible(true);
  };

  const confirmarMonto = () => {
    dispatch(
      updateBudget({
        montoId: proyectoSeleccionado.monto_id,
        data: { aprobado, contrapartida },
      })
    )
      .unwrap()
      .then(() => {
        toast.current?.show({ severity: "success", summary: "Monto asignado" });
        setModalMontoVisible(false);
        recargarLista();
      })
      .catch((err) =>
        toast.current?.show({ severity: "error", summary: "Error", detail: err })
      );
  };

  const validarFechas = () => {
    if (!fechaInicio || !fechaFin) {
      setFechasError("Debe ingresar la fecha de inicio y la fecha de finalización.");
      return false;
    }
    setFechasError("");
    return true;
  };

  const handleShowConfirmacionFechas = () => {
    if (validarFechas()) {
      setModalFechasVisible(false);
      setIsConfirmFechasVisible(true);
    }
  };

  const confirmarFechas = () => {
    dispatch(
      updateProjectDates({
        proyectoId: proyectoSeleccionado.proyecto,
        data: {
          fecha_inicio: fechaInicio?.toISOString().slice(0, 10),
          fecha_fin: fechaFin?.toISOString().slice(0, 10),
        },
      })
    )
      .unwrap()
      .then(() => {
        toast.current?.show({ severity: "success", summary: "Fechas asignadas" });
        setIsConfirmFechasVisible(false);
        recargarLista();
      })
      .catch((err) => {
        toast.current?.show({ severity: "error", summary: "Error", detail: err });
        setIsConfirmFechasVisible(false);
      });
  };

  const confirmarContrapartida = () => {
    dispatch(asignarContrapartida({ montoId: proyectoSeleccionado.monto_id, contrapartida: contrapartida ?? 0 }))
      .unwrap()
      .then(() => {
        toast.current?.show({ severity: "success", summary: "Contrapartida asignada" });
        setModalContrapartidaVisible(false);
        recargarLista();
      })
      .catch((err) => toast.current?.show({ severity: "error", summary: "Error", detail: err }));
  };

  const montoFormateado = (valor) =>
    valor != null
      ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(valor)
      : "N/A";

  const montoTemplate = (row) =>
    row.monto_aprobado != null
      ? montoFormateado(row.monto_aprobado)
      : "No asignado";

  const tituloTemplate = (row) => (
    <Link to={`/proyectos/${row.proyecto}`} className="text-decoration-none">
      {row.proyecto_titulo}
    </Link>
  );

  const accionesTemplateExterno = (row) => {
    if (!puedeGestionar) return null;
    return (
      <div className="d-flex flex-wrap gap-2">
        {!row.proyecto_fecha_inicio && (
          <Button
            label="Asignar Tiempos"
            className="p-button-sm p-button-secondary"
            onClick={() => abrirModalFechas(row)}
          />
        )}
        {row.monto_id && (
          <Button
            label={row.monto_contrapartida != null ? "Editar Contrapartida" : "Asignar Contrapartida"}
            className="p-button-sm p-button-success"
            onClick={() => abrirModalContrapartida(row)}
          />
        )}
        <Button
          label="Crear Investigadores"
          className="p-button-sm p-button-warning"
          onClick={() => abrirModalInvestigador(row)}
        />
        <Button
          label="Asignar Productos"
          className="p-button-sm p-button-info"
          onClick={() => abrirModalProducto(row)}
        />
        <Button
          label="Asignar Objetivos"
          className="p-button-sm p-button-help"
          onClick={() => abrirModalObjetivo(row)}
        />
      </div>
    );
  };

  const accionesTemplate = (row) => {
    if (!puedeGestionar) return null;
    const timelineAsignado = !!row.proyecto_fecha_inicio;
    const esVistaFacultadOGrupo = rolParam === "facultad" || rolParam === "grupo";

    return (
      <div className="d-flex flex-wrap gap-2">
        {calificacion === "APROBADO" && row.monto_solicitado && !row.monto_aprobado && (
          <Button
            label="Asignar Monto"
            className="p-button-sm p-button-info"
            onClick={() => abrirModalMonto(row)}
          />
        )}
        {calificacion === "APROBADO" && !timelineAsignado && (
          <Button
            label="Asignar Tiempos"
            className="p-button-sm p-button-secondary"
            onClick={() => abrirModalFechas(row)}
          />
        )}
        {esVistaFacultadOGrupo && timelineAsignado && (
          <>
            <Button
              label="Crear Investigadores"
              className="p-button-sm p-button-warning"
              onClick={() => abrirModalInvestigador(row)}
            />
            <Button
              label="Asignar Productos"
              className="p-button-sm p-button-info"
              onClick={() => abrirModalProducto(row)}
            />
            <Button
              label="Asignar Objetivos"
              className="p-button-sm p-button-help"
              onClick={() => abrirModalObjetivo(row)}
            />
          </>
        )}
      </div>
    );
  };

  const titulo = esModoExterno
    ? "Proyectos Externos Aprobados"
    : rolParam === "supervisor"
      ? "Mis Proyectos"
      : rolParam === "facultad"
        ? "Proyectos de mi Facultad"
        : rolParam === "grupo"
          ? "Proyectos de mi Grupo"
    : calificacion === "APROBADO"
      ? "Proyectos Aprobados"
      : calificacion === "NO_APROBADO"
        ? "Proyectos Rechazados"
        : "Proyectos";

  return (
    <div className="container-fluid mt-4">
      <Toast ref={toast} />
      <h4 className="mb-3">{titulo}</h4>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <Dropdown
          placeholder="Convocatoria"
          options={opcionesFiltro.convocatorias}
          value={filtros.convocatoria}
          onChange={(e) => setFiltros({ ...filtros, convocatoria: e.value })}
          filter
          showClear
        />
        <InputText
          placeholder="Código"
          value={filtros.codigo}
          onChange={(e) => setFiltros({ ...filtros, codigo: e.target.value })}
        />
        <InputText
          placeholder="Título"
          value={filtros.titulo}
          onChange={(e) => setFiltros({ ...filtros, titulo: e.target.value })}
        />
        <Dropdown
          placeholder="Financiado"
          options={[
            { label: "Sí", value: true },
            { label: "No", value: false },
          ]}
          value={filtros.financiado}
          onChange={(e) => setFiltros({ ...filtros, financiado: e.value })}
          showClear
        />
        <Dropdown
          placeholder="Responsable"
          options={opcionesResponsableAgrupadas}
          optionGroupLabel="label"
          optionGroupChildren="items"
          value={filtros.responsable}
          onChange={(e) => setFiltros({ ...filtros, responsable: e.value })}
          showClear
        />
        <Dropdown
          placeholder="Tiene Alianza"
          options={[
            { label: "Sí", value: true },
            { label: "No", value: false },
          ]}
          value={filtros.alianza}
          onChange={(e) => setFiltros({ ...filtros, alianza: e.value })}
          showClear
        />
        <Dropdown
          placeholder="Año convocatoria"
          options={opcionesFiltro.aniosConvocatoria}
          value={filtros.anio_convocatoria}
          onChange={(e) => setFiltros({ ...filtros, anio_convocatoria: e.value })}
          showClear
        />
        <Dropdown
          placeholder="Año de inicio"
          options={opcionesFiltro.aniosInicio}
          value={filtros.anio_inicio}
          onChange={(e) => setFiltros({ ...filtros, anio_inicio: e.value })}
          showClear
        />
        <Dropdown
          placeholder="Año de cierre"
          options={opcionesFiltro.aniosFin}
          value={filtros.anio_fin}
          onChange={(e) => setFiltros({ ...filtros, anio_fin: e.value })}
          showClear
        />
      </div>
      <DataTable
        value={datosTabla}
        loading={cargandoTabla}
        paginator
        rows={10}
        {...(!rolParam && {
          totalRecords: totalProjects,
          lazy: true,
          first: (page - 1) * 10,
          onPage: (e) => setPage(e.page + 1),
        })}
        emptyMessage="No hay registros disponibles."
        responsiveLayout="scroll"
      >
        <Column field="convocatoria_nombre" header="Convocatoria" />
        <Column field="convocatoria_anio" header="Año Convocatoria" />
        <Column field="proyecto_codigo" header="Código" />
        <Column header="Título" body={tituloTemplate} />
        {esModoExterno && (
          <Column
            header="Inicio"
            body={(r) =>
              r.proyecto_fecha_inicio
                ? new Date(r.proyecto_fecha_inicio + "T00:00:00").toLocaleDateString("es-CO")
                : "-"
            }
          />
        )}
        <Column header="Financiado" body={(r) => (r.proyecto_financiado ? "SI" : "NO")} />
        <Column header="Responsable" body={(r) => r.responsable ?? "-"} />
        <Column header="Valor Solicitado" body={(r) => montoFormateado(r.monto_solicitado)} />
        <Column header="Monto Aprobado" body={montoTemplate} />
        <Column header="Valor Contrapartida" body={(r) => montoFormateado(r.monto_contrapartida)} />
        <Column header="Valor Total" body={(r) => montoFormateado(r.monto_total)} />
        {esModoExterno && (
          <Column header="gruLAC" body={(r) => (r.proyecto_gruplac ? "SI" : "NO")} />
        )}
        {esModoExterno ? (
          <Column header="Acciones" body={accionesTemplateExterno} />
        ) : (
          (calificacion === "APROBADO" || rolParam === "facultad" || rolParam === "grupo") && (
            <Column header="Acciones" body={accionesTemplate} />
          )
        )}
      </DataTable>
      <Dialog
        header="Gestión del monto"
        visible={modalMontoVisible}
        onHide={() => setModalMontoVisible(false)}
      >
        <div className="mb-3">
          <label>Valor aprobado</label>
          <InputNumber
            value={aprobado}
            onValueChange={(e) => setAprobado(e.value)}
            mode="currency"
            currency="COP"
            locale="es-CO"
            className="w-100"
          />
        </div>
        <div className="mb-3">
          <label>Valor contrapartida</label>
          <InputNumber
            value={contrapartida}
            onValueChange={(e) => setContrapartida(e.value)}
            mode="currency"
            currency="COP"
            locale="es-CO"
            className="w-100"
          />
        </div>
        <Button label="Asignar Monto" className="p-button-success" onClick={confirmarMonto} />
      </Dialog>
      <Dialog 
        header="Valor de contrapartida" 
        visible={modalContrapartidaVisible}
        onHide={() => setModalContrapartidaVisible(false)} 
        style={{ width: "30rem" }}
      >
        <p className="mb-3">Monto aprobado: <strong>{montoFormateado(proyectoSeleccionado?.monto_aprobado)}</strong></p>
        <div className="mb-3">
          <label>Valor contrapartida</label>
          <InputNumber value={contrapartida} onValueChange={(e) => setContrapartida(e.value ?? 0)}
            mode="currency" currency="COP" locale="es-CO" minFractionDigits={0} className="w-100" />
        </div>
        <Button label="Guardar" className="p-button-success" onClick={confirmarContrapartida} />
      </Dialog>
      <Dialog
        header="Línea de Tiempo"
        visible={modalFechasVisible}
        onHide={() => { setModalFechasVisible(false); setFechasError(""); }}
      >
        <div className="mb-3">
          <label>Fecha de inicio</label>
          <Calendar
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.value)}
            dateFormat="yy-mm-dd"
            className="w-100"
          />
        </div>
        <div className="mb-3">
          <label>Fecha de finalización</label>
          <Calendar
            value={fechaFin}
            onChange={(e) => setFechaFin(e.value)}
            dateFormat="yy-mm-dd"
            className="w-100"
          />
        </div>
        {fechasError && <div className="alert alert-danger mt-2">{fechasError}</div>}
        <Button label="Cargar" className="p-button-success" onClick={handleShowConfirmacionFechas} />
      </Dialog>
      <ConfirmationModal
        visible={isConfirmFechasVisible}
        onHide={() => setIsConfirmFechasVisible(false)}
        onConfirm={confirmarFechas}
        header="Confirmar asignación de fechas"
        loading={loading}
      >
        <h6>Resumen de datos ingresados:</h6>
        <ul>
          <li><strong>Fecha de inicio:</strong> {fechaInicio ? fechaInicio.toLocaleDateString("es-CO") : "Vacío"}</li>
          <li><strong>Fecha de finalización:</strong> {fechaFin ? fechaFin.toLocaleDateString("es-CO") : "Vacío"}</li>
        </ul>
      </ConfirmationModal>
      <AddInvestigadorProyectoModal
        visible={modalInvestigadorVisible}
        onHide={() => setModalInvestigadorVisible(false)}
        proyectoId={proyectoIdAccion}
        onRegisterNewInvestigator={abrirModalRegistrarNuevoInvestigador}
        mostrarAsignados
      />
      <RegisterInvestigatorModal
        visible={modalRegistrarInvestigadorVisible}
        onHide={() => setModalRegistrarInvestigadorVisible(false)}
        proyectoId={proyectoIdAccion}
      />
      <AddProductoProyectoModal
        visible={modalProductoVisible}
        onHide={() => setModalProductoVisible(false)}
        proyectoId={proyectoIdAccion}
        mostrarAsignados
      />
      <AddObjetivoModal
        visible={modalObjetivoVisible}
        onHide={() => setModalObjetivoVisible(false)}
        proyectoId={proyectoIdAccion}
      />
    </div>
  );
};

export default ProjectsListPage;