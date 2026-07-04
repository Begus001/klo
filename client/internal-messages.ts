export class Tab {
    constructor(
        public id: number,
        public url: string,
        public title: string,
        public winId: number,
    ) { }

    static fromBrowserTab(bt: browser.tabs.Tab | undefined): Tab | undefined {
        if (!bt || bt.id === undefined || !bt.url || !bt.title || bt.windowId === undefined) {
            return undefined;
        }
        return new Tab(bt.id, bt.url, bt.title, bt.windowId);
    }
}

export enum MessageType {
    CONNECT,
    CONNECTION_CHANGED,
    CONNECTION_STATE_REQ,
    PLAYBACK,
    SEEK,
    SELECT_TAB,
    DESELECT_TAB,
    TAB_SELECTED,
    TAB_CHANGED,
    TAB_INFO_REQ,
    REGRAB_VIDEO_ELEMENT,
    PLAYER_CONTROL_PLAY,
    PLAYER_CONTROL_PAUSE,
    PLAYER_CONTROL_FORWARD,
    PLAYER_CONTROL_BACKWARD,
    FORCE_SYNC_PLAYBACK,
    FORCE_SYNC_URL,
    SET_ACCEPT_URL_CHANGE,
    GET_ACCEPT_URL_CHANGE,
}

export type Message =
    ConnectMessage                |
    ConnectionChangedMessage      |
    ConnectionStateRequestMessage |
    PlaybackMessage               |
    SeekMessage                   |
    SelectTabMessage              |
    DeselectTabMessage            |
    TabSelectedMessage            |
    TabChangedMessage             |
    TabInfoRequestMessage         |
    RegrabVideoElementMessage     |
    PlayerControlPlayMessage      |
    PlayerControlPauseMessage     |
    PlayerControlForwardMessage   |
    PlayerControlBackwardMessage  |
    ForceSyncPlaybackMessage      |
    ForceSyncUrlMessage           |
    SetAcceptUrlChangeMessage     |
    GetAcceptUrlChangeMessage;

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

export interface ConnectionStateRequestMessage {
    type: MessageType.CONNECTION_STATE_REQ,
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
  data?: Tab;
}

export interface TabChangedMessage {
    type: MessageType.TAB_CHANGED;
    data: {
        changeInfo: browser.tabs._OnUpdatedChangeInfo;
        tab: Tab;
    };
}

export interface TabInfoRequestMessage {
    type: MessageType.TAB_INFO_REQ;
}

export interface RegrabVideoElementMessage {
    type: MessageType.REGRAB_VIDEO_ELEMENT;
}

export interface PlayerControlPlayMessage {
    type: MessageType.PLAYER_CONTROL_PLAY;
}

export interface PlayerControlPauseMessage {
    type: MessageType.PLAYER_CONTROL_PAUSE;
}

export interface PlayerControlForwardMessage {
    type: MessageType.PLAYER_CONTROL_FORWARD;
    data: number;
}

export interface PlayerControlBackwardMessage {
    type: MessageType.PLAYER_CONTROL_BACKWARD;
    data: number;
}

export interface ForceSyncPlaybackMessage {
    type: MessageType.FORCE_SYNC_PLAYBACK
}

export interface ForceSyncUrlMessage {
    type: MessageType.FORCE_SYNC_URL
}

export interface AcceptUrlChangeData {
    automatic: boolean;
    manual: boolean;
}

export interface SetAcceptUrlChangeMessage {
    type: MessageType.SET_ACCEPT_URL_CHANGE,
    data: AcceptUrlChangeData
}

export interface GetAcceptUrlChangeMessage {
    type: MessageType.GET_ACCEPT_URL_CHANGE
}
