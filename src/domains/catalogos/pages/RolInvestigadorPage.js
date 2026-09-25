// src/domains/catalogos/pages/RolInvestigadorPage.js
import React from 'react';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const RolInvestigadorPage = () => <CatalogPage config={CATALOGOS_CONFIG.rol_investigador} />;
export default RolInvestigadorPage;