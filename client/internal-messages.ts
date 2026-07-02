export type Message =
    ConnectMessage           |
    ConnectionChangedMessage |
    PlaybackMessage          |
    SeekMessage              |
    SelectTabMessage         |
    DeselectTabMessage       |
    TabSelectedMessage       |
    TabChangedMessage        |
    TabInfoRequestMessage;

export enum MessageType {
    CONNECT,
    CONNECTION_CHANGED,
    PLAYBACK,
    SEEK,
    SELECT_TAB,
    DESELECT_TAB,
    TAB_SELECTED,
    TAB_CHANGED,
    TAB_INFO_REQ,
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

export interface TabChangedMessage {
    type: MessageType.TAB_CHANGED;
    data: {
        changeInfo: browser.tabs._OnUpdatedChangeInfo;
        tab: browser.tabs.Tab;
    };
}

export interface TabInfoRequestMessage {
    type: MessageType.TAB_INFO_REQ;
}
