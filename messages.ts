export type Message = PlaybackMessage | SeekMessage;

export enum MessageType {
    PLAYBACK,
    SEEK,
}

export interface PlaybackMessage {
    type: MessageType.PLAYBACK;
    data: boolean;
}

export interface SeekMessage {
    type: MessageType.SEEK;
    data: number;
}

export interface VideoState {
    url: string;
    time: number;
    playbackState: boolean;
}
