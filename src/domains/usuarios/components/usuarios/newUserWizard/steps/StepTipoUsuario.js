// src/domains/usuarios/components/usuarios/newUserWizard/steps/StepTipoUsuario.js
import React from "react";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { TIPOS_USUARIO_SOPORTE } from "../../../../../../features/usuarios/tipos_usuario_soporte";

const StepTipoUsuario = ({ tipoKey, tipoSeleccionado, rolPlataformaResuelto, metadataLoading, onChange }) => (
  <div className="p-fluid">
    <div className="field col-12">
      <span className="p-float-label">
        <Dropdown
          inputId="tipoUsuario" value={tipoKey} options={TIPOS_USUARIO_SOPORTE}
          onChange={onChange} optionLabel="label" optionValue="key"
          placeholder="Seleccione un tipo de usuario" loading={metadataLoading}
        />
        <label htmlFor="tipoUsuario">Tipo de usuario</label>
      </span>
    </div>
    {tipoSeleccionado && !rolPlataformaResuelto && !metadataLoading && (
      <Message
        severity="warn" className="mt-2 w-full"
        text={`No se encontró el rol de plataforma "${tipoSeleccionado.label}" en el sistema. No se podrá registrar hasta que exista en RolPlataforma.`}
      />
    )}
  </div>
);

export default StepTipoUsuario;