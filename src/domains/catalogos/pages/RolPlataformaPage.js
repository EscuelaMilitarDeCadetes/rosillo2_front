// src/domains/catalogos/pages/RolPlataformaPage.js
import React from 'react';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const RolPlataformaPage = () => <CatalogPage config={CATALOGOS_CONFIG.rol_plataforma} />;
export default RolPlataformaPage;