// src/domains/catalogos/pages/ProductoMincienciasPage.js
import React from 'react';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const ProductoMincienciasPage = () => <CatalogPage config={CATALOGOS_CONFIG.producto_minciencias} />;
export default ProductoMincienciasPage;