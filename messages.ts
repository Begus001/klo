export enum MessageType {
    SYNC_1,
    NOT_INIT,
    SYNC_2,
    SEEK,
    PLAYBACK,
    URL_CHANGE,
}

export interface Message {
    type: MessageType,
    data?: any
}

export class PlaybackMessage implements Message {
    type = MessageType.PLAYBACK;
    data: boolean;
    constructor(state: boolean) {
        this.data = state;
    }
}

export class SeekMessage implements Message {
    type = MessageType.SEEK;
    data: number;
    constructor(time: number) {
        this.data = time;
    }
}

export interface VideoState {
    url: string;
    time: number;
    playbackState: boolean;
}

export class Sync2Message implements Message {
    type = MessageType.SYNC_2;
    data: VideoState;
    constructor(state: VideoState) {
        this.data = state;
    }
}

export class UrlChangeMessage implements Message {
    type = MessageType.URL_CHANGE;
    data: string;
    constructor(url: string) {
        this.data = url;
    }
}
