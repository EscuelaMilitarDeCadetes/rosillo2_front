// src/domains/catalogos/pages/RolGrupoPage.js
import React from 'react';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const RolGrupoPage = () => <CatalogPage config={CATALOGOS_CONFIG.rol_grupo} />;
export default RolGrupoPage;