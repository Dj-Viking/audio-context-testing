class Main {
    public rootEl: HTMLDivElement;
    public audioCtx: AudioContext = null as any;
    public ctxInfoEl: HTMLDivElement = null as any;
    public streamSource: MediaStreamAudioSourceNode = null as any;
    public constructor() {
        this.rootEl = document.querySelector("#root") as HTMLDivElement;
        this.init();
    }

    public getUserMedia(): void {
        window.navigator.getUserMedia(
            {
                audio: true,
            },
            (stream) => {
                console.log("success", stream);
                this.streamSource = {
                    ...this.streamSource,
                    mediaStream: stream,
                };
                console.log("stream source", this.streamSource);
            },
            (err) => {
                console.log("error", err);
            }
        );
    }

    public startContext(this: Main, event: MouseEvent): void {
        console.log("event", event);
        this.audioCtx = new AudioContext();

        const content: HTMLParagraphElement[] = [];

        let p = document.createElement("p");
        p.textContent = "base latency: " + this.audioCtx.baseLatency.toString();
        content.push(p);

        p = document.createElement("p");
        p.textContent = "current time: " + this.audioCtx.currentTime.toString();
        content.push(p);

        p = document.createElement("p");
        p.textContent = "audio context state: " + this.audioCtx.state;
        content.push(p);

        p = document.createElement("p");
        p.textContent =
            "audio context sample rate: " + this.audioCtx.sampleRate;
        content.push(p);

        console.log("content", content);
        this.ctxInfoEl.innerHTML = "";

        content.forEach((el) => {
            this.ctxInfoEl.appendChild(el);
        });
        this.getUserMedia();
    }
    public init(): void {
        console.log("my ctx", this.audioCtx);

        const btn = document.createElement("button");
        btn.textContent = "start audio context";
        btn.addEventListener("click", (event) => {
            this.startContext(event);
        });

        this.ctxInfoEl = document.createElement("div");
        this.ctxInfoEl.textContent = "waiting to start audio context";

        btn.click();

        this.rootEl.appendChild(btn);
        this.rootEl.appendChild(this.ctxInfoEl);
    }
    public run(): void {
        console.log("running main");
    }
}

new Main().run();
