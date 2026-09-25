// src/domains/usuarios/components/usuarios/newUserWizard/steps/StepDatosFacultad.js
import React from "react";
import { Dropdown } from "primereact/dropdown";

const StepDatosFacultad = ({ formData, facultades, rolesGrupo, metadataLoading, onChange }) => (
  <div className="formgrid grid p-fluid">
    <div className="field col-12 md:col-6">
      <span className="p-float-label">
        <Dropdown inputId="facultad" value={formData.facultad} options={facultades} onChange={(e) => onChange(e, "facultad")}
          optionLabel="nombre_facultad" optionValue="id" filter placeholder="Seleccione una Facultad" loading={metadataLoading} />
        <label htmlFor="facultad">Facultad</label>
      </span>
    </div>
    <div className="field col-12 md:col-6">
      <span className="p-float-label">
        <Dropdown inputId="rolGrupo" value={formData.rolGrupo} options={rolesGrupo} onChange={(e) => onChange(e, "rolGrupo")}
          optionLabel="cargo" optionValue="id" filter placeholder="Seleccione Rol en la Facultad" loading={metadataLoading} />
        <label htmlFor="rolGrupo">Rol en la Facultad</label>
      </span>
    </div>
  </div>
);

export default StepDatosFacultad;