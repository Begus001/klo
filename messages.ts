export enum MessageType {
    SYNC_1,
    NOT_INIT,
    SYNC_2,
    SEEK,
    PLAYBACK,
    URL_CHANGE,
}

export interface Message {
    type: MessageType;
    data?: any;
}

export interface PlaybackMessage {
    state: boolean;
}

export interface SeekMessage {
    time: number;
}

export interface Sync2Message {
    url: string;
    time: number;
    playbackState: boolean;
}

export interface UrlChangeMessage {
    url: string;
}
