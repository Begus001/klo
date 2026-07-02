export type Message =
    ConnectMessage           |
    ConnectionChangedMessage |
    PlaybackMessage          |
    SeekMessage              |
    SelectTabMessage         |
    DeselectTabMessage       |
    TabSelectedMessage       |
    GetSelectedTabMessage;

export enum MessageType {
    CONNECT,
    CONNECTION_CHANGED,
    PLAYBACK,
    SEEK,
    SELECT_TAB,
    DESELECT_TAB,
    TAB_SELECTED,
    GET_SELECTED_TAB,
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

export interface SelectTabMessage {
    type: MessageType.SELECT_TAB;
    data: undefined;
}

export interface DeselectTabMessage {
    type: MessageType.DESELECT_TAB;
    data: undefined;
}

export interface TabSelectedMessage {
  type: MessageType.TAB_SELECTED;
  data?: browser.tabs.Tab;
}

export interface GetSelectedTabMessage {
    type: MessageType.GET_SELECTED_TAB;
    data: undefined;
}
