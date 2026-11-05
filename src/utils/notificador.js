// src/utils/notificador.js
//
// Toast global de la aplicación.
//
// - App.js monta UN <Toast> y lo registra aquí (registrarToastGlobal).
// - axiosInstance.js llama a mostrarToastGenerico() después de cada
//   petición que crea, edita o elimina (POST/PUT/PATCH/DELETE), con éxito o
//   con error, para que TODAS las pantallas den respuesta visual sin tener
//   que programarla una por una.
// - Si una pantalla muestra su propio mensaje más específico (con el
//   componente components/common/Toast), ese mensaje reemplaza al genérico
//   para que no salgan dos mensajes por la misma acción.

const RETRASO_GENERICO_MS = 350;   // margen para que llegue el mensaje específico
const VENTANA_REEMPLAZO_MS = 4000; // si el específico llega tarde, se limpia el genérico

let toastRef = null;
const pendientes = new Set();
let ultimoGenericoEn = 0;

export const registrarToastGlobal = (ref) => {
  toastRef = ref;
};

export const mostrarToast = (mensaje) => {
  toastRef?.current?.show({ life: 5000, ...mensaje });
};

export const mostrarToastGenerico = (mensaje) => {
  const id = setTimeout(() => {
    pendientes.delete(id);
    ultimoGenericoEn = Date.now();
    mostrarToast(mensaje);
  }, RETRASO_GENERICO_MS);
  pendientes.add(id);
};

// La llama components/common/Toast antes de mostrar un mensaje propio.
export const avisarToastEspecifico = () => {
  pendientes.forEach((id) => clearTimeout(id));
  pendientes.clear();
  if (Date.now() - ultimoGenericoEn < VENTANA_REEMPLAZO_MS) {
    toastRef?.current?.clear();
    ultimoGenericoEn = 0;
  }
};

// Convierte la respuesta de error de Django REST Framework en un texto legible.
export const extraerMensajeError = (data, status) => {
  if (data === undefined || data === null || data === '') {
    return status ? `El servidor respondió con el código ${status}.` : 'No se pudo conectar con el servidor.';
  }
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    return `El servidor respondió con el código ${status}.`;
  }
  if (typeof data === 'string') {
    // Páginas HTML de error (p. ej. 500 con DEBUG) no se muestran tal cual.
    return data.trim().startsWith('<') ? `El servidor respondió con el código ${status}.` : data;
  }
  if (Array.isArray(data)) return data.map((d) => extraerMensajeError(d, status)).join(' ');
  if (typeof data === 'object') {
    for (const clave of ['detail', 'error', 'mensaje', 'message']) {
      if (typeof data[clave] === 'string') return data[clave];
    }
    return Object.entries(data)
      .map(([campo, valor]) => {
        const texto = Array.isArray(valor)
          ? valor.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ')
          : typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
        return campo === 'non_field_errors' || campo === 'detail' ? texto : `${campo}: ${texto}`;
      })
      .join(' | ');
  }
  return String(data);
};
