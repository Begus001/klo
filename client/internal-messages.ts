export type Message = ConnectMessage | ConnectionChangedMessage | PlaybackMessage | SeekMessage;

export enum MessageType {
    CONNECT,
    CONNECTION_CHANGED,
    PLAYBACK,
    SEEK,
}

export interface ConnectMessage {
    type: MessageType.CONNECT;
    data?: string;
}

export enum ConnectionState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
}

export interface ConnectionChangedMessage {
    type: MessageType.CONNECTION_CHANGED;
    data: ConnectionState;
}

export interface PlaybackMessage {
    type: MessageType.PLAYBACK;
    data: boolean;
}

export interface SeekMessage {
    type: MessageType.SEEK;
    data: number;
}
