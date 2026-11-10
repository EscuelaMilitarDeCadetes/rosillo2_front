// src/components/layout/Footer.js
import React from 'react';
import './Footer.css';

const COLUMNAS = [
  {
    titulo: 'Versión 1.0',
    items: [
      'Ingrese a SECOD',
      'Formación Militar',
    ],
  },
  {
    titulo: 'Contacto',
    items: [
      'soporterosillo@esmic.edu.co',
      'FAX: 601 5453486',
      'Departamento I+D+i',
    ],
  },
  {
    titulo: 'Soporte Técnico',
    items: [
      'Terminos & Condiciones',
      'Políticas de privacidad',
      'Políticas de investigación',
      'Área Investigativa',
    ],
  },
];

const Footer = () => {
  return (
    <footer className="rosillo-footer">
      <div className="container-fluid px-4 pt-5 pb-3">
        <div className="row">
          <div className="col-12 col-md-6 col-lg-3 mb-4">
            <p className="h3 fw-semibold mb-2">GINSI</p>
            <p className="fw-bold mb-3">ESMIC-CIDSI-GINSI 2022</p>
            <p className="footer-muted mb-0">ESMIC - Bogotá D.C.</p>
          </div>

          {COLUMNAS.map((columna) => (
            <div key={columna.titulo} className="col-12 col-md-6 col-lg-3 mb-4">
              <p className="footer-titulo">{columna.titulo}</p>
              <ul className="footer-links">
                {columna.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-separador">ROSILLO</div>

        <p className="footer-legal">
          Escuela Militar de Cadetes General José María Córdova / VIGILADA MINEDUCACIÓN
          Insitución de Educación Superior de Carácter Académico / Institución Universitaria
          de Naturaleza Jurídica Pública. Según Art. 137 de la Ley 30 de 1992. Reconocimiento
          como IES Código ICFES 2113. Derechos Reservados de la Escuela Militar de Cadetes
          General José María Córdova
        </p>
      </div>
    </footer>
  );
};

export default Footer;
