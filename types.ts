// WEBIDL for MediaStreamTrack interface
// @see https://w3c.github.io/mediacapture-main/#dom-mediastream
// [Exposed=Window]
// interface MediaStream : EventTarget {
//   constructor();
//   constructor(MediaStream stream);
//   constructor(sequence<MediaStreamTrack> tracks);
//   readonly attribute DOMString id;
//   sequence<MediaStreamTrack> getAudioTracks();
//   sequence<MediaStreamTrack> getVideoTracks();
//   sequence<MediaStreamTrack> getTracks();
//   MediaStreamTrack? getTrackById(DOMString trackId);
//   undefined addTrack(MediaStreamTrack track);
//   undefined removeTrack(MediaStreamTrack track);
//   MediaStream clone();
//   readonly attribute boolean active;
//   attribute EventHandler onaddtrack;
//   attribute EventHandler onremovetrack;
// };

// dictionary AudioWorkletNodeOptions : AudioNodeOptions {
//     unsigned long numberOfInputs = 1;
//     unsigned long numberOfOutputs = 1;
//     sequence<unsigned long> outputChannelCount;
//     record<DOMString, double> parameterData;
//     object processorOptions;
// };
export {};

declare global {
    class AudioWorkletProcessor {
        public readonly port: globalThis.MessagePort;
        constructor(options: AudioWorkletNodeOptions);
        public process(
            inputs: Float32Array[][],
            outputs: Float32Array[][],
            parameters: Record<string, unknown>
        ): boolean;
    }
    /**
     * attaches a custom processor to a label, which would serve as the processor for a particular audio graph node
     * @param processorName {string}
     * @param processor {AudioWorkletProcessor}
     */
    function registerProcessor(
        processorName: string,
        processor: typeof AudioWorkletProcessor
    ): void;
    interface Navigator {
        getUserMedia(
            options: { video?: boolean; audio?: boolean },
            success: (stream: MediaStream) => void,
            error?: (error: string) => void
        ): void;
        getUserMedia(options: { video?: boolean; audio?: boolean }): MediaStream;
    }
    interface CSSStyleDeclaration {
        y: number;
        x: number;
    }
    interface EventTarget {
        value: string;
    }
}
