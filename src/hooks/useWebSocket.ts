import { useEffect, useRef, useState, useCallback } from 'react';

export type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error';

export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

const WS_PATH = '/ws';
const HEARTBEAT_INTERVAL = 30000;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;

function getUserId(): string | null {
  return localStorage.getItem('tp_user_id');
}

export function useWebSocket() {
  const [status, setStatus] = useState<WebSocketStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const reconnectTimerRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const retryDelayRef = useRef<number>(INITIAL_RETRY_DELAY);
  const manualCloseRef = useRef<boolean>(false);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const clearHeartbeatTimer = useCallback(() => {
    if (heartbeatTimerRef.current !== null) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    clearHeartbeatTimer();
    heartbeatTimerRef.current = window.setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        } catch (_) {}
      }
    }, HEARTBEAT_INTERVAL);
  }, [clearHeartbeatTimer]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      const handlers = handlersRef.current.get(message.type);
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(message);
          } catch (_) {}
        });
      }
      const wildcardHandlers = handlersRef.current.get('*');
      if (wildcardHandlers) {
        wildcardHandlers.forEach((handler) => {
          try {
            handler(message);
          } catch (_) {}
        });
      }
    } catch (_) {}
  }, []);

  const connect = useCallback(() => {
    clearReconnectTimer();
    manualCloseRef.current = false;
    setStatus('connecting');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}${WS_PATH}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        retryDelayRef.current = INITIAL_RETRY_DELAY;
        setStatus('open');
        startHeartbeat();
        const userId = getUserId();
        if (userId) {
          try {
            ws.send(JSON.stringify({ type: 'subscribe', userId }));
          } catch (_) {}
        }
      };

      ws.onmessage = handleMessage;

      ws.onclose = () => {
        clearHeartbeatTimer();
        wsRef.current = null;
        setStatus('closed');
        if (!manualCloseRef.current) {
          const delay = retryDelayRef.current;
          reconnectTimerRef.current = window.setTimeout(() => {
            retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY);
            connect();
          }, delay);
        }
      };

      ws.onerror = () => {
        setStatus('error');
      };
    } catch (_) {
      setStatus('error');
      if (!manualCloseRef.current) {
        const delay = retryDelayRef.current;
        reconnectTimerRef.current = window.setTimeout(() => {
          retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY);
          connect();
        }, delay);
      }
    }
  }, [clearReconnectTimer, clearHeartbeatTimer, startHeartbeat, handleMessage]);

  const disconnect = useCallback(() => {
    manualCloseRef.current = true;
    clearReconnectTimer();
    clearHeartbeatTimer();
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }
    setStatus('closed');
  }, [clearReconnectTimer, clearHeartbeatTimer]);

  const send = useCallback((type: string, payload?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type, payload }));
        return true;
      } catch (_) {
        return false;
      }
    }
    return false;
  }, []);

  const on = useCallback((type: string, handler: MessageHandler) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler);
    return () => off(type, handler);
  }, []);

  const off = useCallback((type: string, handler: MessageHandler) => {
    const handlers = handlersRef.current.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        handlersRef.current.delete(type);
      }
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
      handlersRef.current.clear();
    };
  }, [connect, disconnect]);

  return {
    status,
    send,
    on,
    off,
    connect,
    disconnect,
    isConnected: status === 'open',
  };
}

export default useWebSocket;
