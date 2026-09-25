// src/domains/usuarios/components/usuarios/EditRoleModal.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { updateRole } from "../../../../features/usuarios/rolesUsuarioSlice.js";
import ConfirmationModal from "../../../../components/common/ConfirmationModal.js";

/**
 * Modal para editar nombre_rol/descripcion de un RolPlataforma existente.
 */
const EditRoleModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { roles, loading: metadataLoading } = useSelector((state) => state.metadata);
  const { loading: actionLoading, error: actionError } = useSelector((state) => state.rolesUsuario);

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [nombreRol, setNombreRol] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedRoleId(null);
      setNombreRol("");
      setDescripcion("");
      setValidationError("");
    }
  }, [visible]);

  useEffect(() => {
    const rol = roles.find((r) => r.id === selectedRoleId);
    if (rol) {
      setNombreRol(rol.nombre_rol || "");
      setDescripcion(rol.descripcion || "");
    }
  }, [selectedRoleId, roles]);

  const validarFormulario = () => {
    if (!selectedRoleId) {
      setValidationError("Debe seleccionar un rol.");
      return false;
    }
    if (!nombreRol.trim()) {
      setValidationError("El nombre del rol es obligatorio.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleShowConfirmation = () => {
    if (!validarFormulario()) return;
    setIsConfirmVisible(true);
  };

  const handleConfirmEdit = () => {
    dispatch(
      updateRole({ id: selectedRoleId, nombre_rol: nombreRol.trim(), descripcion: descripcion.trim() })
    ).then((result) => {
      if (updateRole.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Guardar Cambios" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <Dialog header="Editar Rol de Plataforma" visible={visible} style={{ width: "40vw" }} footer={footer} onHide={onHide}>
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="rol-a-editar">Rol</label>
          <Dropdown
            inputId="rol-a-editar"
            value={selectedRoleId}
            options={roles}
            onChange={(e) => setSelectedRoleId(e.value)}
            optionLabel="nombre_rol"
            optionValue="id"
            filter
            placeholder="Seleccione un rol"
            loading={metadataLoading}
          />
        </div>
        {selectedRoleId && (
          <>
            <div className="field mb-3">
              <label htmlFor="nombre-rol">Nombre del rol</label>
              <InputText id="nombre-rol" value={nombreRol} onChange={(e) => setNombreRol(e.target.value)} />
            </div>
            <div className="field mb-3">
              <label htmlFor="descripcion-rol">Descripción</label>
              <InputText id="descripcion-rol" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>
          </>
        )}
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {actionError && (
          <Message
            severity="error"
            className="mt-3 w-full"
            text={typeof actionError === "string" ? actionError : "Error al editar el rol."}
          />
        )}
      </div>
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmEdit}
        header="¿Deseas confirmar la edición?"
        loading={actionLoading}
      >
        <ul>
          <li><strong>Nombre:</strong> {nombreRol || "N/A"}</li>
          <li><strong>Descripción:</strong> {descripcion || "N/A"}</li>
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default EditRoleModal;