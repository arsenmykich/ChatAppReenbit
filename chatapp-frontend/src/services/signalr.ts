import * as signalR from '@microsoft/signalr';

export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  public async startConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
    }

    this.token = localStorage.getItem('authToken');

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5281/chathub', {
        accessTokenFactory: () => {
          console.log('AccessTokenFactory called, token:', this.token ? 'exists' : 'null');
          return this.token || '';
        },
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR connected successfully');
    } catch (error) {
      console.error('SignalR connection failed:', error);
      throw error;
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('SignalR disconnected');
    }
  }

  public onReceiveMessage(callback: (message: any) => void): void {
    if (this.connection) {
      this.connection.on('ReceiveMessage', callback);
    }
  }

  public onUserConnected(callback: (message: string) => void): void {
    if (this.connection) {
      this.connection.on('UserConnected', callback);
    }
  }

  public onUserDisconnected(callback: (message: string) => void): void {
    if (this.connection) {
      this.connection.on('UserDisconnected', callback);
    }
  }

  public onError(callback: (error: string) => void): void {
    if (this.connection) {
      this.connection.on('Error', callback);
    }
  }

  public async sendMessage(message: string, roomId: string = 'general'): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SendMessage', message, roomId);
    } else {
      throw new Error('SignalR connection not established');
    }
  }

  public async joinRoom(roomId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinRoom', roomId);
    }
  }

  public async leaveRoom(roomId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveRoom', roomId);
    }
  }

  public getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  public updateToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }
}

export const signalRService = new SignalRService(); 