// src/domains/catalogos/pages/FacultadEscuelaPage.js
import React from 'react';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const FacultadEscuelaPage = () => <CatalogPage config={CATALOGOS_CONFIG.facultad_escuela} />;
export default FacultadEscuelaPage;