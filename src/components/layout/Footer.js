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
      <div className="rosillo-footer__cuerpo">
        <div className="rosillo-footer__col">
          <p className="footer-titulo h4">GINSI</p>
          <p className="footer-subtitulo">ESMIC-CIDSI-GINSI 2022</p>
          <p className="footer-muted">ESMIC - Bogotá D.C.</p>
        </div>

        {COLUMNAS.map((columna) => (
          <div key={columna.titulo} className="rosillo-footer__col">
            <p className="footer-titulo">{columna.titulo}</p>
            <ul className="footer-links">
              {columna.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rosillo-footer__separador">ROSILLO</div>

      <p className="rosillo-footer__legal">
        Escuela Militar de Cadetes General José María Córdova / VIGILADA MINEDUCACIÓN
        Insitución de Educación Superior de Carácter Académico / Institución Universitaria
        de Naturaleza Jurídica Pública. Según Art. 137 de la Ley 30 de 1992. Reconocimiento
        como IES Código ICFES 2113. Derechos Reservados de la Escuela Militar de Cadetes
        General José María Córdova
      </p>
    </footer>
  );
};

export default Footer;
