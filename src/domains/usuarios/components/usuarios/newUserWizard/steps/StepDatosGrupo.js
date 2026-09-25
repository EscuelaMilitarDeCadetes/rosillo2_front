// src/domains/usuarios/components/usuarios/newUserWizard/steps/StepDatosGrupo.js
import React from "react";
import { Dropdown } from "primereact/dropdown";

const StepDatosGrupo = ({ formData, grupos, rolesGrupo, metadataLoading, onChange }) => (
  <div className="formgrid grid p-fluid">
    <div className="field col-12 md:col-6">
      <span className="p-float-label">
        <Dropdown inputId="grupo" value={formData.grupo} options={grupos} onChange={(e) => onChange(e, "grupo")}
          optionLabel="nombre_grupo" optionValue="id" filter placeholder="Seleccione un Grupo" loading={metadataLoading} />
        <label htmlFor="grupo">Grupo de Investigación</label>
      </span>
    </div>
    <div className="field col-12 md:col-6">
      <span className="p-float-label">
        <Dropdown inputId="rolGrupo" value={formData.rolGrupo} options={rolesGrupo} onChange={(e) => onChange(e, "rolGrupo")}
          optionLabel="cargo" optionValue="id" filter placeholder="Seleccione Rol en el Equipo" loading={metadataLoading} />
        <label htmlFor="rolGrupo">Rol en el Equipo</label>
      </span>
    </div>
  </div>
);

export default StepDatosGrupo;