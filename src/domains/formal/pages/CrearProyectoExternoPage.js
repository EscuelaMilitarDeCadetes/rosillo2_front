// src/domains/formal/pages/CrearProyectoExternoPage.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import axiosInstance from "../../../api/axiosInstance";
import { crearProyectoExterno } from "../../../features/proyectos/proyectosSlice";
import {
  addDocumentoProyecto,
  fetchTiposDocumentoProyecto,
} from "../../../features/proyectos/documentosSlice";
import { fetchGerenteActual } from "../../../features/gerentes/gerentesSlice";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const SIN_PAGINAR = { params: { page_size: 200 } };

const OPCIONES_ENTIDAD = [
  { label: "CRI - Centro de Rehabilitación Inclusiva", value: "CRI" },
  { label: `COATE - Comando de Apoyo Tecnológico`, value: "COATE" },
  { label: "COTEF - Comando de Transformación del Ejército del Futuro", value: "COTEF" },
  { label: "DITEC - Dirección de Ciencia y Tecnología", value: "DITEC" },
  { label: "MINCIENCIAS - Ministerio de Ciencia Tecnología e Innovación", value: "MINCIENCIAS" },
];

const FORM_INICIAL = {
  entidad: null,
  titulo: "",
  unidadEjecutora: "",
  lineaInvestigacion: "",
  financiado: false,
  valorSolicitado: 0,
  alianza: false,
  grupoInvestigacion: null,
  facultad: null,
  docProyecto: null,
  docCarta: null,
  docAlianza: null,
};


const CrearProyectoExternoPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = React.useRef(null);

  const { user } = useSelector((state) => state.auth);
  const { actual: gerenteActual, actualLoading } = useSelector((state) => state.gerentes);
  const { tiposDocumentoProyecto } = useSelector((state) => state.documentos);

  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const [grupos, setGrupos] = useState([]);
  const [facultadesDelGrupo, setFacultadesDelGrupo] = useState([]);
  const [cargandoFacultades, setCargandoFacultades] = useState(false);

  useEffect(() => {
    dispatch(fetchGerenteActual());
    dispatch(fetchTiposDocumentoProyecto());
    axiosInstance
      .get("institucional/grupos/", SIN_PAGINAR)
      .then((res) => setGrupos(res.data.results ?? res.data))
      .catch(() =>
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron cargar los grupos de investigación.",
        })
      );
  }, [dispatch]);

  // Cada vez que cambia el grupo elegido, se recalculan las facultades
  // asociadas (si el grupo es transversal.
  useEffect(() => {
    if (!form.grupoInvestigacion) {
      setFacultadesDelGrupo([]);
      return;
    }
    setCargandoFacultades(true);
    axiosInstance
      .get("institucional/facultades/por-grupo/", { params: { grupo_id: form.grupoInvestigacion } })
      .then((res) => {
        const facultades = res.data;
        setFacultadesDelGrupo(facultades);
        setCampo("facultad", facultades.length === 1 ? facultades[0].id : null);
      })
      .catch(() =>
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron cargar las facultades del grupo seleccionado.",
        })
      )
      .finally(() => setCargandoFacultades(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.grupoInvestigacion]);

  const setCampo = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const validar = () => {
    if (!form.entidad || !form.titulo.trim() || !form.unidadEjecutora.trim() || !form.lineaInvestigacion.trim()) {
      setError("Complete entidad, título, unidad ejecutora y línea de investigación.");
      return false;
    }
    if (!form.grupoInvestigacion) {
      setError("Debe seleccionar el grupo de investigación responsable del proyecto.");
      return false;
    }
    if (facultadesDelGrupo.length > 1 && !form.facultad) {
      setError("Debe seleccionar la facultad responsable dentro de este grupo.");
      return false;
    }
    if (!form.docProyecto) {
      setError("Debe adjuntar el documento del proyecto.");
      return false;
    }
    if (form.docProyecto.type !== "application/pdf") {
      setError("El documento del proyecto debe ser un PDF.");
      return false;
    }
    if (form.docCarta && form.docCarta.type !== "application/pdf") {
      setError("El documento de carta debe ser un PDF.");
      return false;
    }
    if (form.alianza && form.docAlianza && form.docAlianza.type !== "application/pdf") {
      setError("El documento de alianza debe ser un PDF.");
      return false;
    }
    if (!gerenteActual) {
      setError("No hay un gerente vigente registrado; no es posible crear el proyecto. Contacte a soporte.");
      return false;
    }
    return true;
  };

  const subirDocumentos = async (proyectoId) => {
    const documentos = [
      { nombre: "Proyecto", archivo: form.docProyecto },
      { nombre: "Carta de Postulación", archivo: form.docCarta },
      ...(form.alianza ? [{ nombre: "Alianzas", archivo: form.docAlianza }] : []),
    ];
    for (const doc of documentos) {
      if (!doc.archivo) continue;
      const tipoDocumentoId = tiposDocumentoProyecto.find(
        (td) => td.nombre_documento === doc.nombre
      )?.id;
      if (!tipoDocumentoId) continue;
      try {
        await dispatch(
          addDocumentoProyecto({
            proyectoId,
            data: { tipo_documento: tipoDocumentoId, documento_file: doc.archivo },
          })
        ).unwrap();
      } catch {
        toast.current?.show({
          severity: "warn",
          summary: "Documento no subido",
          detail: `El proyecto se creó, pero '${doc.nombre}' no se pudo subir. Puede intentarlo de nuevo desde el detalle del proyecto.`,
        });
      }
    }
  };

  const handleShowConfirmation = () => {
    setError("");
    if (validar()) {
      setIsConfirmVisible(true);
    }
  };

  const handleConfirmCreate = async () => {
    setGuardando(true);
    try {
      const proyecto = await dispatch(
        crearProyectoExterno({
          usuario: user.id,
          gerente: gerenteActual.id,
          titulo: form.titulo.trim(),
          unidad_ejecutora: form.unidadEjecutora.trim(),
          linea_investigacion: form.lineaInvestigacion.trim(),
          entidad: form.entidad,
          valor_solicitado: form.financiado ? form.valorSolicitado || 0 : 0,
          alianza: form.alianza,
          financiado: form.financiado,
          grupo_investigacion: form.grupoInvestigacion,
          facultad: facultadesDelGrupo.length > 0 ? form.facultad : null,
        })
      ).unwrap();
      await subirDocumentos(proyecto.id);
      setIsConfirmVisible(false);
      toast.current?.show({
        severity: "success",
        summary: "Proyecto externo creado",
        detail: "El proyecto se creó y quedó aprobado automáticamente.",
      });
      navigate("/proyectos?tipo=externo");
    } catch (err) {
      setIsConfirmVisible(false);
      toast.current?.show({
        severity: "error",
        summary: "Error al crear proyecto externo",
        detail: typeof err === "string" ? err : "No se pudo crear el proyecto externo.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const opcionesGrupo = grupos.filter((g) => !!g.clasificacion_grupo);
  const nombreGrupoSeleccionado = grupos.find((g) => g.id === form.grupoInvestigacion)?.nombre_grupo;
  const nombreFacultadSeleccionada = facultadesDelGrupo.find((f) => f.id === form.facultad)?.nombre_facultad;

  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <Toast ref={toast} />
      <h3 className="mb-3 text-center">Proyectos Externos</h3>
      <p className="text-center">Señor usuario a continuación registre los datos del proyecto</p>

      <div className="border rounded p-4 mt-4">
        <h5 className="mb-3">Formulario de creación de proyecto externo</h5>

        {!actualLoading && !gerenteActual && (
          <div className="alert alert-warning">
            No hay un gerente vigente registrado en la plataforma. No podrá guardar el
            proyecto hasta que soporte asigne uno.
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="field mb-3">
          <label className="form-label d-block">Entidad</label>
          <Dropdown
            className="w-100"
            options={OPCIONES_ENTIDAD}
            value={form.entidad}
            onChange={(e) => setCampo("entidad", e.value)}
            placeholder="Seleccione una entidad"
          />
        </div>

        <div className="field mb-3">
          <label className="form-label d-block">Unidad Ejecutora</label>
          <InputText
            className="w-100"
            value={form.unidadEjecutora}
            onChange={(e) => setCampo("unidadEjecutora", e.target.value)}
          />
        </div>

        <div className="field mb-3">
          <label className="form-label d-block">Línea de Investigación</label>
          <InputText
            className="w-100"
            value={form.lineaInvestigacion}
            onChange={(e) => setCampo("lineaInvestigacion", e.target.value)}
          />
        </div>

        <div className="field mb-3">
          <label className="form-label d-block">Título</label>
          <InputText
            className="w-100"
            value={form.titulo}
            onChange={(e) => setCampo("titulo", e.target.value)}
          />
        </div>

        <div className="field mb-3 d-flex align-items-center gap-2">
          <Checkbox
            inputId="financiado"
            checked={form.financiado}
            onChange={(e) => setCampo("financiado", e.checked)}
          />
          <label htmlFor="financiado" className="form-label mb-0">Financiado</label>
        </div>

        {form.financiado && (
          <div className="field mb-3">
            <label className="form-label d-block">Monto Solicitado</label>
            <InputNumber
              className="w-100"
              value={form.valorSolicitado}
              onValueChange={(e) => setCampo("valorSolicitado", e.value)}
              mode="currency"
              currency="COP"
              locale="es-CO"
            />
          </div>
        )}

        <div className="field mb-3 d-flex align-items-center gap-2">
          <Checkbox
            inputId="alianza"
            checked={form.alianza}
            onChange={(e) => setCampo("alianza", e.checked)}
          />
          <label htmlFor="alianza" className="form-label mb-0">Alianza</label>
        </div>

        <div className="field mb-3">
          <label className="form-label d-block">Grupo de investigación</label>
          <Dropdown
            className="w-100"
            options={opcionesGrupo}
            optionLabel="nombre_grupo"
            optionValue="id"
            value={form.grupoInvestigacion}
            onChange={(e) => setCampo("grupoInvestigacion", e.value)}
            placeholder="Seleccione un grupo de investigación"
            filter
          />
        </div>

        {form.grupoInvestigacion && facultadesDelGrupo.length > 1 && (
          <div className="field mb-3">
            <label className="form-label d-block">Facultad</label>
            <Dropdown
              className="w-100"
              options={facultadesDelGrupo}
              optionLabel="nombre_facultad"
              optionValue="id"
              value={form.facultad}
              onChange={(e) => setCampo("facultad", e.value)}
              placeholder="Seleccione una facultad"
              disabled={cargandoFacultades}
            />
          </div>
        )}

        <div className="field mb-3">
          <label className="form-label d-block">Documento proyecto (PDF, requerido)</label>
          <FileUpload
            name="docProyecto"
            customUpload
            uploadHandler={(e) => setCampo("docProyecto", e.files[0])}
            chooseLabel="Seleccionar"
            mode="basic"
            auto
            accept=".pdf"
            maxFileSize={15000000}
          />
          {form.docProyecto && <small className="ms-2">{form.docProyecto.name}</small>}
        </div>

        <div className="field mb-3">
          <label className="form-label d-block">Documento carta (PDF, opcional)</label>
          <FileUpload
            name="docCarta"
            customUpload
            uploadHandler={(e) => setCampo("docCarta", e.files[0])}
            chooseLabel="Seleccionar"
            mode="basic"
            auto
            accept=".pdf"
            maxFileSize={15000000}
          />
          {form.docCarta && <small className="ms-2">{form.docCarta.name}</small>}
        </div>

        {form.alianza && (
          <div className="field mb-3">
            <label className="form-label d-block">Documento Alianza (PDF)</label>
            <FileUpload
              name="docAlianza"
              customUpload
              uploadHandler={(e) => setCampo("docAlianza", e.files[0])}
              chooseLabel="Seleccionar"
              mode="basic"
              auto
              accept=".pdf"
              maxFileSize={15000000}
            />
            {form.docAlianza && <small className="ms-2">{form.docAlianza.name}</small>}
          </div>
        )}

        <div className="text-center mt-4">
          <Button
            label="Registrar"
            className="p-button-success"
            onClick={handleShowConfirmation}
          />
        </div>
      </div>
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmCreate}
        header="Confirmar Creación de Proyecto Externo"
        loading={guardando}
      >
        <h6>Resumen del proyecto externo:</h6>
        <ul>
          <li><strong>Entidad:</strong> {OPCIONES_ENTIDAD.find((o) => o.value === form.entidad)?.label}</li>
          <li><strong>Título:</strong> {form.titulo}</li>
          <li><strong>Unidad Ejecutora:</strong> {form.unidadEjecutora}</li>
          <li><strong>Línea de Investigación:</strong> {form.lineaInvestigacion}</li>
          <li><strong>Grupo de investigación:</strong> {nombreGrupoSeleccionado}</li>
          {facultadesDelGrupo.length > 0 && (
            <li><strong>Facultad:</strong> {nombreFacultadSeleccionada}</li>
          )}
          <li><strong>¿Financiado?:</strong> {form.financiado ? "Sí" : "No"}</li>
          {form.financiado && <li><strong>Monto Solicitado:</strong> {form.valorSolicitado}</li>}
          <li><strong>¿Alianza?:</strong> {form.alianza ? "Sí" : "No"}</li>
          <li><strong>Documento proyecto:</strong> {form.docProyecto?.name || "N/A"}</li>
          <li><strong>Documento carta:</strong> {form.docCarta?.name || "N/A"}</li>
          {form.alianza && <li><strong>Documento alianza:</strong> {form.docAlianza?.name || "N/A"}</li>}
        </ul>
      </ConfirmationModal>
    </div>
  );
};

export default CrearProyectoExternoPage;