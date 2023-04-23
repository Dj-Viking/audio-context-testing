// TODO: create processor worklet for processing audio buffers!
/**
 * @see https://webaudio.github.io/web-audio-api/#AudioWorkletNodeOptions
 * 
 * audio worklet global scope example
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope
 * 
 * dictionary AudioWorkletNodeOptions : AudioNodeOptions {
    unsigned long numberOfInputs = 1;
    unsigned long numberOfOutputs = 1;
    sequence<unsigned long> outputChannelCount;
    record<DOMString, double> parameterData;
    object processorOptions;
};
 */

interface IAudioWorkletProcessor {
    readonly port: globalThis.MessagePort
    process(
        inputs: Array<Float32Array>, 
        outputs: Array<Float32Array>, 
        parameters: Record<string, unknown>): boolean
}

// processor for the meterNode class

// test-processor.js
// @ts-ignore
export class TestProcessor extends AudioWorkletProcessor implements IAudioWorkletProcessor {
    // @ts-ignore this will be defined once instantiated by the audio worklet global scope thread
    private readonly port: globalThis.MessagePort;
    private readonly SMOOTHING_FACTOR = 0.9;
    private readonly MINIMUM_VALUE = 0.0000001;
    private _volume: number;
    private _updateIntervalInMS: number;
    private _updateNextFrame: number;
    // public port: MessagePort;
    constructor(options: AudioWorkletNodeOptions) {
        super(options);
        console.log("options from register in global audio worklet scope", options);
        console.log("number of inputs to audio worklet", options.numberOfInputs);

        this._volume = 0.01
        this._updateIntervalInMS = 0;
        this._updateNextFrame = this._updateIntervalInMS;
        
        // @ts-ignore
        this.port.onmessage = event => {
            if (event.data.updateIntervalInMS)
                this._updateIntervalInMS = event.data.updateIntervalInMS;
        }

    }

    private get intervalInFrames () {
        const sampleRate = 48000
        return this._updateIntervalInMS / 1000 * sampleRate;
    }
    // public bool override
    process(
        inputs: Array<Float32Array>, 
        outputs: Array<Float32Array>, 
        parameters: Record<string, unknown>
    ): boolean {
        // console.log("process", arguments);
        const input = inputs[0];
        // console.log('input', input);
        // Note that the input will be down-mixed to mono; however, if no inputs are
        // connected then zero channels will be passed in.
        if (input.length > 0) {
            // @ts-ignore
            const samples = input[0] as number[];
            // console.log('samples', samples);
            let sum = 0;
            let rms = 0;
            // Calculated the squared-sum.
            for (let i = 0; i < samples.length; ++i)
                sum += samples[i] * samples[i];
            // Calculate the RMS level and update the volume.
            rms = Math.sqrt(sum / samples.length);
            this._volume = Math.max(rms, this._volume * this.SMOOTHING_FACTOR);
            // Update and sync the volume property with the main thread.
            this._updateNextFrame -= samples.length;
            if (this._updateNextFrame < 0) {
                this._updateNextFrame += this.intervalInFrames;
                this.port.postMessage({ volume: this._volume });
            }
        }
        // Keep on processing if the volume is above a threshold, so that
        // disconnecting inputs does not immediately cause the meter to stop
        // computing its smoothed value.
        // console.log("process volume", this._volume, "min value", this.MINIMUM_VALUE);
        return true;
        // if this returns false the processor dies and doesn't process anymore
        // the context will have to be reinstantiated
        // return this._volume >= this.MINIMUM_VALUE;
    }
}
// const registerProcessor = function (name: string, processor: unknown) {};
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope/registerProcessor
 */
// @ts-ignore
registerProcessor("meter", TestProcessor);