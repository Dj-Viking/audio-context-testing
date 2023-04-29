/**
 * @see https://webaudio.github.io/web-audio-api/#vu-meter-mode
 */

export class MeterNode extends AudioWorkletNode {
    private _updateIntervalInMS: number = 0;
    private _meterSvg: SVGRectElement;
    private _volume: number = 0;
    constructor (context: AudioContext, updateIntervalInMS: number, meterSvg: SVGRectElement) {
        super(context, 'meter', {
            numberOfInputs: 1,
            numberOfOutputs: 0,
            channelCount: 1,
            processorOptions: {
                updateIntervalInMS: updateIntervalInMS || 16.67,
            }
        });
        
        // States in AudioWorkletNode
        this._updateIntervalInMS = updateIntervalInMS;
        this._volume = 0;
        this._meterSvg = meterSvg;

        // Handles updated values from AudioWorkletProcessor
        this.port.onmessage = event => {
            if (event.data.volume) {
                this._volume = event.data.volume;
                // update the meter svg according to the processed volume;
                let newHeight = this._volume * 1000;
                if (newHeight > 233) {
                    newHeight = 233;
                }
                this._meterSvg.height.baseVal.value = newHeight;
                // console.log("get message from processor for volume", this._volume);
            }
        }
        this.port.start();
    }
    public get updateInterval() {
        return this._updateIntervalInMS;
    }
    public set updateInterval(updateIntervalInMS) {
        this._updateIntervalInMS = updateIntervalInMS;
        this.port.postMessage({ updateIntervalInMS: updateIntervalInMS });
    }
};