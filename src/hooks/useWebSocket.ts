import { useEffect, useRef, useState } from 'react';

interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessage: any;
}

export const useWebSocket = (config: WebSocketConfig) => {
  const [state, setState] = useState<WebSocketState>({
    socket: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null,
  });

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = config.reconnectAttempts || 5;
  const reconnectInterval = config.reconnectInterval || 3000;
  const heartbeatInterval = config.heartbeatInterval || 30000;

  const connect = () => {
    if (state.isConnecting || state.isConnected) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Force WebSocket transport, avoid polling fallback
      const wsUrl = config.url.replace(/^http/, 'ws');
      const socket = new WebSocket(wsUrl, config.protocols);

      // Optimize WebSocket settings
      socket.binaryType = 'arraybuffer';

      socket.onopen = () => {
        console.log('WebSocket connected successfully');
        reconnectAttemptsRef.current = 0;
        
        setState(prev => ({
          ...prev,
          socket,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));

        // Start heartbeat to keep connection alive
        startHeartbeat(socket);
      };

      socket.onmessage = (event) => {
        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          message = event.data;
        }

        setState(prev => ({ ...prev, lastMessage: message }));
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        
        setState(prev => ({
          ...prev,
          socket: null,
          isConnected: false,
          isConnecting: false,
        }));

        stopHeartbeat();

        // Attempt reconnection if not a clean close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({
          ...prev,
          error: 'WebSocket connection failed',
          isConnecting: false,
        }));
      };

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to create WebSocket connection',
        isConnecting: false,
      }));
    }
  };

  const disconnect = () => {
    if (state.socket) {
      state.socket.close(1000, 'Client disconnect');
    }
    stopHeartbeat();
    clearReconnectTimeout();
  };

  const sendMessage = (message: any) => {
    if (state.socket && state.isConnected) {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      state.socket.send(data);
      return true;
    }
    return false;
  };

  const startHeartbeat = (socket: WebSocket) => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, heartbeatInterval);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
  };

  const scheduleReconnect = () => {
    reconnectAttemptsRef.current++;
    const delay = reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1);
    
    console.log(`Scheduling reconnect attempt ${reconnectAttemptsRef.current} in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  };

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [config.url]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
  };
};