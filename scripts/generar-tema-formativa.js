/**
 * Genera src/styles/tema-formativa.css a partir del tema de PrimeReact
 * (lara-light-indigo) cambiando el índigo por el verde de Investigación
 * Formativa (#0f624c).
 *
 * Cada regla se copia con el prefijo `:where(.tema-formativa)`, que no suma
 * especificidad: así la copia verde queda con la misma especificidad que la
 * original y, al cargarse después, la reemplaza solo cuando <body> tiene la
 * clase `tema-formativa` (ver App.js). Las variantes (danger, success, etc.)
 * siguen funcionando igual porque se copia el tema completo en el mismo orden.
 *
 * Uso (sólo si se actualiza primereact o se cambia la paleta):
 *   node scripts/generar-tema-formativa.js
 */
const fs = require('fs');
const path = require('path');

const ORIGEN = path.join(__dirname, '..', 'node_modules', 'primereact', 'resources', 'themes', 'lara-light-indigo', 'theme.css');
const DESTINO = path.join(__dirname, '..', 'src', 'styles', 'tema-formativa.css');
const PREFIJO = ':where(.tema-formativa)';

// Índigo de lara-light-indigo -> verde Formativa
const COLORES = [
  [/#6366f1/gi, '#0f624c'], // primario
  [/#4f46e5/gi, '#0d5642'], // hover
  [/#4338ca/gi, '#0b4a3a'], // texto resaltado / activo
  [/#c7d2fe/gi, '#b7dccf'], // foco / bordes suaves
  [/#eef2ff/gi, '#e9f5f1'], // fondo resaltado
  [/rgba\(99, 102, 241,/g, 'rgba(15, 98, 76,'],
];

const separarPorComas = (texto) => {
  const partes = [];
  let profundidad = 0;
  let actual = '';
  for (const c of texto) {
    if (c === '(') profundidad++;
    if (c === ')') profundidad--;
    if (c === ',' && profundidad === 0) { partes.push(actual); actual = ''; } else actual += c;
  }
  partes.push(actual);
  return partes.map((p) => p.trim()).filter(Boolean);
};

const prefijar = (selectores) =>
  separarPorComas(selectores)
    .map((s) => (s === ':root' ? PREFIJO : `${PREFIJO} ${s}`))
    .join(',\n');

// Recorre bloques { } de primer nivel del texto dado.
const procesar = (css) => {
  let salida = '';
  let i = 0;
  while (i < css.length) {
    const llave = css.indexOf('{', i);
    if (llave === -1) break;
    const preludio = css.slice(i, llave).trim();
    let profundidad = 1;
    let j = llave + 1;
    while (j < css.length && profundidad > 0) {
      if (css[j] === '{') profundidad++;
      else if (css[j] === '}') profundidad--;
      j++;
    }
    const cuerpo = css.slice(llave + 1, j - 1);
    if (/^@(media|supports|layer)\b/.test(preludio)) {
      // @layer se conserva: el tema vive en `@layer primereact` y la copia debe
      // quedar en la misma capa para respetar la cascada original.
      const interno = procesar(cuerpo);
      if (interno.trim()) salida += `${preludio} {\n${interno}}\n`;
    } else if (!preludio.startsWith('@')) {
      salida += `${prefijar(preludio)} {${cuerpo}}\n`;
    }
    // @font-face, @keyframes, etc. se omiten: ya los define el tema original.
    i = j;
  }
  return salida;
};

let css = fs.readFileSync(ORIGEN, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
let resultado = procesar(css);
for (const [patron, reemplazo] of COLORES) resultado = resultado.replace(patron, reemplazo);

fs.mkdirSync(path.dirname(DESTINO), { recursive: true });
fs.writeFileSync(
  DESTINO,
  '/* ARCHIVO GENERADO por scripts/generar-tema-formativa.js — no editar a mano. */\n' + resultado
);
console.log(`Generado ${DESTINO} (${resultado.length} caracteres)`);
