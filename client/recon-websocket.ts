export class ReconWebSocket {
    private ws: WebSocket | null = null;
    private url = "";
    private reconnectDelayMs = 1000;
    private reconnectTimeout?: NodeJS.Timeout;
    private manuallyClosed = false;

    constructor(
        private readonly onMessage: (ws: WebSocket, data: any) => void,
        private readonly onConnecting?: (ws: WebSocket) => void,
        private readonly onConnected?: (ws: WebSocket) => void,
        private readonly onDisconnected?: (ws: WebSocket) => void,
        private readonly onError?: (err: Event) => void,
    ) {}

    async connect(url: string): Promise<void> {
        this.url = url;
        this.manuallyClosed = false;
        clearTimeout(this.reconnectTimeout);

        return new Promise<void>((resolve, reject) => {
            console.debug("trying to connect");
            const ws = new WebSocket(url);
            this.ws = ws;

            this.onConnecting?.(this.ws);

            const cleanup = () => {
                ws.onopen = null;
                ws.onerror = null;
            };

            ws.onopen = () => {
                cleanup();
                console.debug("connected");
                this.onConnected?.(this.ws!);
                resolve();
            };

            ws.onerror = (e) => {
                cleanup();
                reject(new Error(`Failed to connect to ${url}`));
                console.debug(e);
                this.onError?.(e);
            };

            ws.onmessage = (e) => {
                this.onMessage(this.ws!, e.data);
            };

            ws.onclose = () => {
                if (!this.manuallyClosed) {
                    console.debug("disconnected");
                    this.scheduleReconnect();
                }
            };
        });
    }

    private scheduleReconnect() {
        this.reconnectTimeout = setTimeout(() => {
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
        clearTimeout(this.reconnectTimeout);
        this.onDisconnected?.(this.ws!);
        this.manuallyClosed = true;
        this.ws?.close();
        this.ws = null;
    }
}
