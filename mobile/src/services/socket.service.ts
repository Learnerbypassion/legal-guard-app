import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from './api';

const SOCKET_URL = BASE_URL.replace('/api', '');

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      throw new Error('User not authenticated, token missing');
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      extraHeaders: {
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
      },
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected successfully');
      // Re-register any lost listeners after connection
      this.reRegisterListeners();
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Socket not connected. Cannot emit event: ${event}`);
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    // Avoid duplicate callbacks
    const callbacks = this.listeners.get(event)!;
    if (callbacks.includes(callback)) return;
    
    callbacks.push(callback);
    
    if (this.socket) {
      this.socket.off(event, callback); // Remove if exists
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: (...args: any[]) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const idx = callbacks.indexOf(callback);
      if (idx !== -1) {
        callbacks.splice(idx, 1);
      }
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  private reRegisterListeners() {
    if (!this.socket) return;
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => {
        this.socket!.off(event, cb);
        this.socket!.on(event, cb);
      });
    });
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get rawSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
