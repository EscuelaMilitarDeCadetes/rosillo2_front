// src/domains/usuarios/pages/UsersPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import PlatformUsersTable from '../components/usuarios/PlatformUsersTable';
import NewUserModal from '../components/usuarios/NewUserModal';
import GroupUsersTable from '../components/usuarios/GroupUsersTable';
import AddRoleModal from '../components/usuarios/AddRoleModal';
import AssignResearcherModal from '../components/usuarios/AssignResearcherModal';
import DeleteRoleModal from '../components/usuarios/DeleteRoleModal';
import EditRoleModal from '../components/usuarios/EditRoleModal';
import BuscarRolXUsuarioPanel from '../components/usuarios/BuscarRolXUsuarioPanel';
import { useSelector } from 'react-redux';

const UsersPage = () => {
  const [isNewUserModalVisible, setIsNewUserModalVisible] = useState(false);
  const [isAddRoleModalVisible, setIsAddRoleModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isDeleteRoleModalVisible, setIsDeleteRoleModalVisible] = useState(false);
  const [isEditRoleModalVisible, setIsEditRoleModalVisible] = useState(false);
  const { roles } = useSelector((state) => state.metadata);

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
        <Button label="Nuevo Usuario" icon="pi pi-user-plus" onClick={() => setIsNewUserModalVisible(true)} />
        <Button label="Agregar Rol" icon="pi pi-plus-circle" className="p-button-info" onClick={() => setIsAddRoleModalVisible(true)} />
        <Button label="Editar Rol" icon="pi pi-pencil" className="p-button-warning" onClick={() => setIsEditRoleModalVisible(true)} />
        <Button label="Asignar Investigador" icon="pi pi-sitemap" className="p-button-success" onClick={() => setIsAssignModalVisible(true)} />
        <Button label="Borrar Rol" icon="pi pi-user-minus" className="p-button-danger" onClick={() => setIsDeleteRoleModalVisible(true)} />
      </div>
      <div className="card mb-4">
        <PlatformUsersTable />
      </div>
      <div className="card">
        <GroupUsersTable />
      </div>
      <NewUserModal
        visible={isNewUserModalVisible}
        onHide={() => setIsNewUserModalVisible(false)}
      />
      <AddRoleModal
        visible={isAddRoleModalVisible}
        onHide={() => setIsAddRoleModalVisible(false)}
        roles={roles}
      />
      <EditRoleModal
        visible={isEditRoleModalVisible}
        onHide={() => setIsEditRoleModalVisible(false)}
      />
      <AssignResearcherModal
        visible={isAssignModalVisible}
        onHide={() => setIsAssignModalVisible(false)}
      />
      <DeleteRoleModal
        visible={isDeleteRoleModalVisible}
        onHide={() => setIsDeleteRoleModalVisible(false)}
      />
      <BuscarRolXUsuarioPanel />
    </div>
  );
};

export default UsersPage;