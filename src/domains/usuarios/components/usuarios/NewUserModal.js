// src/domains/usuarios/components/usuarios/NewUserModal.js
import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Steps } from "primereact/steps";
import { Message } from "primereact/message";
import ConfirmationModal from "../../../../components/common/ConfirmationModal.js";
import useNewUserForm from "./newUserWizard/useNewUserForm";
import StepTipoUsuario from "./newUserWizard/steps/StepTipoUsuario";
import StepDatosComunes from "./newUserWizard/steps/StepDatosComunes";
import StepDatosFacultad from "./newUserWizard/steps/StepDatosFacultad";
import StepDatosGrupo from "./newUserWizard/steps/StepDatosGrupo";
import StepResumen from "./newUserWizard/steps/StepResumen";

/**
 * Modal de creación de usuario (rol EsSoporte), como wizard de 3 o 4 pasos:
 * el paso "Datos específicos" sólo aparece si tipoSeleccionado.flujo es
 * "facultad" o "grupo".
 */
const NewUserModal = ({ visible, onHide }) => {
  const [paso, setPaso] = useState(0);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const {
    grados, facultades, grupos, rolesGrupo, metadataLoading,
    userCreationLoading, userCreationError,
    tipoKey, formData, tipoSeleccionado, rolPlataformaResuelto, validationError,
    handleInputChange, handleTipoChange, resetForm, registrarUsuario,
    validarPasoTipo, validarPasoDatosComunes, validarPasoDatosEspecificos,
  } = useNewUserForm(visible);

  const tieneDatosEspecificos = tipoSeleccionado?.flujo === "facultad" || tipoSeleccionado?.flujo === "grupo";

  const pasos = useMemo(() => {
    const base = [{ label: "Tipo de usuario" }, { label: "Datos personales" }];
    if (tieneDatosEspecificos) base.push({ label: "Datos específicos" });
    base.push({ label: "Resumen" });
    return base;
  }, [tieneDatosEspecificos]);

  useEffect(() => {
    if (!visible) {
      setPaso(0);
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const indicePasoResumen = pasos.length - 1;
  const indicePasoEspecifico = tieneDatosEspecificos ? 2 : null;

  const validarPasoActual = () => {
    if (paso === 0) return validarPasoTipo();
    if (paso === 1) return validarPasoDatosComunes();
    if (paso === indicePasoEspecifico) return validarPasoDatosEspecificos();
    return true;
  };

  const irSiguiente = () => {
    if (!validarPasoActual()) return;
    setPaso((p) => Math.min(p + 1, indicePasoResumen));
  };
  const irAtras = () => setPaso((p) => Math.max(p - 1, 0));

  const handleShowConfirmation = () => {
    setIsConfirmVisible(true);
  };

  const handleRegister = () => {
    registrarUsuario().then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const renderPaso = () => {
    if (paso === 0) {
      return (
        <StepTipoUsuario
          tipoKey={tipoKey} tipoSeleccionado={tipoSeleccionado}
          rolPlataformaResuelto={rolPlataformaResuelto} metadataLoading={metadataLoading}
          onChange={handleTipoChange}
        />
      );
    }
    if (paso === 1) {
      return <StepDatosComunes formData={formData} grados={grados} metadataLoading={metadataLoading} onChange={handleInputChange} />;
    }
    if (paso === indicePasoEspecifico) {
      return tipoSeleccionado.flujo === "facultad" ? (
        <StepDatosFacultad formData={formData} facultades={facultades} rolesGrupo={rolesGrupo} metadataLoading={metadataLoading} onChange={handleInputChange} />
      ) : (
        <StepDatosGrupo formData={formData} grupos={grupos} rolesGrupo={rolesGrupo} metadataLoading={metadataLoading} onChange={handleInputChange} />
      );
    }
    return (
      <StepResumen
        tipoSeleccionado={tipoSeleccionado} rolPlataformaResuelto={rolPlataformaResuelto}
        formData={formData} grados={grados} facultades={facultades} grupos={grupos} rolesGrupo={rolesGrupo}
      />
    );
  };

  const renderFooter = (
    <div className="d-flex justify-content-between">
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <div>
        {paso > 0 && <Button label="Atrás" icon="pi pi-arrow-left" onClick={irAtras} className="p-button-text mr-2" />}
        {paso < indicePasoResumen ? (
          <Button label="Siguiente" icon="pi pi-arrow-right" iconPos="right" onClick={irSiguiente} />
        ) : (
          <Button label="Registrar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
        )}
      </div>
    </div>
  );

  return (
    <Dialog header="Nuevo Usuario" visible={visible} style={{ width: "55vw" }} footer={renderFooter} onHide={onHide}>
      <Steps model={pasos} activeIndex={paso} readOnly className="mb-4" />
      <div className="p-fluid">
        {renderPaso()}
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {userCreationError && (
          <Message severity="error" className="mt-3 w-full"
            text={typeof userCreationError === "string" ? userCreationError : "Error al crear el usuario."} />
        )}
      </div>
      <ConfirmationModal
        visible={isConfirmVisible} onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleRegister} header="¿Deseas confirmar la acción?" loading={userCreationLoading}
      >
        <StepResumen
          tipoSeleccionado={tipoSeleccionado} rolPlataformaResuelto={rolPlataformaResuelto}
          formData={formData} grados={grados} facultades={facultades} grupos={grupos} rolesGrupo={rolesGrupo}
        />
      </ConfirmationModal>
    </Dialog>
  );
};

export default NewUserModal;