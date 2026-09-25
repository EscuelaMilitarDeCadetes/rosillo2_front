// src/domains/catalogos/pages/TipoDocumentoPage.js
import React from 'react';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const TipoDocumentoPage = () => <CatalogPage config={CATALOGOS_CONFIG.tipo_documento} />;
export default TipoDocumentoPage;