// src/domains/catalogos/pages/GrupoInvestigacionPage.js
import React from 'react';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const GrupoInvestigacionPage = () => <CatalogPage config={CATALOGOS_CONFIG.grupo_investigacion} />;
export default GrupoInvestigacionPage;