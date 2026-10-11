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
      console.error('Peer error:', err);
      if (err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error' || err.type === 'socket-closed') {
        console.warn('Ignoring non-fatal signaling error:', err.type);
        return;
      }
      if (!this.connection || !this.connection.open) {
        this.onConnectionStatusChange('disconnected');
      }
    });

    // Handle mobile browser app switching (e.g. going to WhatsApp and coming back)
    this.socket.on('connect', () => {
      console.log('Signaling socket connected:', this.socket.id);
      if (this.role === 'host' && this.currentPin && this.id) {
        console.log(`Re-linking host socket for room ${this.currentPin}`);
        this.socket.emit('create-room', { peerId: this.id, existingPin: this.currentPin });
      }
    });
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

  private connectToPeer(targetId: string) {
    if (this.connection && this.connection.open && this.connection.peer === targetId) {
      return;
    }
    this.onConnectionStatusChange('connecting');
    const conn = this.peer.connect(targetId, { reliable: true });
    this.setupConnection(conn);
  }

  private setupConnection(conn: DataConnection) {
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
      if (this.connection === conn) {
        this.onConnectionStatusChange('disconnected');
        this.connection = null;
      }
    });
    
    conn.on('error', (err) => {
      console.error('Connection error:', err);
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
