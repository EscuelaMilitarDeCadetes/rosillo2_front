// src/domains/usuarios/components/usuarios/AddRoleModal.js
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { addRoleToUser } from "../../../../features/usuarios/rolesUsuarioSlice.js";
import { asignarRolExistente } from "../../../../features/usuarios/usuarioLifecycleSlice.js";
import ConfirmationModal from "../../../../components/common/ConfirmationModal.js";


/**
 * Modal para agregar un rol de plataforma a un usuario existente.
 *
 * Si el rol elegido pertenece a ROLES_CON_FACULTAD o ROLES_CON_GRUPO,
 * pide además la facultad/grupo y el rol dentro de ella, y despacha
 * asignarRolExistente() (integracion/asignar-rol-existente/), que crea o
 * actualiza el PersonaXGrupo del usuario en la misma operación.
 */
const AddRoleModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { usuarios, roles, facultades, grupos, rolesGrupo, loading: metadataLoading } = useSelector(
    (state) => state.metadata
  );
  const { loading: rolesUsuarioLoading, error: rolesUsuarioError } = useSelector((state) => state.rolesUsuario);
  const { loading: lifecycleLoading, error: lifecycleError } = useSelector((state) => state.usuarioLifecycle);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedRolGrupo, setSelectedRolGrupo] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const rolSeleccionado = useMemo(() => roles?.find((r) => r.id === selectedRole) ?? null, [roles, selectedRole]);
  const requiereFacultad = rolSeleccionado?.tipo_vinculacion === "facultad";
  const requiereGrupo = rolSeleccionado?.tipo_vinculacion === "grupo";
  const requiereVinculacion = requiereFacultad || requiereGrupo;

  const actionLoading = requiereVinculacion ? lifecycleLoading : rolesUsuarioLoading;
  const actionError = requiereVinculacion ? lifecycleError : rolesUsuarioError;

  useEffect(() => {
    if (!visible) {
      setSelectedUser(null);
      setSelectedRole(null);
      setSelectedFaculty(null);
      setSelectedGroup(null);
      setSelectedRolGrupo(null);
      setValidationError("");
    }
  }, [visible]);

  // Si cambia el rol y deja de requerir facultad/grupo, se limpian esos campos
  // para no arrastrar una selección obsoleta a un envío que no la necesita.
  useEffect(() => {
    if (!requiereFacultad) setSelectedFaculty(null);
    if (!requiereGrupo) setSelectedGroup(null);
    if (!requiereVinculacion) setSelectedRolGrupo(null);
  }, [requiereFacultad, requiereGrupo, requiereVinculacion]);

  const validateForm = () => {
    if (!selectedUser || !selectedRole) {
      setValidationError("Debe seleccionar un usuario y un rol.");
      return false;
    }
    if (requiereFacultad && (!selectedFaculty || !selectedRolGrupo)) {
      setValidationError("El rol seleccionado requiere Facultad y Rol dentro de la facultad.");
      return false;
    }
    if (requiereGrupo && (!selectedGroup || !selectedRolGrupo)) {
      setValidationError("El rol seleccionado requiere Grupo y Rol dentro del grupo.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleShowConfirmation = () => {
    if (!validateForm()) return;
    setIsConfirmVisible(true);
  };

  const handleConfirmAddRole = () => {
    const thunkActionCreator = requiereVinculacion ? asignarRolExistente : addRoleToUser;
    const accion = requiereVinculacion
      ? asignarRolExistente({
          usuario_id: selectedUser,
          rol_plataforma_id: selectedRole,
          ...(requiereFacultad ? { facultad_id: selectedFaculty } : {}),
          ...(requiereGrupo ? { grupo_id: selectedGroup } : {}),
          rol_grupo_id: selectedRolGrupo,
        })
      : addRoleToUser({ usuario_id: selectedUser, rol_id: selectedRole });
    dispatch(accion).then((result) => {
      if (thunkActionCreator.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Agregar Rol" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <Dialog header="Agregar Rol a Usuario" visible={visible} style={{ width: "40vw" }} footer={footer} onHide={onHide}>
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="user">Usuario</label>
          <Dropdown
            inputId="user"
            value={selectedUser}
            options={usuarios}
            onChange={(e) => setSelectedUser(e.value)}
            optionLabel="username"
            optionValue="id"
            filter
            placeholder="Seleccione un usuario"
            loading={metadataLoading}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="role">Rol en la Plataforma</label>
          <Dropdown
            inputId="role"
            value={selectedRole}
            options={roles}
            onChange={(e) => setSelectedRole(e.value)}
            optionLabel="nombre_rol"
            optionValue="id"
            filter
            placeholder="Seleccione un rol"
            loading={metadataLoading}
          />
        </div>

        {requiereFacultad && (
          <>
            <div className="field mb-3">
              <label htmlFor="facultad">Facultad</label>
              <Dropdown
                inputId="facultad"
                value={selectedFaculty}
                options={facultades}
                onChange={(e) => setSelectedFaculty(e.value)}
                optionLabel="nombre_facultad"
                optionValue="id"
                filter
                placeholder="Seleccione una facultad"
                loading={metadataLoading}
              />
            </div>
            <div className="field mb-3">
              <label htmlFor="rolGrupoFacultad">Rol dentro de la facultad</label>
              <Dropdown
                inputId="rolGrupoFacultad"
                value={selectedRolGrupo}
                options={rolesGrupo}
                onChange={(e) => setSelectedRolGrupo(e.value)}
                optionLabel="cargo"
                optionValue="id"
                filter
                placeholder="Seleccione un rol"
                loading={metadataLoading}
              />
            </div>
          </>
        )}

        {requiereGrupo && (
          <>
            <div className="field mb-3">
              <label htmlFor="grupo">Grupo de investigación</label>
              <Dropdown
                inputId="grupo"
                value={selectedGroup}
                options={grupos}
                onChange={(e) => setSelectedGroup(e.value)}
                optionLabel="nombre_grupo"
                optionValue="id"
                filter
                placeholder="Seleccione un grupo"
                loading={metadataLoading}
              />
            </div>
            <div className="field mb-3">
              <label htmlFor="rolGrupoGrupo">Rol dentro del grupo</label>
              <Dropdown
                inputId="rolGrupoGrupo"
                value={selectedRolGrupo}
                options={rolesGrupo}
                onChange={(e) => setSelectedRolGrupo(e.value)}
                optionLabel="cargo"
                optionValue="id"
                filter
                placeholder="Seleccione un rol"
                loading={metadataLoading}
              />
            </div>
          </>
        )}

        {requiereVinculacion && (
          <Message
            severity="info"
            className="mb-3 w-full"
            text="Este rol requiere vínculo institucional: se creará o actualizará la vinculación (Facultad/Grupo) del usuario en la misma operación."
          />
        )}

        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {actionError && (
          <Message
            severity="error"
            className="mt-3 w-full"
            text={typeof actionError === "string" ? actionError : "Error al agregar el rol."}
          />
        )}
      </div>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmAddRole}
        header="¿Deseas confirmar la acción?"
        loading={actionLoading}
      >
        <h6>Resumen de datos ingresados:</h6>
        <ul>
          <li>
            <strong>Usuario:</strong> {usuarios.find((u) => u.id === selectedUser)?.username || "N/A"}
          </li>
          <li>
            <strong>Rol:</strong> {roles.find((r) => r.id === selectedRole)?.nombre_rol || "N/A"}
          </li>
          {requiereFacultad && (
            <li>
              <strong>Facultad:</strong> {facultades.find((f) => f.id === selectedFaculty)?.nombre_facultad || "N/A"}
            </li>
          )}
          {requiereGrupo && (
            <li>
              <strong>Grupo:</strong> {grupos.find((g) => g.id === selectedGroup)?.nombre_grupo || "N/A"}
            </li>
          )}
          {requiereVinculacion && (
            <li>
              <strong>Rol en facultad/grupo:</strong> {rolesGrupo.find((rg) => rg.id === selectedRolGrupo)?.cargo || "N/A"}
            </li>
          )}
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default AddRoleModal;