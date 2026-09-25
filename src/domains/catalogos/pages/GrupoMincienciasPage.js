// src/domains/catalogos/pages/GrupoMincienciasPage.js
import React from 'react';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const GrupoMincienciasPage = () => <CatalogPage config={CATALOGOS_CONFIG.grupo_minciencias} />;
export default GrupoMincienciasPage;