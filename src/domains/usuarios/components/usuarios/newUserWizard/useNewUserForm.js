// src/domains/usuarios/components/usuarios/newUserWizard/useNewUserForm.js
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMetadata } from "../../../../../features/metadata/metadataSlice";
import { createUser } from "../../../../../features/usuarios/usuarioLifecycleSlice";
import { TIPOS_USUARIO_SOPORTE, resolverRolPlataforma } from "../../../../../features/usuarios/tipos_usuario_soporte";

/**
 * Encapsula todo el estado y la lógica de negocio del formulario de creación
 * de usuario (EsSoporte), independiente de cómo se presente (wizard u otro).
 * El componente contenedor sólo maneja la navegación entre pasos.
 */
export default function useNewUserForm(visible) {
  const dispatch = useDispatch();
  const { grados, roles, facultades, grupos, rolesGrupo, loading: metadataLoading } =
    useSelector((state) => state.metadata);
  const { loading: userCreationLoading, error: userCreationError } = useSelector((state) => state.usuarioLifecycle);

  const [tipoKey, setTipoKey] = useState(null);
  const [formData, setFormData] = useState({});
  const [validationError, setValidationError] = useState("");

  const tipoSeleccionado = useMemo(
    () => TIPOS_USUARIO_SOPORTE.find((t) => t.key === tipoKey) ?? null,
    [tipoKey]
  );
  const rolPlataformaResuelto = useMemo(
    () => resolverRolPlataforma(roles, tipoSeleccionado),
    [roles, tipoSeleccionado]
  );

  useEffect(() => {
    if (visible && grados.length === 0) {
      dispatch(fetchMetadata());
    }
  }, [visible, dispatch, grados.length]);

  const resetForm = () => {
    setTipoKey(null);
    setFormData({});
    setValidationError("");
  };

  const handleInputChange = (e, name) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleTipoChange = (e) => {
    setTipoKey(e.value);
    setFormData((prev) => ({
      grado: prev.grado, nombre: prev.nombre, apellido: prev.apellido,
      documento: prev.documento, celular: prev.celular, correo: prev.correo, cvlac: prev.cvlac,
    }));
    setValidationError("");
  };

  const validarPasoTipo = () => {
    if (!tipoSeleccionado) {
      setValidationError("Debe seleccionar un tipo de usuario.");
      return false;
    }
    if (!rolPlataformaResuelto) {
      setValidationError(
        `No se encontró en el sistema el rol de plataforma para "${tipoSeleccionado.label}". ` +
          `Verifique que exista un RolPlataforma cuyo nombre coincida (ver roles-plataforma en el backend).`
      );
      return false;
    }
    setValidationError("");
    return true;
  };

  const validarPasoDatosComunes = () => {
    const camposComunes = ["grado", "nombre", "apellido", "documento", "celular", "correo"];
    for (const campo of camposComunes) {
      if (!formData[campo]) {
        setValidationError(`El campo '${campo}' es obligatorio.`);
        return false;
      }
    }
    setValidationError("");
    return true;
  };

  const validarPasoDatosEspecificos = () => {
    if (tipoSeleccionado?.flujo === "facultad") {
      if (!formData.facultad) { setValidationError("La facultad es obligatoria para este tipo de usuario."); return false; }
      if (!formData.rolGrupo) { setValidationError("El rol dentro de la facultad es obligatorio."); return false; }
    }
    if (tipoSeleccionado?.flujo === "grupo") {
      if (!formData.grupo) { setValidationError("El grupo de investigación es obligatorio para este tipo de usuario."); return false; }
      if (!formData.rolGrupo) { setValidationError("El rol dentro del grupo es obligatorio."); return false; }
    }
    setValidationError("");
    return true;
  };

  const construirPayload = () => {
    const payload = {
      grado_id: formData.grado, nombre: formData.nombre, apellido: formData.apellido,
      documento: formData.documento, celular: formData.celular, correo: formData.correo,
      rol_plataforma_id: rolPlataformaResuelto.id,
    };
    if (formData.cvlac) payload.cvlac = formData.cvlac;
    if (tipoSeleccionado.flujo === "facultad") {
      payload.facultad_id = formData.facultad;
      payload.rol_grupo_id = formData.rolGrupo;
    }
    if (tipoSeleccionado.flujo === "grupo") {
      payload.grupo_id = formData.grupo;
      payload.rol_grupo_id = formData.rolGrupo;
    }
    return payload;
  };

  // Nota: usamos result.meta.requestStatus (convención estándar de RTK)
  // en vez de createUser.fulfilled.match(result), porque el action creator
  // ya no vive en el componente que consume este hook.
  const registrarUsuario = () =>
    dispatch(createUser({ endpoint: tipoSeleccionado.endpoint, payload: construirPayload() }));

  return {
    grados, facultades, grupos, rolesGrupo, metadataLoading,
    userCreationLoading, userCreationError,
    tipoKey, formData, tipoSeleccionado, rolPlataformaResuelto, validationError,
    handleInputChange, handleTipoChange, resetForm, registrarUsuario,
    validarPasoTipo, validarPasoDatosComunes, validarPasoDatosEspecificos,
  };
}