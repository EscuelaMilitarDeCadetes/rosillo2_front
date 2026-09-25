// src/hooks/useNotificacionesWebSocket.js
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificacionRecibida } from '../features/notificaciones/notificacionesSlice';

const WS_BASE_URL = 'ws://localhost:8000';

export function useNotificacionesWebSocket() {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) return;
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    const socket = new WebSocket(
      `${WS_BASE_URL}/ws/notificaciones/?token=${encodeURIComponent(accessToken)}`
    );
    socketRef.current = socket;

    socket.onmessage = (event) => {
      dispatch(notificacionRecibida(JSON.parse(event.data)));
    };
    socket.onerror = (error) => {
      console.error('WebSocket de notificaciones — error:', error);
    };

    return () => socket.close();
    // Se reconecta cada vez que cambia isAuthenticated (login/logout),
    // no solo al montar una vez.
  }, [dispatch, isAuthenticated]);

  return socketRef;
}