// src/domains/usuarios/components/usuarios/newUserWizard/steps/StepResumen.js
import React from "react";

const StepResumen = ({ tipoSeleccionado, rolPlataformaResuelto, formData, grados, facultades, grupos, rolesGrupo }) => (
  <>
    <h6>Resumen de datos ingresados:</h6>
    <ul>
      <li><strong>Tipo de usuario:</strong> {tipoSeleccionado?.label || "N/A"}</li>
      <li><strong>Grado:</strong> {grados.find((g) => g.id === formData.grado)?.descripcion || "N/A"}</li>
      <li><strong>Nombre:</strong> {formData.nombre || "N/A"}</li>
      <li><strong>Apellido:</strong> {formData.apellido || "N/A"}</li>
      <li><strong>Documento:</strong> {formData.documento || "N/A"}</li>
      <li><strong>Correo:</strong> {formData.correo || "N/A"}</li>
      <li><strong>Rol en plataforma:</strong> {rolPlataformaResuelto?.nombre_rol || "N/A"}</li>
      {tipoSeleccionado?.flujo === "facultad" && (
        <>
          <li><strong>Facultad:</strong> {facultades.find((f) => f.id === formData.facultad)?.nombre_facultad || "N/A"}</li>
          <li><strong>Rol en la facultad:</strong> {rolesGrupo.find((r) => r.id === formData.rolGrupo)?.cargo || "N/A"}</li>
        </>
      )}
      {tipoSeleccionado?.flujo === "grupo" && (
        <>
          <li><strong>Grupo:</strong> {grupos.find((g) => g.id === formData.grupo)?.nombre_grupo || "N/A"}</li>
          <li><strong>Rol en el equipo:</strong> {rolesGrupo.find((r) => r.id === formData.rolGrupo)?.cargo || "N/A"}</li>
        </>
      )}
    </ul>
    <p className="text-sm text-color-secondary">
      La contraseña temporal se generará automáticamente y se enviará por correo al usuario.
    </p>
  </>
);

export default StepResumen;