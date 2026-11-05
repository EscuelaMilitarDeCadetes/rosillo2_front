// src/hooks/useNotificacionesWebSocket.js
//
// Notificaciones en tiempo real + respaldo por consulta periódica.
//
// - WebSocket: la URL sale de REACT_APP_WS_BASE_URL (.env). Antes estaba
//   fija en ws://localhost:8000, por lo que en el ambiente de pruebas el
//   navegador de cada usuario intentaba conectarse a SU propio PC.
// - Si el socket se cae (reinicio del backend, red, token vencido), se
//   reconecta solo, esperando cada vez un poco más (máx. 30 s) y usando el
//   token más reciente del localStorage.
// - Respaldo: cada POLL_MS se vuelven a pedir las no leídas por HTTP. Así,
//   aunque el WebSocket no funcione, la campana se actualiza igual.
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  notificacionRecibida,
  fetchNotificacionesIniciales,
} from '../features/notificaciones/notificacionesSlice';

const WS_BASE_URL = (process.env.REACT_APP_WS_BASE_URL || 'ws://localhost:8000').replace(/\/+$/, '');
const POLL_MS = 60 * 1000;
const RECONEXION_MAX_MS = 30 * 1000;

export function useNotificacionesWebSocket() {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const usuarioId = user?.id;

  // --- WebSocket con reconexión automática ---
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let cerradoPorNosotros = false;
    let intentos = 0;
    let temporizador = null;

    const conectar = () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || cerradoPorNosotros) return;

      const socket = new WebSocket(
        `${WS_BASE_URL}/ws/notificaciones/?token=${encodeURIComponent(accessToken)}`
      );
      socketRef.current = socket;

      socket.onopen = () => {
        intentos = 0;
        // Recuperar lo que haya llegado mientras estuvo desconectado.
        if (usuarioId) dispatch(fetchNotificacionesIniciales(usuarioId));
      };
      socket.onmessage = (event) => {
        try {
          dispatch(notificacionRecibida(JSON.parse(event.data)));
        } catch (e) {
          console.error('WebSocket de notificaciones — mensaje inválido:', e);
        }
      };
      socket.onerror = () => {
        // onclose se encarga de reintentar.
      };
      socket.onclose = () => {
        if (cerradoPorNosotros) return;
        intentos += 1;
        const espera = Math.min(RECONEXION_MAX_MS, 1000 * 2 ** Math.min(intentos, 5));
        temporizador = setTimeout(conectar, espera);
      };
    };

    conectar();

    return () => {
      cerradoPorNosotros = true;
      clearTimeout(temporizador);
      if (socketRef.current) socketRef.current.close();
      socketRef.current = null;
    };
  }, [dispatch, isAuthenticated, usuarioId]);

  // --- Respaldo: consulta periódica por HTTP ---
  useEffect(() => {
    if (!isAuthenticated || !usuarioId) return undefined;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        dispatch(fetchNotificacionesIniciales(usuarioId));
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [dispatch, isAuthenticated, usuarioId]);

  return socketRef;
}
