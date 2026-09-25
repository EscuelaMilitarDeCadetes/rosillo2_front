// src/domains/catalogos/pages/GradoEstudiosPage.js
import React from 'react';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const GradoEstudiosPage = () => <CatalogPage config={CATALOGOS_CONFIG.grado_estudios} />;
export default GradoEstudiosPage;