import { useEffect, useRef, useState } from 'react';

interface SocketIOConfig {
  url: string;
  options?: {
    transports?: string[];
    upgrade?: boolean;
    rememberUpgrade?: boolean;
    timeout?: number;
    forceNew?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    maxReconnectionDelay?: number;
    randomizationFactor?: number;
  };
}

interface SocketIOState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  transport: string | null;
}

export const useSocketIO = (config: SocketIOConfig) => {
  const [state, setState] = useState<SocketIOState>({
    connected: false,
    connecting: false,
    error: null,
    transport: null,
  });

  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import socket.io-client to avoid SSR issues
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        
        setState(prev => ({ ...prev, connecting: true, error: null }));

        // Optimized Socket.IO configuration
        const socket = io(config.url, {
          // Force WebSocket transport first, avoid polling
          transports: ['websocket', 'polling'],
          upgrade: true,
          rememberUpgrade: true,
          
          // Connection timeouts
          timeout: 5000,
          
          // Reconnection settings
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          maxReconnectionDelay: 5000,
          randomizationFactor: 0.5,
          
          // Force new connection
          forceNew: false,
          
          // Additional optimizations
          autoConnect: true,
          
          ...config.options,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('Socket.IO connected with transport:', socket.io.engine.transport.name);
          setState(prev => ({
            ...prev,
            connected: true,
            connecting: false,
            error: null,
            transport: socket.io.engine.transport.name,
          }));

          // Monitor transport upgrades
          socket.io.engine.on('upgrade', (transport: any) => {
            console.log('Socket.IO upgraded to transport:', transport.name);
            setState(prev => ({ ...prev, transport: transport.name }));
          });

          // Monitor transport downgrades
          socket.io.engine.on('upgradeError', (error: any) => {
            console.warn('Socket.IO upgrade failed:', error);
          });
        });

        socket.on('disconnect', (reason: string) => {
          console.log('Socket.IO disconnected:', reason);
          setState(prev => ({
            ...prev,
            connected: false,
            connecting: false,
            transport: null,
          }));

          // Log if disconnect was due to transport issues
          if (reason === 'transport close' || reason === 'transport error') {
            console.warn('Socket.IO transport issue detected:', reason);
          }
        });

        socket.on('connect_error', (error: any) => {
          console.error('Socket.IO connection error:', error);
          setState(prev => ({
            ...prev,
            connected: false,
            connecting: false,
            error: error.message || 'Connection failed',
          }));
        });

        socket.on('reconnect', (attemptNumber: number) => {
          console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
        });

        socket.on('reconnect_error', (error: any) => {
          console.error('Socket.IO reconnection error:', error);
        });

        socket.on('reconnect_failed', () => {
          console.error('Socket.IO reconnection failed');
          setState(prev => ({
            ...prev,
            error: 'Reconnection failed after maximum attempts',
          }));
        });

      } catch (error) {
        console.error('Failed to initialize Socket.IO:', error);
        setState(prev => ({
          ...prev,
          connecting: false,
          error: 'Failed to load Socket.IO client',
        }));
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [config.url]);

  const emit = (event: string, data?: any) => {
    if (socketRef.current && state.connected) {
      socketRef.current.emit(event, data);
      return true;
    }
    return false;
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => socketRef.current?.off(event, callback);
    }
    return () => {};
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    ...state,
    socket: socketRef.current,
    emit,
    on,
    off,
  };
};