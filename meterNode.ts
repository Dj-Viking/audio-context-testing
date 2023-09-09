/**
 * @see https://webaudio.github.io/web-audio-api/#vu-meter-mode
 */

import { MyMessage } from "meter-processor";

export class MeterNode extends AudioWorkletNode {
    private _updateIntervalInMS: number = 0;
    private _smoothingFactor: number = 0;
    private _meterSvg: SVGRectElement;
    private _volume: number = 0;

    private _levelP: HTMLParagraphElement;
    public constructor(
        context: AudioContext,
        updateIntervalInMS: number,
        meterSvg: SVGRectElement,
        levelP: HTMLParagraphElement
    ) {
        super(context, "meter", {
            numberOfInputs: 1,
            numberOfOutputs: 0,
            channelCount: 1,
            processorOptions: {
                updateIntervalInMS: updateIntervalInMS || 16.67,
            },
        });

        // States in AudioWorkletNode
        this._updateIntervalInMS = updateIntervalInMS;
        this._volume = 0;
        this._meterSvg = meterSvg;
        this._levelP = levelP;

        // Handles updated values from AudioWorkletProcessor on every frame
        this.port.onmessage = (event) => {
            if (event.data.volume) {
                this._volume = event.data.volume;
                // update the meter svg according to the processed volume;
                let newHeight = this._volume * 2000;
                const green = "#00E941";

                const red = "#FF0000";
                const yellow = this._addHexColors(red, green);
                if (newHeight > 233) {
                    this._meterSvg.style.fill = red;
                    newHeight = 233;
                } else if (newHeight >= 200) {
                    this._meterSvg.style.fill = yellow;
                } else {
                    this._meterSvg.style.fill = green;
                }
                this._levelP.textContent = "Volume Level: " + this._volume.toString();
                this._meterSvg.height.baseVal.value = newHeight;
            }
        };
        this.port.start();
    }

    private _addHexColors(hexWithHash1: string, hexWithHash2: string) {
        const int1 = parseInt(hexWithHash1.slice(1), 16);
        const int2 = parseInt(hexWithHash2.slice(1), 16);

        const r1 = (int1 >> 16) & 0xff;
        const g1 = (int1 >> 8) & 0xff;
        const b1 = int1 & 0xff;

        const r2 = (int2 >> 16) & 0xff;
        const g2 = (int2 >> 8) & 0xff;
        const b2 = int2 & 0xff;

        const r = Math.min(r1 + r2, 255);
        const g = Math.min(g1 + g2, 255);
        const b = Math.min(b1 + b2, 255);

        const sumHex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");

        return "#" + sumHex;
    }

    public get updateInterval() {
        return this._updateIntervalInMS;
    }
    public get smoothingFactor() {
        return this._smoothingFactor;
    }
    public set smoothingFactor(updateSmoothingFactor) {
        this._smoothingFactor = updateSmoothingFactor;

        this.port.postMessage({
            smoothingInput: updateSmoothingFactor,
        } as Partial<MyMessage>);
    }
    // keep processor in sync with the main thread in the audio thread
    public set updateInterval(updateIntervalInMS) {
        this._updateIntervalInMS = updateIntervalInMS;

        this.port.postMessage({
            updateIntervalInMS: updateIntervalInMS,
        } as Partial<MyMessage>);
    }
}
