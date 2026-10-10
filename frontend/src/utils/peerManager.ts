import Peer, { type DataConnection } from 'peerjs';
import { io, Socket } from 'socket.io-client';

const SIGNALING_URL = import.meta.env.VITE_BACKEND_URL || '/';

export class PeerManager {
  private peer: Peer;
  private socket: Socket;
  public id: string | null = null;
  public connection: DataConnection | null = null;
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
    this.peer = new Peer({
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
    });

    this.peer.on('open', (id) => {
      this.id = id;
    });

    this.peer.on('connection', (conn) => {
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
      this.onConnectionStatusChange('disconnected');
    });
  }

  // Called by Host
  public async createRoom(existingPin?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.id) {
        this.peer.on('open', () => this.initRoom(resolve, reject, existingPin));
      } else {
        this.initRoom(resolve, reject, existingPin);
      }
    });
  }

  private initRoom(resolve: Function, reject: Function, existingPin?: string) {
    this.socket.emit('create-room', { peerId: this.id, existingPin }, (res: any) => {
      if (res.success) {
        resolve(res.pin);
      } else {
        reject(res.error);
      }
    });

    // Listen for guest joining
    this.socket.on('guest-joined', ({ guestPeerId }) => {
      console.log('Guest joined with peer ID:', guestPeerId);
      // Wait for guest to connect to us instead, or we connect to them
      // Since Guest receives hostPeerId, guest will initiate the PeerJS connect.
    });
  }

  // Called by Guest
  public async joinRoom(pin: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doJoin = () => {
        this.socket.emit('join-room', { pin, peerId: this.id }, (res: any) => {
          if (res.success) {
            console.log('Got host peer ID:', res.hostPeerId);
            this.connectToPeer(res.hostPeerId);
            resolve();
          } else {
            reject(res.error);
          }
        });
      };

      if (!this.id) {
        this.peer.on('open', doJoin);
      } else {
        doJoin();
      }
    });
  }

  private connectToPeer(targetId: string) {
    this.onConnectionStatusChange('connecting');
    const conn = this.peer.connect(targetId);
    this.setupConnection(conn);
  }

  private setupConnection(conn: DataConnection) {
    this.connection = conn;
    
    conn.on('open', () => {
      console.log('Connected to peer:', conn.peer);
      this.onConnectionStatusChange('connected');
    });

    conn.on('data', (data) => {
      this.onMessageReceived(data);
    });

    conn.on('close', () => {
      this.onConnectionStatusChange('disconnected');
      this.connection = null;
    });
    
    conn.on('error', (err) => {
      console.error('Connection error:', err);
      this.onConnectionStatusChange('disconnected');
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
    if (this.connection) this.connection.close();
    if (this.socket) this.socket.disconnect();
    if (this.peer) this.peer.destroy();
  }
}
