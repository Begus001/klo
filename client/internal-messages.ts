export type Message = ConnectMessage | ConnectionChangedMessage;

export enum MessageType {
    CONNECT,
    CONNECTION_CHANGED
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
