export type Message =
    PlaybackMessage |
    SeekMessage     |
    UrlChangeMessage;

export enum MessageType {
    PLAYBACK,
    SEEK,
    URL_CHANGE,
}

export interface PlaybackMessage {
    type: MessageType.PLAYBACK;
    data: boolean;
}

export interface SeekMessage {
    type: MessageType.SEEK;
    data: number;
}

export interface UrlChangeMessage {
    type: MessageType.URL_CHANGE;
    data: string;
}

export interface VideoState {
    url: string;
    time: number;
    playbackState: boolean;
}
