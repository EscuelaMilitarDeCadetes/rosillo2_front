// src/components/common/Toast.js
//
// Igual que el Toast de PrimeReact, pero avisa al toast global
// (utils/notificador.js) cuando la pantalla muestra su propio mensaje, para
// que ese mensaje específico reemplace al genérico y no salgan duplicados.
// Uso: import Toast from '.../components/common/Toast'  (en vez de primereact/toast)
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Toast as PrimeToast } from 'primereact/toast';
import { avisarToastEspecifico } from '../../utils/notificador';

const Toast = forwardRef((props, ref) => {
  const interno = useRef(null);

  useImperativeHandle(ref, () => ({
    show: (mensaje) => {
      avisarToastEspecifico();
      interno.current?.show(mensaje);
    },
    replace: (mensaje) => {
      avisarToastEspecifico();
      interno.current?.replace(mensaje);
    },
    clear: () => interno.current?.clear(),
    remove: (mensaje) => interno.current?.remove(mensaje),
    getElement: () => interno.current?.getElement?.(),
  }));

  return <PrimeToast ref={interno} {...props} />;
});

export default Toast;
