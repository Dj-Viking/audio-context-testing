/**
    @see https://stackoverflow.com/questions/27846392/access-microphone-from-a-browser-javascript 

    audio worklet 
    @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet

    official web audio API docs
    @see https://webaudio.github.io/web-audio-api
*/

import { MeterNode } from "./meterNode.js";

class Main {
    private rootEl: HTMLDivElement;
    private meterSvg: SVGRectElement;
    private audioCtx: AudioContext = null as any;
    private volumeCtrl: { inputEl: HTMLInputElement; valueEl: HTMLSpanElement } = {} as any;
    private smoothingCtrl: { inputEl: HTMLInputElement; valueEl: HTMLSpanElement } = {} as any;
    private volumeLevel: HTMLParagraphElement;
    private ctxInfoEl: HTMLDivElement = null as any;

    public constructor() {
        this.rootEl = document.querySelector("#root") as HTMLDivElement;
        this.meterSvg = document.querySelector("#meter-signal-rect") as SVGRectElement;
        this.volumeLevel = document.querySelector("#volumeLevel") as HTMLParagraphElement;
        this.meterSvg.style.y = (-232).toString();
        this.meterSvg.style.x = (-76).toString();
        this.init();
    }

    private async gotStream(stream: MediaStream): Promise<void> {
        this.audioCtx = new AudioContext();

        this.debugCurrentAudioContext(this.audioCtx);

        // have to provide dist in the path because I think the context of this index.js is within the scope of dist folder
        // defined in the script tag of index.html otherwise we get "user aborted" error message which doesn't describe what went wrong
        // we only get more descriptive messages if the promise is uncaught - caught errors do not yield anything helpful here
        await this.audioCtx.audioWorklet.addModule("./dist/meter-processor.js");

        // test the meter node with an oscillator
        // const oscillator = new OscillatorNode(this.audioCtx);
        // const vuMeterNode = new MeterNode(this.audioCtx, 25);
        // oscillator.connect(vuMeterNode);
        // oscillator.start();

        // apply constraints to the audio track

        // first remove the track from usermedia, apply constraints, and then add the audio track back into the userMediaStream
        // in addition to these constraints applied to the track at runtime

        // there are experimental flags in chrome that actually try to prevent feedback
        // @see https://support.google.com/chrome/thread/210106028/google-chrome-constantly-auto-adjusting-microphone-levels-solved?hl=en

        // adjust the flags here @see chrome://flags/

        // just grab the first track since chrome only has one input set as a "microphone input"
        const audioTrack = stream.getAudioTracks()[0];

        stream.removeTrack(audioTrack);

        await audioTrack.applyConstraints({
            autoGainControl: false,
            noiseSuppression: false,
            echoCancellation: false,
        });

        console.log("audio track", audioTrack);
        console.log("audio track constraints", audioTrack.getConstraints());

        stream.addTrack(audioTrack);

        // build audio graph

        // Create an AudioNode from the stream. in this case is the user microphone from getUserMedia callback
        const streamNode = this.audioCtx.createMediaStreamSource(stream);

        // create source node where the audio will be taken into
        const mediaStreamSource = this.audioCtx.createMediaStreamSource(streamNode.mediaStream);

        // create a meter processing node
        const meterNode = new MeterNode(this.audioCtx, 15, this.meterSvg, this.volumeLevel);

        const gainNode = this.audioCtx.createGain();
        // allow the input el to control the input gain of the microphone into the browser
        this.volumeCtrl.inputEl.addEventListener("input", (event) => {
            this.volumeCtrl.inputEl.value = event.target!.value;
            this.volumeCtrl.valueEl.textContent = event.target!.value;
            gainNode.gain.value = Number(event.target!.value);
        });

        // adjust smoothing in the meterprocessor via the meternode message port
        this.smoothingCtrl.inputEl.addEventListener("input", (e) => {
            this.smoothingCtrl.inputEl.value = e.target!.value;
            this.smoothingCtrl.valueEl.textContent = e.target!.value;
            meterNode.smoothingFactor = Number(e.target!.value);
        });

        // Connect the stream to the destination to hear yourself (or any other node for processing!)
        mediaStreamSource.connect(gainNode);
        // connect gain node to meter node for worklet thread processing
        gainNode.connect(meterNode);
        // plug microphone input into the speaker output
        gainNode.connect(this.audioCtx.destination);
    }

    // basically allows microphone input into the browser after user allows access
    private getUserMedia(): void {
        window.navigator.getUserMedia(
            {
                audio: true,
            },
            (stream) => this.gotStream(stream),
            (err) => {
                console.log("get user media error", err);
            }
        );
    }

    public debugCurrentAudioContext(ctx: AudioContext): void {
        const content: HTMLParagraphElement[] = [];

        let p = document.createElement("p");
        p.textContent = "base latency: " + ctx.baseLatency.toString();
        content.push(p);

        p = document.createElement("p");
        p.textContent = "current time: " + ctx.currentTime.toString();
        content.push(p);

        p = document.createElement("p");
        p.textContent = "audio context state: " + ctx.state;
        content.push(p);

        p = document.createElement("p");
        p.textContent = "audio context sample rate: " + ctx.sampleRate;
        content.push(p);

        console.log("content", content);
        this.ctxInfoEl.innerHTML = "";

        content.forEach((el) => {
            this.ctxInfoEl.appendChild(el);
        });
    }

    private startContext(this: Main, event: MouseEvent): void {
        console.log("start context event", event);
        // this.audioCtx = new AudioContext();

        // this.debugCurrentAudioContext(this.audioCtx);

        this.getUserMedia();
    }
    private init(): void {
        const btn = document.createElement("button");
        btn.textContent = "start audio context";
        btn.addEventListener("click", (event) => {
            this.startContext(event);
        });

        const row = document.querySelector("#context-info-row")!;

        const ctxInfoElContainer = document.createElement("div");
        ctxInfoElContainer.style.display = "flex";
        ctxInfoElContainer.style.flexDirection = "column";
        ctxInfoElContainer.style.justifyContent = "center";
        row.append(ctxInfoElContainer);

        this.ctxInfoEl = document.createElement("div");
        this.ctxInfoEl.id = "ctxInfoEl";
        this.ctxInfoEl.textContent = "waiting to start audio context";
        ctxInfoElContainer.append(this.ctxInfoEl);

        this.volumeCtrl.inputEl = document.querySelector("#volume") as HTMLInputElement;
        this.volumeCtrl.valueEl = document.querySelector("#volume-ctrl-view") as HTMLSpanElement;
        this.volumeCtrl.valueEl.textContent = "0.5";

        this.smoothingCtrl.inputEl = document.querySelector("#smoothing") as HTMLInputElement;
        this.smoothingCtrl.valueEl = document.querySelector(
            "#smoothing-ctrl-view"
        ) as HTMLSpanElement;
        this.smoothingCtrl.valueEl.textContent = "0.5";

        this.rootEl.append(
            btn);
    }
    public run(): void {
        console.log("running main");
    }
}

new Main().run();
