import Peer, { type DataConnection } from 'peerjs';
import { io, Socket } from 'socket.io-client';

const SIGNALING_URL = import.meta.env.VITE_BACKEND_URL || '/';

function getPeerOptions() {
  let host = window.location.hostname;
  let port = window.location.port ? parseInt(window.location.port, 10) : (window.location.protocol === 'https:' ? 443 : 80);
  let path = '/peerjs';
  let secure = window.location.protocol === 'https:';

  if (import.meta.env.VITE_BACKEND_URL) {
    try {
      const url = new URL(import.meta.env.VITE_BACKEND_URL, window.location.origin);
      host = url.hostname;
      port = url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 80);
      secure = url.protocol === 'https:';
    } catch (e) {
      console.warn('Could not parse VITE_BACKEND_URL for PeerJS:', e);
    }
  }

  return {
    host,
    port,
    path,
    secure,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { 
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        { 
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ]
    }
  };
}

export class PeerManager {
  private peer: Peer;
  private socket: Socket;
  public id: string | null = null;
  public connection: DataConnection | null = null;
  private currentPin: string | null = null;
  private role: 'host' | 'guest' | null = null;
  private onConnectionStatusChange: (status: 'connecting' | 'connected' | 'disconnected') => void;
  private onMessageReceived: (message: any) => void;
  private onCallReceived: (call: any) => void;

  constructor(
    onStatusChange: (status: 'connecting' | 'connected' | 'disconnected') => void,
    onMessage: (message: any) => void,
    onCall: (call: any) => void
  ) {
    this.onConnectionStatusChange = onStatusChange;
    this.onMessageReceived = onMessage;
    this.onCallReceived = onCall;
    this.socket = io(SIGNALING_URL);
    this.peer = new Peer(getPeerOptions());

    this.peer.on('open', (id) => {
      console.log('PeerJS initialized with local ID:', id);
      this.id = id;
    });

    this.peer.on('connection', (conn) => {
      console.log('Incoming PeerJS connection from:', conn.peer);
      this.setupConnection(conn);
    });

    this.peer.on('call', (call) => {
      this.onCallReceived(call);
    });

    this.peer.on('error', (err: any) => {
      console.warn('Peer error:', err);
      if (err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error' || err.type === 'socket-closed') {
        console.warn('Ignoring non-fatal signaling error:', err.type);
        return;
      }
      // When target peer is momentarily app-switching, peer-unavailable is emitted.
      // Don't kill status; let retry loop and reverse connect succeed.
      if (err.type === 'peer-unavailable') {
        console.warn('Target peer temporarily unavailable, waiting for retry or host reconnect...');
        return;
      }
      if (!this.connection || !this.connection.open) {
        this.onConnectionStatusChange('disconnected');
      }
    });

    // Auto-reconnect PeerJS if mobile browser briefly suspends background connection
    this.peer.on('disconnected', () => {
      console.log('PeerJS disconnected from signaling server, attempting reconnect...');
      if (!this.peer.destroyed) {
        try {
          this.peer.reconnect();
        } catch (e) {
          console.warn('Peer reconnect failed:', e);
        }
      }
    });

    // Handle mobile browser app switching (e.g. going to WhatsApp and coming back)
    this.socket.on('connect', () => {
      console.log('Signaling socket connected:', this.socket.id);
      if (this.peer && this.peer.disconnected && !this.peer.destroyed) {
        try { this.peer.reconnect(); } catch (e) {}
      }
      if (this.role === 'host' && this.currentPin && this.id) {
        console.log(`Re-linking host socket for room ${this.currentPin}`);
        this.socket.emit('create-room', { peerId: this.id, existingPin: this.currentPin });
      }
    });

    // Re-check and resume connections when user brings browser tab back to foreground
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('Document became visible, re-checking peer & socket connections...');
          if (this.peer && this.peer.disconnected && !this.peer.destroyed) {
            try { this.peer.reconnect(); } catch (e) {}
          }
          if (this.socket && this.socket.disconnected) {
            this.socket.connect();
          }
          if (this.role === 'host' && this.currentPin && this.id) {
            this.socket.emit('create-room', { peerId: this.id, existingPin: this.currentPin });
          }
        }
      });
    }
  }

  // Called by Host
  public async createRoom(existingPin?: string): Promise<string> {
    this.role = 'host';
    return new Promise((resolve, reject) => {
      const start = () => this.initRoom(resolve, reject, existingPin);
      if (!this.id) {
        const timeout = setTimeout(() => {
          reject('Peer initialization timed out. Please check network connection.');
        }, 12000);
        this.peer.once('open', () => {
          clearTimeout(timeout);
          start();
        });
      } else {
        start();
      }
    });
  }

  private initRoom(resolve: Function, reject: Function, existingPin?: string) {
    this.socket.emit('create-room', { peerId: this.id, existingPin }, (res: any) => {
      if (res.success) {
        this.currentPin = res.pin;
        resolve(res.pin);
      } else {
        reject(res.error);
      }
    });

    // Listen for guest joining
    this.socket.off('guest-joined');
    this.socket.on('guest-joined', ({ guestPeerId }) => {
      console.log('Guest joined signaling room with peer ID:', guestPeerId);
      // Wait for guest connection; if not established in 1.5s, initiate reverse connect to punch NAT hole
      setTimeout(() => {
        if (!this.connection || !this.connection.open) {
          console.log('Attempting reverse connect to guest:', guestPeerId);
          this.connectToPeer(guestPeerId);
        }
      }, 1500);
    });
  }

  // Called by Guest
  public async joinRoom(pin: string): Promise<void> {
    this.role = 'guest';
    this.currentPin = pin;
    return new Promise((resolve, reject) => {
      const doJoin = () => {
        this.socket.emit('join-room', { pin, peerId: this.id }, (res: any) => {
          if (res.success) {
            console.log('Got host peer ID:', res.hostPeerId);
            this.connectToPeer(res.hostPeerId);
            resolve();
          } else {
            reject(res.error || 'Failed to join room');
          }
        });
      };

      if (!this.id) {
        const timeout = setTimeout(() => {
          reject('Could not connect to signaling service. Please refresh and try again.');
        }, 12000);
        this.peer.once('open', () => {
          clearTimeout(timeout);
          doJoin();
        });
      } else {
        doJoin();
      }
    });
  }

  private connectToPeer(targetId: string, retryCount = 0) {
    if (this.connection && this.connection.open && this.connection.peer === targetId) {
      return;
    }
    this.onConnectionStatusChange('connecting');
    const conn = this.peer.connect(targetId, { reliable: true });
    this.setupConnection(conn, targetId, retryCount);
  }

  private setupConnection(conn: DataConnection, targetId?: string, retryCount = 0) {
    if (this.connection && this.connection.open && this.connection.peer === conn.peer) {
      return;
    }

    this.connection = conn;
    
    conn.on('open', () => {
      console.log('Connected to peer:', conn.peer);
      this.onConnectionStatusChange('connected');
    });

    conn.on('data', (data) => {
      this.onMessageReceived(data);
    });

    conn.on('close', () => {
      console.log('Peer connection closed for:', conn.peer);
      // If closed before open and we haven't connected yet, retry up to 3 times (e.g. while host is returning from WhatsApp)
      if (targetId && retryCount < 3 && (!this.connection || !this.connection.open)) {
        console.log(`Connection to ${targetId} closed before open, retrying (attempt ${retryCount + 1})...`);
        setTimeout(() => {
          if (!this.connection || !this.connection.open) {
            this.connectToPeer(targetId, retryCount + 1);
          }
        }, 1500);
        return;
      }
      if (this.connection === conn) {
        this.onConnectionStatusChange('disconnected');
        this.connection = null;
      }
    });
    
    conn.on('error', (err) => {
      console.warn('Connection error to peer:', conn.peer, err);
      if (targetId && retryCount < 3 && (!this.connection || !this.connection.open)) {
        console.log(`Connection to ${targetId} errored, retrying (attempt ${retryCount + 1})...`);
        setTimeout(() => {
          if (!this.connection || !this.connection.open) {
            this.connectToPeer(targetId, retryCount + 1);
          }
        }, 1500);
        return;
      }
      if (this.connection === conn) {
        this.onConnectionStatusChange('disconnected');
      }
    });
  }

  public sendMessage(message: any) {
    if (this.connection && this.connection.open) {
      this.connection.send(message);
    }
  }

  public startMediaCall(stream: MediaStream) {
    if (!this.peer || !this.connection) return null;
    return this.peer.call(this.connection.peer, stream);
  }

  public disconnect() {
    this.currentPin = null;
    this.role = null;
    if (this.connection) this.connection.close();
    if (this.socket) this.socket.disconnect();
    if (this.peer) this.peer.destroy();
  }
}
