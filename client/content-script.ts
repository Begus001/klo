import { Message, MessageType, Sync2Message, PlaybackMessage, SeekMessage, UrlChangeMessage } from "../messages.js";

let targetVideoElement: HTMLVideoElement | null = null;
let isProgrammaticSeek = false;
let isProgrammaticPlay = false;
let isProgrammaticPause = false;

class ReconWebSocket {
    private ws: WebSocket | null = null;
    private url = "";
    private reconnectDelayMs = 200;
    private manuallyClosed = false;

    constructor(
        private readonly onMessage: (ws: WebSocket, data: any) => void,
        private readonly onError?: (err: Event) => void,
    ) {}

    async connect(url: string): Promise<void> {
        this.url = url;
        this.manuallyClosed = false;

        return new Promise<void>((resolve, reject) => {
            debug("try connect");
            const ws = new WebSocket(url);
            this.ws = ws;

            const cleanup = () => {
                ws.onopen = null;
                ws.onerror = null;
            };

            ws.onopen = () => {
                cleanup();
                resolve();
            };

            ws.onerror = (e) => {
                cleanup();
                reject(new Error(`Failed to connect to ${url}`));
                this.onError?.(e);
            };

            ws.onmessage = (e) => {
                this.onMessage(this.ws!, e.data);
            };

            ws.onclose = () => {
                if (!this.manuallyClosed) {
                    this.scheduleReconnect();
                }
            };
        });
    }

    private scheduleReconnect() {
        setTimeout(() => {
            if (!this.manuallyClosed) {
                this.connect(this.url).catch(() => {
                    /* swallow initial connect failure; reconnect loop continues */
                });
            }
        }, this.reconnectDelayMs);
    }

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        }
    }

    close() {
        this.manuallyClosed = true;
        this.ws?.close();
        this.ws = null;
    }
}


function debug(msg: string) {
    console.debug("Klo:", msg);
}

function log(msg: string) {
    console.log("Klo:", msg);
}

function warn(msg: string) {
    console.warn("Klo:", msg);
}

function error(msg: string) {
    console.error("Klo:", msg);
}

async function main() {
    let targetVideoElement = document.querySelector("video");
    if (!targetVideoElement) {
        warn("no video element on this page");
        return;
    }

    debug("video element found");

    const onMsg = (ws: WebSocket, strmsg: string) => {
        log(strmsg);
        let msg: Message = JSON.parse(strmsg);
        if (msg.type === MessageType.SYNC_1) {
            ws.send(JSON.stringify({
                type: MessageType.SYNC_2,
                data: {
                    playbackState: !targetVideoElement.paused,
                    time: targetVideoElement.currentTime,
                    url: window.location.href,
                } satisfies Sync2Message
            } satisfies Message));
        }
        else if (msg.type === MessageType.SYNC_2) {
            let data = msg.data as Sync2Message;
            if (window.location.href != data.url) {
                log(window.location.href);
                error(data.url);
                window.location.href = data.url;
            }
            seek(data.time);
            if (data.playbackState) {
                play();
            }
            else {
                pause();
            }
        }
        else if (msg.type === MessageType.PLAYBACK) {
            let data = msg.data as PlaybackMessage;
            if (data.state) {
                play();
            }
            else {
                pause();
            }
        }
        else if (msg.type === MessageType.SEEK) {
            let data = msg.data as SeekMessage;
            if (data.time < 0 || data.time > targetVideoElement.duration) {
                warn("Received invalid seek message: " + data.time);
                return;
            }
            seek(data.time);
        } else if (msg.type === MessageType.URL_CHANGE) {
            error("Url change is not implemented");
            return;
        }
    };

    let ws = new ReconWebSocket(onMsg, () => {
        error("WEBSOCKET ERROR");
    });
    await ws.connect("ws://localhost:42070");

    log("connected")

    ws.send(JSON.stringify({
        type: MessageType.SYNC_1
    } satisfies Message));

    targetVideoElement.addEventListener("seeking", () => {
        if (isProgrammaticSeek) {
            isProgrammaticSeek = false;
            return;
        }

        debug("user seek");
        ws.send(JSON.stringify({
            type: MessageType.SEEK,
            data: {
                time: targetVideoElement.currentTime,
            } satisfies SeekMessage
        } satisfies Message));
    });
    targetVideoElement.addEventListener("play", (e) => {
        if (isProgrammaticPlay) {
            isProgrammaticPlay = false;
            return;
        }

        debug("user play");
        ws.send(JSON.stringify({
            type: MessageType.PLAYBACK,
            data: {
                state: true
            } satisfies PlaybackMessage
        } satisfies Message));

    });
    targetVideoElement.addEventListener("pause", () => {
        if (isProgrammaticPause) {
            isProgrammaticPause = false;
            return;
        }

        debug("user pause");
        ws.send(JSON.stringify({
            type: MessageType.PLAYBACK,
            data: {
                state: false
            } satisfies PlaybackMessage
        } satisfies Message));
    });
}

function seek(time: number) {
    if (targetVideoElement == null) {
        targetVideoElement = document.querySelector("video");
    }
    debug("program seek");
    isProgrammaticSeek = true;
    targetVideoElement!.currentTime = time;
}

function play() {
    if (targetVideoElement == null) {
        targetVideoElement = document.querySelector("video");
    }
    debug("program play");
    isProgrammaticPlay = true;
    targetVideoElement!.play();
}

function pause() {
    if (targetVideoElement == null) {
        targetVideoElement = document.querySelector("video");
    }
    debug("program pause");
    isProgrammaticPause = true;
    targetVideoElement!.pause();
}

main()

// setInterval(() => {
//     let rand = Math.random();
//     if (rand < 1/3) {
//         play();
//     } else if (rand < 2/3) {
//         pause();
//     } else {
//         seek(Math.random() * 10);
//     }
// }, 2000);

