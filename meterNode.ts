/**
 * @see https://webaudio.github.io/web-audio-api/#vu-meter-mode
 */

export class MeterNode extends AudioWorkletNode {
    private _updateIntervalInMS: number = 0;
    private _meterSvg: SVGRectElement;
    private _volume: number = 0;
    constructor(context: AudioContext, updateIntervalInMS: number, meterSvg: SVGRectElement) {
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

        // Handles updated values from AudioWorkletProcessor
        this.port.onmessage = (event) => {
            if (event.data.volume) {
                this._volume = event.data.volume;
                // update the meter svg according to the processed volume;
                let newHeight = this._volume * 1000;
                const green = "#00E941";
                const red = "#FF0000";
                if (newHeight > 233) {
                    this._meterSvg.style.fill = red;
                    newHeight = 233;
                } else {
                    this._meterSvg.style.fill = green;
                }
                this._meterSvg.height.baseVal.value = newHeight;
            }
        };
        this.port.start();
    }
    public get updateInterval() {
        return this._updateIntervalInMS;
    }
    public set updateInterval(updateIntervalInMS) {
        this._updateIntervalInMS = updateIntervalInMS;
        this.port.postMessage({ updateIntervalInMS: updateIntervalInMS });
    }
}
