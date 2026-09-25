// src/domains/usuarios/components/usuarios/newUserWizard/steps/StepDatosComunes.js
import React from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

const StepDatosComunes = ({ formData, grados, metadataLoading, onChange }) => (
  <div className="formgrid grid p-fluid">
    <div className="field col-12 md:col-6">
      <span className="p-float-label">
        <Dropdown inputId="grado" value={formData.grado} options={grados} onChange={(e) => onChange(e, "grado")}
          optionLabel="descripcion" optionValue="id" filter placeholder="Seleccione un Grado" loading={metadataLoading} />
        <label htmlFor="grado">Grado</label>
      </span>
    </div>
    <div className="field col-12 md:col-6">
      <span className="p-float-label">
        <InputText id="nombre" value={formData.nombre || ""} onChange={(e) => onChange(e, "nombre")} />
        <label htmlFor="nombre">Nombre</label>
      </span>
    </div>
    <div className="field col-12 md:col-6">
      <span className="p-float-label">
        <InputText id="apellido" value={formData.apellido || ""} onChange={(e) => onChange(e, "apellido")} />
        <label htmlFor="apellido">Apellido</label>
      </span>
    </div>
    <div className="field col-12 md:col-6">
      <span className="p-float-label">
        <InputText id="documento" keyfilter="int" value={formData.documento || ""} onChange={(e) => onChange(e, "documento")} />
        <label htmlFor="documento">Documento</label>
      </span>
    </div>
    <div className="field col-12 md:col-6">
      <span className="p-float-label">
        <InputText id="celular" keyfilter="int" value={formData.celular || ""} onChange={(e) => onChange(e, "celular")} />
        <label htmlFor="celular">Celular</label>
      </span>
    </div>
    <div className="field col-12 md:col-6">
      <span className="p-float-label">
        <InputText id="correo" type="email" value={formData.correo || ""} onChange={(e) => onChange(e, "correo")} />
        <label htmlFor="correo">Correo Institucional</label>
      </span>
    </div>
    <div className="field col-12">
      <span className="p-float-label">
        <InputText id="cvlac" value={formData.cvlac || ""} onChange={(e) => onChange(e, "cvlac")} />
        <label htmlFor="cvlac">CVLAC (Opcional)</label>
      </span>
    </div>
  </div>
);

export default StepDatosComunes;