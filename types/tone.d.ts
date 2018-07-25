// Type definitions for TONE.JS
// Project: https://github.com/Tonejs/Tone.js
// Definitions by: Stanley Chen <https://github.com/Ecafracs>
//                 Luke Phillips <https://github.com/lukephills>
//                 Pouya Kary <https://github.com/pmkary>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// These were originally pulled from https://github.com/Tonejs/TypeScript
// but were very out of date and missing a package.json to put it in the proper @types directory.
// When this is fully updated, we can update back to Tonejs as well as contribute to DefinitelyTyped.

// export = Tone;
// export as namespace Tone;

declare namespace Type {
  type Time = number | string;
  type Ticks = number; // The smallest unit of time the Transport supports.
  type NormalRange = number; // [0, 1]
  type AudioRange = number; // [-1, 1]
  type Decibels = number;
  type Interval = number; // half-steps; 12 = one octave
  type Degrees = number; //[0, 360]
  type MIDI = number; // MIDI note number
  type BarsBeatsSixteenths = string; // Time expressed as Bars:Beats:Sixteenths
  type Samples = string; // Time expressed as Bars:Beats:Sixteenths
  type Note = string; // Scientific Pitch Notation, e.g. A4
  type Milliseconds = number;
  type Seconds = number;
  type Hertz = number;
  type Frequency = number;
  type Gain = number;
  type Notation = string; // Duration relative to a measure, e.g. 4n, 2m, 8t
}

interface Tone {
  new(inputs?: number, outputs?: number): Tone;

  input: GainNode | GainNode[];
  output: GainNode | GainNode[];

  set(params: Object | string, value?: number, rampTime?: Type.Time): Tone;
  get(params?: string[] | string): Object;
  toString(): string;

  // CLASS VARS
  context: AudioContext;
  readonly bufferSize: number;
  readonly blockTime: number;
  readonly sampleTime: number;

  // CONNECTIONS
  dispose(): Tone;
  noGC(): Tone;
  connect(unit: Tone | AudioParam | AudioNode, outputNum?: number, inputNum?: number): Tone;
  disconnect(outputNum?:number | AudioNode): Tone;
  connectSeries(...args: Array<Tone | AudioParam | AudioNode>): Tone;
  chain(...nodes: Array<Tone | AudioParam | AudioNode>): Tone;
  fan(...nodes: Array<Tone | AudioParam | AudioNode>): Tone;

  // UTILITIES / HELPERS / MATHS
  defaultArg(given: any, fallback: any): any;
  optionsObject(values: any[], keys: string[], defaults?:Object): Object;

  // TYPE CHECKING
  isUndef(arg: any): boolean;
  isFunction(arg: any): boolean;
  isNumber(arg: any): boolean;
  isObject(arg: any): boolean;
  isBoolean(arg: any): boolean;
  isArray(arg: any): boolean;
  isString(arg: any): boolean;

  // GAIN CONVERSIONS
  equalPowerScale(percent: Type.NormalRange): Type.NormalRange;
  dbToGain(db: Type.Decibels): number;
  gainToDb(gain: Type.NormalRange): Type.Decibels;
  intervalToFrequencyRatio(interval: Type.Interval): number;

  // TIMING
  now(): number;

  // INHERITANCE
  extend(child: ()=>any, parent?: ()=>any): void;

  // BUSES
  send(channelName: string, amount?: number): Tone;
  receive(channelName: string, input?: AudioNode): Tone;

  // Type conversion
  toSeconds(time?: Type.Time, now?: number): Type.Seconds;
  toFrequency(note: Type.Frequency, now?: number): Type.Frequency;
  toTicks(time?: Type.Time): Type.Ticks;

  // Master
  toMaster(): Tone;
}

declare module Tone {

  let input: GainNode | GainNode[];
  let output: GainNode | GainNode[];

  let set: (params: Object | string, value?: number, rampTime?: Type.Time) => Tone;
  let get: (params: string[] | string) => Object;
  let toString: () => string;

  let context: AudioContext;
  let bufferSize: number;
  let blockTime: number;
  let sampleTime: number;

  let dispose: () => Tone;
  let noGC: () => Tone;
  let connect: (unit: Tone | AudioParam | AudioNode, outputNum?: number, inputNum?: number) => Tone;
  let disconnect: (outputNum?:number | AudioNode) => Tone;
  let connectSeries: (...args: Array<Tone | AudioParam | AudioNode>) => Tone;
  let chain: (...nodes: Array<Tone | AudioParam | AudioNode>) => Tone;
  let fan: (...nodes: Array<Tone | AudioParam | AudioNode>) => Tone;

  // UTILITIES / HELPERS / MATHS
  let defaultArg: (given: any, fallback: any) => any;
  let optionsObject: (values: any[], keys: string[], defaults?:Object) => Object;

  // TYPE CHECKING
  let isUndef: (arg: any) => boolean;
  let isFunction: (arg: any) => boolean;
  let isNumber: (arg: any) => boolean;
  let isObject: (arg: any) => boolean;
  let isBoolean: (arg: any) => boolean;
  let isArray: (arg: any) => boolean;
  let isString: (arg: any) => boolean;

  // GAIN CONVERSIONS
  let equalPowerScale: (percent: Type.NormalRange) => Type.NormalRange;
  let dbToGain: (db: Type.Decibels) => number;
  let gainToDb: (gain: Type.NormalRange) => Type.Decibels;
  let intervalToFrequencyRatio: (interval: Type.Interval) => number;

  // TIMING
  let now: () => number;

  // INHERITANCE
  let extend: (child: ()=>any, parent?: ()=>any) => void;

  // BUSES
  let send: (channelName: string, amount?: number) => Tone;
  let receive: (channelName: string, input?: AudioNode) => Tone;

  // Type conversion
  let toSeconds: (time?: Type.Time, now?: number) => Type.Seconds;
  let toFrequency: (note: Type.Frequency, now?: number) => Type.Frequency;
  let toTicks: (time?: Type.Time) => Type.Ticks;

  // Master
  let toMaster: () => Tone;

  import AudioRange = Type.AudioRange;
  let Abs: {
    new(): Tone.Abs;
  };

  interface Abs extends Tone.SignalBase {
    dispose(): Tone.Abs;
  }

  let Add: {
    new(value?: number): Tone.Add;
  };

  interface Add extends Tone.Signal {
    dispose(): Tone.Add;
  }

  let AmplitudeEnvelope: {
    new(attack?: Type.Time | Object, decay?: Type.Time, sustain?: Type.NormalRange, release?: Type.Time): Tone.AmplitudeEnvelope;
  };

  interface AmplitudeEnvelope extends Tone.Envelope {
    dispose(): Tone.AmplitudeEnvelope;
  }

  let AMSynth: {
    new(options?: Object): Tone.AMSynth;
  };

  interface AMSynth extends Tone.Monophonic {
    carrier: Tone.MonoSynth;
    frequency: Tone.Signal;
    harmonicity: number;
    modulator: Tone.MonoSynth;
    dispose(): Tone.AMSynth;
  }

  let AudioToGain: {
    new(): Tone.AudioToGain;
  };

  interface AudioToGain extends Tone.SignalBase {
    dispose(): Tone.AudioToGain;
  }

  let AutoPanner: {
    new(frequency?: Type.Time | Object): Tone.AutoPanner;
  };

  interface AutoPanner extends Effect {
    depth: Type.NormalRange;
    frequency: Type.Time | Object;
    type: string;
    dispose(): Tone.AutoPanner;
    start(time?: Type.Time): Tone.AutoPanner;
    stop(time?: Type.Time): Tone.AutoPanner;
    sync(delay?: Type.Time): Tone.AutoPanner;
    unsync(): Tone.AutoPanner;
  }

  let AutoWah: {
    new(baseFrequency?: Frequency | Object, octaves?: number, sensitivity?: number): Tone.AutoWah;
  };

  interface AutoWah extends Tone.Effect {
    baseFrequency: Frequency;
    gain: Tone.Signal;
    octaves: number;
    Q: Tone.Signal;
    sensitivity: Type.Decibels;
    dispose(): Tone.AutoWah;
  }

  let BitCrusher: {
    new(bits: number | Object): Tone.BitCrusher;
  };

  interface BitCrusher extends Tone.Effect {
    bits: number;
    dispose(): Tone.BitCrusher;
  }

  let Buffer: {
    new(audioBuffer: AudioBuffer | string, onLoad: () => any, onError: () => any): Tone.Buffer;
    [key: string]: any
  };

  interface Buffer extends Tone {
    readonly duration: number;
    readonly length: number;
    readonly loaded: boolean;
    readonly numberOfChannels: number;
    reverse: Boolean;
    dispose(): Tone.Buffer;
    fromArray(array: Array<number>): Tone.Buffer;
    get(): AudioBuffer;
    load(url: string, callback?: (e: any) => any): Tone.Buffer;
    set(buffer: AudioBuffer | Tone.Buffer): Tone.Buffer;
    slice(start: Type.Time, end: Type.Time): Tone.Buffer;
    toArray(channel: number): Array<number>;
    on(): any
  }

  let Chebyshev: {
    new(order: number | Object): Tone.Chebyshev;
  };

  interface Chebyshev extends Tone.Effect {
    order: number;
    oversample: string;
    dispose(): Tone.Chebyshev;
  }

  let Chorus: {
    new(rate?: Frequency | Object, delayTime?: Type.Milliseconds, depth?: Type.NormalRange): Tone.Chorus;
  };

  interface Chorus extends Tone.StereoXFeedbackEffect {
    delayTime: Type.Milliseconds;
    depth: Type.NormalRange;
    frequency: Tone.Signal;
    spread: Type.Degrees;
    type: string;
    dispose(): Tone.Chorus;
  }

  let Clip: {
    new(min: number, max: number): Tone.Clip;
  };

  interface Clip extends Tone.SignalBase {
    max: Tone.Signal;
    min: Tone.Signal;
    dispose(): Tone.Clip;
  }

  let Compressor: {
    new(threshold?: any, ratio?: number): Tone.Compressor; //TODO: Number || Object
  };

  interface Compressor extends Tone {
    attack: Tone.Signal;
    knee: AudioParam;
    ratio: AudioParam;
    release: Tone.Signal;
    threshold: AudioParam;
    dispose(): Tone.Compressor;
  }

  let Convolver: {
    new(url: any): Tone.Convolver; //TODO: Change any to 'string | AudioBuffer' when available
  };

  interface Convolver extends Tone.Effect {
    buffer: AudioBuffer;
    load(url: string, callback?: (e: any) => any): Tone.Convolver;
    dispose(): Tone.Convolver;
  }

  let CrossFade: {
    new(initialFade?: number): Tone.CrossFade;
  };

  interface CrossFade extends Tone {
    a: GainNode;
    b: GainNode;
    fade: Tone.Signal;
    dispose(): Tone.CrossFade;
  }

  let Distortion: {
    new(distortion: any): Tone.Distortion; //TODO: Number || Object
  };

  interface Distortion extends Tone.Effect {
    distortion: number;
    oversample: string;
    dispose(): Tone.Distortion;
  }

  let Draw: {
    schedule(callback: () => any, time: Type.Time): Tone.Draw;
    cancel(after?: Type.Time): Tone.Draw;
  };

  interface Draw extends Tone {
    // Should interact directly with Transport singleton
  }

  let DuoSynth: {
    new(options?: any): Tone.DuoSynth;
  };

  interface DuoSynth extends Tone.Monophonic {
    frequency: Tone.Signal;
    harmonicity: number;
    vibratoAmount: Tone.Signal;
    vibratoRate: Tone.Signal;
    voice0: Tone.MonoSynth;
    voice1: Tone.MonoSynth;
    triggerEnvelopeAttack(time?: Type.Time, velocity?: number): Tone.DuoSynth;
    triggerEnvelopeRelease(time?: Type.Time): Tone.DuoSynth;
  }

  let Effect: {
    new(initialWet?: number): Tone.Effect;
  };

  interface Effect extends Tone {
    wet: Tone.Signal;
    bypass(): Tone.Effect;
    dispose(): Tone.Effect;
  }

  let Envelope: {
    new(attack: any, decay?: Type.Time, sustain?: number, release?: Type.Time): Tone.Envelope;  //TODO: Change 'any' to 'Type.Time | Object'
  };

  interface Envelope extends Tone {
    attack: Type.Time;
    decay: Type.Time;
    release: Type.Time;
    sustain: number;
    dispose(): Tone.Envelope;
    triggerAttack(time?: Type.Time, velocity?: number): Tone.Envelope;
    triggerAttackRelease(duration: Type.Time, time?: Type.Time, velocity?: number): Tone.Envelope;
    triggerRelease(time?: Type.Time): Tone.Envelope;
  }

  let EQ3: {
    new(lowLevel?: any, midLevel?: number, highLevel?: number): Tone.EQ3; //TODO: Change 'any' to 'number | Object'
  };

  interface EQ3 extends Tone {
    highFrequency: Tone.Signal;
    high: GainNode;
    lowFrequency: Tone.Signal;
    low: GainNode;
    mid: GainNode;
    dispose(): Tone.EQ3;
  }

  let Equal: {
    new(value: number): Tone.Equal;
  };

  interface Equal extends Tone.SignalBase {
    value: number;
    dispose(): Tone.Equal;
  }

  let EqualPowerGain: {
    new(): Tone.EqualPowerGain;
  };

  interface EqualPowerGain extends Tone.SignalBase {
    dispose(): Tone.EqualPowerGain;
  }

  let EqualZero: {
    new(): Tone.EqualZero;
  };

  interface EqualZero extends Tone.SignalBase {
    dispose(): Tone.EqualZero;
  }

  let Expr: {
    new(expr: string): Tone.Expr;
  };

  interface Expr extends Tone.SignalBase {
    input: any; //todo: any[]
    output: any; // todo: Tone
    dispose(): Tone.Expr;
  }

  let Event: {
    new(callback: (time: Type.Time, chord: any) => any, value: any): Tone.Event;
  };

  interface Event extends Tone {
    callback: (time: Type.Time, chord: any) => any;
    value: any;
    probability: number;
    humanize: boolean | Type.Time;
    loop: boolean | number;
    loopEnd: Type.Notation;
    loopStart: Type.Notation;
    mute: boolean;
    playbackRate: number;
    readonly progress: number;
    state: string;
    startOffset: number;
    dispose(): Tone.Event;
    start(time: Type.Time): Tone.Event;
    stop(time: Type.Time): Tone.Event;
    cancel(time: Type.Time): Tone.Event;
  }

  let FeedbackCombFilter: {
    new(minDelay?: number, maxDelay?: number): Tone.FeedbackCombFilter;
  };

  interface FeedbackCombFilter extends Tone {
    delayTime: Type.Time;
    resonance: Tone.Signal;
    dispose(): Tone.FeedbackCombFilter;
  }

  let FeedbackDelay: {
    new(delayTime: any): Tone.FeedbackDelay;
  };

  interface FeedbackDelay extends Tone.FeedbackEffect {
    delayTime: Tone.Signal;
    dispose(): Tone.FeedbackDelay;
  }

  let FeedbackEffect: {
    new(initialFeedback?: any): Tone.FeedbackEffect;
  };

  interface FeedbackEffect extends Tone.Effect {
    feedback: Tone.Signal;
    dispose(): Tone.FeedbackEffect;
  }

  let Filter: {
    new(freq?: any, type?: string, rolloff?: number): Tone.Filter; //TODO: Number || Object
  };

  interface Filter extends Tone {
    detune: Tone.Signal;
    frequency: Tone.Signal;
    gain: AudioParam;
    Q: Tone.Signal;
    rolloff: number;
    type: string;
    dispose(): Tone.Filter;
  }

  let FMSynth: {
    new(options?: any): Tone.FMSynth;
  };

  interface FMSynth extends Tone.Monophonic {
    carrier: Tone.MonoSynth;
    frequency: Tone.Signal;
    harmonicity: number;
    modulationIndex: number;
    modulator: Tone.MonoSynth;
    dispose(): Tone.FMSynth;
    triggerEnvelopeAttack(time?: Type.Time, velocity?: number): Tone.FMSynth;
    triggerEnvelopeRelease(time?: Type.Time): Tone.FMSynth;
  }

  let Follower: {
    new(attack?: Type.Time, release?: Type.Time): Tone.Follower;
  };

  interface Follower extends Tone {
    attack: Type.Time;
    release: Type.Time;
    dispose(): Tone.Follower;
  }

  let Freeverb: {
    new(roomSize?: any, dampening?: number): Tone.Freeverb;
  };

  interface Freeverb extends Tone.Effect {
    dampening: Tone.Signal;
    roomSize: Tone.Signal;
    dispose(): Tone.Freeverb;
  }

  let TimeBase: {
    new(val: Type.Time, units?: string): Tone.TimeBase;
  };

  interface TimeBase extends Tone {
    set(exprString: string): Tone.TimeBase;
    clone(): Tone.TimeBase;
    copy(time: Tone.TimeBase): Tone.TimeBase;
    add(val: Type.Time, units?: string): TimeBase;
    sub(val: Type.Time, units?: string): TimeBase;
    mult(val: Type.Time, units?: string): TimeBase;
    div(val: Type.Time, units?: string): TimeBase;
    eval(): number;
    dispose(): TimeBase;
  }

  let Frequency: {
    new(val: Type.Time, units?: string): Tone.Frequency;
  };

  interface Frequency extends TimeBase {
    transpose(interval: number): Tone.Frequency;
    harmonize(intervals: Array<number>): Tone.Frequency;

    // UNIT CONVERSIONS
    toMidi(): Type.MIDI;
    toNote(): Type.Note;
    toSeconds(): Type.Seconds;
    toFrequency(): Type.Hertz;
    toTicks(): Type.Ticks;

    // FREQUENCY CONVERSIONS
    midiToFrequency(midi: number): Tone.Frequency;
    frequencyToMidi(frequency: Tone.Frequency): number;
  }

  let Gate: {
    new(thresh?: number, attackTime?: Type.Time, releaseTime?: Type.Time): Tone.Gate;
  };

  interface Gate extends Tone {
    attack: Type.Time;
    release: Type.Time;
    threshold: Type.Time;
    dispose(): Tone.Gate;
  }

  let GreaterThan: {
    new(value?: number): Tone.GreaterThan;
  };

  interface GreaterThan extends Tone.Signal {
    dispose(): Tone.GreaterThan;
  }

  let GreaterThanZero: {
    new(): Tone.GreaterThanZero;
  };

  interface GreaterThanZero extends Tone.SignalBase {
    dispose(): Tone.GreaterThanZero;
  }

  let IfThenElse: {
    new(): Tone.IfThenElse;
  };

  interface IfThenElse extends Tone.SignalBase {
    dispose(): Tone.IfThenElse;
  }

  let Instrument: {
    new(): Tone.Instrument;
  };

  interface Instrument extends Tone {
    volume: Tone.Signal;
    triggerAttack(note: any, time?: Type.Time, velocity?: number): Tone.Instrument; //Todo: string | number
    triggerAttackRelease(note: any, duration: Type.Time, time?: Type.Time, velocity?: number): Tone.Instrument; //Todo: string | number
    triggerRelease(time?: Type.Time): Tone.Instrument;
    dispose(): Tone.Instrument;
  }

  let JCReverb: {
    new(roomSize: number): Tone.JCReverb; //TODO: Number || Object
  };

  interface JCReverb extends Tone.Effect {
    roomSize: Tone.Signal;
    dispose(): Tone.JCReverb;
  }

  let LessThan: {
    new(value?: number): Tone.LessThan;
  };

  interface LessThan extends Tone.Signal {
    dispose(): Tone.LessThan;
  }

  let LFO: {
    new(frequency?: Type.Time, outputMin?: number, outputMax?: number): Tone.LFO; //TODO: Number || Object
  };

  interface LFO extends Tone.Oscillator {
    amplitude: Tone.Signal;
    frequency: Tone.Signal;
    max: number;
    min: number;
    oscillator: Tone.Oscillator;
    phase: number;
    type: string;
    dispose(): Tone.LFO;
    start(time?: Type.Time): Tone.LFO;
    stop(time?: Type.Time): Tone.LFO;
    sync(delay?: Type.Time): Tone.LFO;
    unsync(): Tone.LFO;
  }

  let Limiter: {
    new(threshold: AudioParam): Tone.Limiter;
  };

  interface Limiter extends Tone {
    dispose(): Tone.Limiter;
  }

  let Loop: {
    new(callback: (e: Object) => any, time?: Type.Time): Tone.Loop;
  };

  interface Loop extends Tone {
    state: string;
    progress: number;
    interval: Type.Time;
    playbackRate: Type.Time;
    humanize: boolean | Type.Time;
    probability: number;
    mute: boolean;
    iterations: number;
    dispose(): Tone.Loop;
    start(time?: Type.Time): Tone.Loop;
    stop(time?: Type.Time): Tone.Loop;
    cancel(time?: Type.Time): Tone.Loop;
  }

  let LowpassCombFilter: {
    new(delay?: Type.Time, resonance?: number, dampening?: number): Tone.LowpassCombFilter;
  };

  interface LowpassCombFilter extends Tone {
    dampening: Tone.Signal;
    delayTime: Type.Time;
    resonance: Tone.Signal;
    dispose(): Tone.LowpassCombFilter;
    setDelayTimeAtTime(delayAmount: Type.Time, time?: Type.Time): Tone.LowpassCombFilter;
  }

  let Master: Tone.Master;

  interface Master extends Tone {
    volume: Tone.Signal;
    mute(): Tone.Master;
    unmute(): Tone.Master;
    receive(node: any): Tone.Master; //todo: AudioNode | Tone
    send(node: any): Tone.Master; //todo: AudioNode | Tone
  }

  let Max: {
    new(max?: number): Tone.Max;
  };

  interface Max extends Tone.Signal {
    dispose(): Tone.Max;
  }

  let Merge: {
    new(): Tone.Merge;
  };

  interface Merge extends Tone {
    left: GainNode;
    right: GainNode;
    dispose(): Tone.Merge;
  }

  let MembraneSynth: {
    new(options?: Object): Tone.MembraneSynth;
  };

  interface MembraneSynth extends Tone.Instrument {
    oscillator: Tone.Oscillator;
    envelope: Tone.Envelope;
    octaves: number;
    pitchDecay: Type.Time;
    dispose(): Tone.MembraneSynth;
  }

  let MetalSynth: {
    new(options?: Object): Tone.MetalSynth;
  };

  interface MetalSynth extends Tone.Instrument {
    frequency: number;
    envelope: Tone.Envelope;
    modulationIndex: number;
    harmonicity: number;
    resonance: number
    octaves: number;
    dispose(): Tone.MetalSynth;
    triggerAttack(time?: Type.Time, velocity?: number): Tone.MetalSynth;
    triggerRelease(time?: Type.Time): Tone.MetalSynth;
    triggerAttackRelease(duration: Type.Time, time?: Type.Time, velocity?: number): Tone.MetalSynth;
  }

  let Meter: {
    new(channels?: number, smoothing?: number, clipMemory?: number): Tone.Meter;
  };

  interface Meter extends Tone {
    dispose(): Tone.Meter;
    getDb(channel?: number): number;
    getLevel(channel?: number): number;
    getValue(channel?: number): number;
    isClipped(): boolean;
  }

  let Microphone: {
    new(inputNum?: number): Tone.Microphone;
  };

  interface Microphone extends Tone.Source {
    dispose(): Tone.Microphone;
  }

  let MidSideEffect: {
    new(): Tone.MidSideEffect;
  };

  interface MidSideEffect extends Tone.StereoEffect {
    midReturn: GainNode;
    midSend: Tone.Expr;
    sideReturn: GainNode;
    sideSend: Tone.Expr;
    dispose(): Tone.MidSideEffect;
  }

  let Min: {
    new(min: number): Tone.Min;
  };

  interface Min extends Tone.Signal {
    dispose(): Tone.Min;
  }

  let Modulo: {
    new(modulus: number, bits?: number): Tone.Modulo;
  };

  interface Modulo extends Tone.SignalBase {
    value: number;
    dispose(): Tone.Modulo;
  }

  let Mono: {
    new(): Tone.Mono;
  };

  interface Mono extends Tone {
    dispose(): Tone.Mono;
  }

  let Monophonic: {
    new(): Tone.Monophonic;
  };

  interface Monophonic extends Tone.Instrument {
    portamento: Type.Time;
    setNote(note: any): Tone.Monophonic; //Todo: number | string
  }

  let MonoSynth: {
    new(options?: any): Tone.MonoSynth;
  };

  interface MonoSynth extends Tone.Monophonic {
    detune: Tone.Signal;
    envelope: Tone.Envelope;
    filter: Tone.Filter;
    filterEnvelope: Tone.Envelope;
    frequency: Tone.Signal;
    oscillator: Tone.OmniOscillator;
    dispose(): Tone.MonoSynth;
    triggerEnvelopeAttack(time?: Type.Time, velocity?: number): Tone.MonoSynth;
    triggerEnvelopeRelease(time?: Type.Time): Tone.MonoSynth;
  }

  let MultibandCompressor: {
    new(options: Object): Tone.MultibandCompressor;
  };

  interface MultibandCompressor extends Tone {
    high: Tone.Compressor;
    highFrequency: Tone.Signal;
    low: Tone.Compressor;
    lowFrequency: Tone.Signal;
    mid: Tone.Compressor;
    dispose(): Tone.MultibandCompressor;
  }

  let MultibandEQ: {
    new(options?: any): Tone.MultibandEQ;
  };

  interface MultibandEQ extends Tone {
    //set(params: Object): void;
    setType(type: string, band: number): void;
    getType(band: number): string;
    setFrequency(freq: number, band: number): void;
    getFrequency(band: number): number;
    setQ(Q: number, band: number): void;
    getQ(band: number): number;
    getGain(band: number): number;
    setGain(gain: number, band: number): void;
  }

  let MultibandSplit: {
    new(lowFrequency: number, highFrequency: number): Tone.MultibandSplit;
  };

  interface MultibandSplit extends Tone {
    high: Tone.Filter;
    highFrequency: Tone.Signal;
    low: Tone.Filter;
    lowFrequency: Tone.Signal;
    mid: Tone.Filter;
    dispose(): Tone.MultibandSplit;
  }

  let Multiply: {
    new(value?: number): Tone.Multiply;
  };

  interface Multiply extends Tone.Signal {
    dispose(): Tone.Multiply;
  }

  let Negate: {
    new(): Tone.Negate;
  };

  interface Negate extends Tone.SignalBase {
    dispose(): Tone.Negate;
  }

  let Noise: {
    new(type: string): Tone.Noise;
  };

  interface Noise extends Tone.Source {
    type: string;
    dispose(): Tone.Noise;
  }

  let NoiseSynth: {
    new(options?: Object): Tone.NoiseSynth;
  };

  interface NoiseSynth extends Tone.Instrument {
    envelope: Tone.Envelope;
    filter: Tone.Filter;
    filterEnvelope: Tone.Envelope;
    noise: Tone.Noise;
    dispose(): Tone.NoiseSynth;
    triggerAttack(time?: Type.Time, velocity?: number): Tone.NoiseSynth;
    triggerAttackRelease(duration: Type.Time, time?: Type.Time, velocity?: number): Tone.NoiseSynth;
    triggerRelease(time?: Type.Time): Tone.NoiseSynth;
  }

  let Normalize: {
    new(min?: number, max?: number): Tone.Normalize;
  };

  interface Normalize extends Tone.SignalBase {
    max: number;
    min: number;
    dispose(): Tone.Normalize;
  }

  let OmniOscillator: {
    new(frequency?: Tone.Frequency, type?: string): Tone.OmniOscillator; //TODO: Number || Object
  };

  interface OmniOscillator extends Tone.Source {
    detune: Tone.Signal;
    frequency: Tone.Signal;
    modulationFrequency: Tone.Signal;
    phase: number;
    type: string;
    width: Tone.Signal;
    dispose(): Tone.OmniOscillator;
  }

  let OR: {
    new(inputCount?: number): Tone.OR;
  };

  interface OR extends Tone.SignalBase {
    dispose(): Tone.OR;
  }

  let Oscillator: {
    new(frequency?: Type.Frequency, type?: string): Tone.Oscillator;
  };

  interface Oscillator extends Tone.Source {
    detune: Tone.Signal;
    frequency: Tone.Signal;
    phase: number;
    type: string;
    partials: number[];
    dispose(): Tone.Oscillator;
    syncFrequency(): Tone.Oscillator;
    unsyncFrequency(): Tone.Oscillator;
  }

  let Panner: {
    new(initialPan?: Type.AudioRange): Tone.Panner;
  };

  interface Panner extends Tone {
    pan: Tone.Signal;
    dispose(): Tone.Panner;
  }

  let Panner3D: {
    new(positionX: number, positionY: number, positionZ: number): Panner3D;
  };

  interface Panner3D extends Tone {
    positionX: number;
    positionY: number;
    positionZ: number;
    orientationX: number;
    orientationY: number;
    orientationZ: number;
    panningModel: string;
    refDistance: number;
    rolloffFactor: number;
    distanceModel: string;
    coneInnerAngle: Type.Degrees;
    coneOuterAngle: Type.Degrees;
    coneOuterGain: Type.Gain;
    maxDistance: number;
    dispose(): Tone.Panner3D;
    setPosition(x: number, y: number, z: number): Tone.Panner3D;
    setOrientation(x: number, y: number, z: number): Tone.Panner3D;

  }

  let PanVol: {
    new(pan: Type.AudioRange, volume: number): Tone.PanVol;
  };

  interface PanVol extends Tone {
    output: GainNode;
    volume: Tone.Signal;
    dispose(): Tone.PanVol;
  }

  let Param: {
    new(param: AudioParam, units: Signal.Type, convert: boolean): Tone.Param;
  };

  interface Param extends Tone {
    units: Signal.Type;
    convert: boolean;
    overridden: boolean;
    value: number;
    setValueAtTime(value: number, time: Type.Time): Tone.Param;
    setRampPoint(now?: Type.Time): Tone.Param;
    linearRampToValueAtTime(value: number, endTime: Type.Time): Tone.Param;
    exponentialRampToValueAtTime(value: number, endTime: Type.Time): Tone.Param;
    exponentialRampToValue(value: number, rampTime: Type.Time, startTime?: Type.Time): Tone.Param;
    linearRampToValue(value: number, rampTime: Type.Time, startTime?: Type.Time): Tone.Param;
    setTargetAtTime(value: number, startTime: Type.Time, timeConstant: number): Tone.Param;
    setValueCurveAtTime(values: number[], startTime: Type.Time, duration: Type.Time): Tone.Param;
    cancelScheduledValues(startTime: Type.Time): Tone.Param;
    rampTo(value: number, rampTime: Type.Time, startTime?: Type.Time): Tone.Param;
    dispose(): Tone.Param;
  }

  let Part: {
    new(callback: (time: Type.Time, note: any) => any, events: any[]): Tone.Part;
  };

  interface Part extends Tone.Event {
    mute: boolean;
    probability: Type.NormalRange;
    humanize: boolean;
    loop: boolean | number;
    loopEnd: Type.Notation;
    loopStart: Type.Notation;
    playbackRate: number;
    length: number;
    dispose(): Tone.Part;
    start(time?: Type.Time, offset?: Type.Time): Tone.Part;
    stop(time?: Type.Time): Tone.Part;
    at(time: Type.Time, value?: any): Tone.Event;
    add(time: Type.Time, value: any): Tone.Part;
    remove(time: Type.Time, value?: any): Tone.Part;
    removeAll(): Tone.Part;
    cancel(after?: Type.Time): Tone.Part;
  }

  let Pattern: {
    new(callback: (time: Type.Time, note: any) => any, values: any[], pattern: string): Tone.Pattern;
    defaults: Object;
  };

  interface Pattern extends Tone.Loop {
    index: number;
    values: any[];
    value: any;
    pattern: string;
    dispose(): Tone.Pattern;
  }

  let Phaser: {
    new(rate?: any, depth?: number, baseFrequency?: number): Tone.Phaser; //TODO: change 'any' to 'number | Object'
  };

  interface Phaser extends Tone.StereoEffect {
    baseFrequency: number;
    depth: number;
    frequency: Tone.Signal;
    dispose(): Tone.Phaser;
  }

  let PingPongDelay: {
    new(delayTime?: any, feedback?: number): Tone.PingPongDelay; //TODO: Type.Time || Object
  };

  interface PingPongDelay extends Tone.StereoXFeedbackEffect {
    delayTime: Tone.Signal;
    dispose(): Tone.PingPongDelay;
  }

  let Player: {
    new(url: string | AudioBuffer, onload?: (e: any) => any): Tone.Player;
  };

  interface Player extends Tone.Source {
    autostart: boolean;
    buffer: Tone.Buffer;
    duration: number;
    loop: boolean;
    loopEnd: Type.Time;
    loopStart: Type.Time;
    playbackRate: number;
    retrigger: boolean;
    dispose(): Tone.Player;
    load(url: string, callback?: (e: any) => any): Tone.Player;
    seek(offset: Type.Time, time?: Type.Time): Tone.Player;
    setLoopPoints(loopStart: Type.Time, loopEnd: Type.Time): Tone.Player;
  }

  let PluckSynth: {
    new(options?: Object): Tone.PluckSynth;
  };

  interface PluckSynth extends Tone.Instrument {
    attackNoise: number;
    dampening: Tone.Signal;
    resonance: Tone.Signal;
    dispose(): Tone.PluckSynth;
    triggerAttack(note: any, time?: Type.Time): Tone.PluckSynth; //todo: string | number
  }

  let PolySynth: {
    new(voicesAmount?: number | Object, voice?: any, options?: any): Tone.PolySynth;
  };

  interface PolySynth extends Tone.Instrument {
    voices: any[];
    detune: Tone.Signal;
    set(params: Object, value?: number, rampTime?: Type.Time): Tone.PolySynth;
    get(params?: any[]): Object;
    releaseAll(time: Type.Time): Tone.PolySynth;
    dispose(): Tone.PolySynth;
    triggerAttack(notes: any, time?: Type.Time, velocity?: number): Tone.PolySynth; //todo: string | number | Object| string[] | number[]
    triggerAttackRelease(notes: any, duration: Type.Time, time?: Type.Time, velocity?: number): Tone.PolySynth; //todo: string | number | Object | string[] | number[]
    triggerRelease(notes: any, time?: Type.Time): Tone.PolySynth; //todo: string | number | Object | string[] | number[]
  }

  let Pow: {
    new(exp: number): Tone.Pow;
  };

  interface Pow extends Tone.SignalBase {
    value: number;
    dispose(): Tone.Pow;
  }

  let PulseOscillator: {
    new(frequency?: number, width?: number): Tone.PulseOscillator;
  };

  interface PulseOscillator extends Tone.Oscillator {
    detune: Tone.Signal;
    frequency: Tone.Signal;
    phase: number;
    width: Tone.Signal;
    dispose(): Tone.PulseOscillator;
  }

  let PWMOscillator: {
    new(frequency?: Tone.Frequency, modulationFrequency?: number): Tone.PWMOscillator;
  };

  interface PWMOscillator extends Tone.Oscillator {
    detune: Tone.Signal;
    frequency: Tone.Signal;
    modulationFrequency: Tone.Signal;
    phase: number;
    width: Tone.Signal;
    dispose(): Tone.PWMOscillator;
  }

  let Route: {
    new(outputCount?: number): Tone.Route;
  };

  interface Route extends Tone.SignalBase {
    gate: Tone.Signal;
    dispose(): Tone.Route;
    select(which?: number, time?: Type.Time): Tone.Route;
  }

  let Sampler: {
    new(urls: any, onload?: () => {}, baseUrl?): Tone.Sampler; //todo: Object | string
  };

  interface Sampler extends Tone.Instrument {
    envelope: Tone.Envelope;
    filter: BiquadFilterNode;
    filterEnvelope: Tone.Envelope;
    pitch: number;
    player: Tone.Player;
    sample: any; //todo: number | string
    dispose(): Tone.Sampler;
    triggerAttack(sample?: string, time?: Type.Time, velocity?: number): Tone.Sampler;
    triggerRelease(time?: Type.Time): Tone.Sampler;
  }

  let Scale: {
    new(outputMin?: number, outputMax?: number): Tone.Scale;
  };

  interface Scale extends Tone.SignalBase {
    max: number;
    min: number;
    dispose(): Tone.Scale;
  }

  let ScaledEnvelope: {
    new(attack?: any, decay?: Type.Time, sustain?: number, release?: Type.Time): Tone.ScaledEnvelope; //TODO: Change 'any' to 'Type.Time | Object'
  };

  interface ScaledEnvelope extends Tone.Envelope {
    exponent: number;
    max: number;
    min: number;
    dispose(): Tone.ScaledEnvelope;
  }

  let ScaleExp: {
    new(outputMin?: number, outputMax?: number, exponent?: number): Tone.ScaleExp;
  };

  interface ScaleExp extends Tone.SignalBase {
    exponent: number;
    max: number;
    min: number;
    dispose(): Tone.ScaleExp;
  }

  let Select: {
    new(sourceCount?: number): Tone.Select;
  };

  interface Select extends Tone.SignalBase {
    gate: Tone.Signal;
    dispose(): Tone.Select;
    select(which: number, time?: Type.Time): Tone.Select;
  }

  let Sequence: {
    new(callback: (time: Type.Time, note: any) => any, events: any[], subdivision: Type.Notation): Tone.Sequence;
    defaults: Object;
  };

  interface Sequence extends Tone.Part {
    readonly subdivision: Type.Notation;
    at(index: number, value?: any): Tone.Part;
    add(index: number, value: any): Tone.Part;
    remove(index: number): Tone.Part;
    dispose(): Tone.Part;
  }

  module Signal {
    type Type = 'number' | 'time' | 'frequency' | 'transportTime' | 'ticks' | 'normalRange' | 'audioRange' | 'db' | 'interval' | 'bpm' | 'positive' | 'cents' | 'degrees' | 'midi' | 'barsBeatsSixteenths' | 'samples' | 'hertz' | 'note' | 'milliseconds' | 'seconds' | 'notation';
  }

  let Signal: {
    new(value?: number | AudioParam, units?: Tone.Signal.Type): Tone.Signal;
  };

  interface Signal extends Tone.Param {
    units: Tone.Signal.Type;
    value: any; //TODO: Type.Time | Tone.Frequency | number
    cancelScheduledValues(startTime: Type.Time): Tone.Signal;
    dispose(): Tone.Signal;
    exponentialRampToValueAtTime(value: number, endTime: Type.Time): Tone.Signal;
    exponentialRampToValueNow(value: number, rampTime: Type.Time): Tone.Signal;
    linearRampToValueAtTime(value: number, endTime: Type.Time): Tone.Signal;
    linearRampToValueNow(value: number, rampTime: Type.Time): Tone.Signal;
    rampTo(value: number, rampTime: Type.Time): Tone.Signal;
    setCurrentValueNow(now?: number): Tone.Signal;
    setTargetAtTime(value: number, startTime: Type.Time, timeConstant: number): Tone.Signal;
    setValueAtTime(value: number, time: Type.Time): Tone.Signal;
    setValueCurveAtTime(values: number[], startTime: Type.Time, duration: Type.Time): Tone.Signal;
  }

  let SignalBase: {
    new(): Tone.SignalBase;
  };

  interface SignalBase extends Tone {
    connect(node: any, outputNumber?: number, inputNumber?: number): Tone.SignalBase; //TODO: Change 'any' to 'AudioParam | AudioNode | Tone.Signal | Tone' when available
  }

  let Source: {
    new(): Tone.Source;
  };

  interface Source extends Tone {
    State: string;
    onended: () => any;
    state: Tone.Source.State;
    volume: Tone.Signal;
    dispose(): Tone.Source;
    start(time?: Type.Time): Tone.Source;
    stop(time?: Type.Time): Tone.Source;
    sync(delay?: Type.Time): Tone.Source;
    unsync(): Tone.Source;
  }

  module Source {
    interface State {
    }
  }

  let Split: {
    new(): Tone.Split;
  };

  interface Split extends Tone {
    left: GainNode;
    right: GainNode;
    dispose(): Tone.Split;
  }

  type State = 'started' | 'stopped' | 'paused';

  let StereoEffect: {
    new(): Tone.StereoEffect;
  };

  interface StereoEffect extends Tone.Effect {
    effectReturnL: GainNode;
    effectReturnR: GainNode;
    dispose(): Tone.StereoEffect;
  }

  let StereoFeedbackEffect: {
    new(): Tone.StereoFeedbackEffect;
  };

  interface StereoFeedbackEffect extends Tone.FeedbackEffect {
    feedback: Tone.Signal;
    dispose(): Tone.StereoFeedbackEffect;
  }

  let StereoWidener: {
    new(width?: any): Tone.StereoWidener; //TODO change 'any' to 'number | Object'
  };

  interface StereoWidener extends Tone.MidSideEffect {
    width: Tone.Signal;
    dispose(): Tone.StereoWidener;
  }

  let StereoXFeedbackEffect: {
    new(): Tone.StereoXFeedbackEffect;
  };

  interface StereoXFeedbackEffect extends Tone.FeedbackEffect {
    feedback: Tone.Signal;
    dispose(): Tone.StereoXFeedbackEffect;
  }

  let Switch: {
    new(): Tone.Switch;
  };

  interface Switch extends Tone.SignalBase {
    gate: Tone.Signal;
    close(time: Type.Time): Tone.Switch;
    dispose(): Tone.Switch;
    open(time: Type.Time): Tone.Switch
  }

  let Synth: {
    new(options: any): Tone.Synth;
  };

  interface Synth extends Tone.Monophonic {
    dispose(): Tone.Synth;
  }

  let Time: {
    new(value: string | number, units?: string): Tone.Time;
  };

  interface Time extends Tone.TimeBase {
    quantize(subdiv: number | Tone.Time, percent: Type.NormalRange): Tone.Time;
    addNow(): Tone.Time;
    copy(): Tone.Time;
    toNotation(): Type.Notation;
    toBarsBeatsSixteenths(): Type.BarsBeatsSixteenths;
    toTicks(): Type.Ticks;
    toSamples(): Type.Samples;
    toFrequency(): Type.Frequency;
    toSeconds(): Type.Seconds;
    toMilliseconds(): Type.Milliseconds;
    valueOf(): Type.Seconds;
  }

  let TimelineSignal: {
    new(value?: number | AudioParam, units?: Tone.Signal.Type): Tone.TimelineSignal;
  };

  interface TimelineSignal extends Tone.Param {
    units: Tone.Signal.Type;
    value: number;
    setValueAtTime(value: number, startTime: Type.Time): Tone.TimelineSignal;
    linearRampToValueAtTime(value: number, endTime: Type.Time): Tone.TimelineSignal;
    exponentialRampToValueAtTime(value: number, endTime: Type.Time): Tone.TimelineSignal;
    setTargetAtTime(value: number, startTime: Type.Time, timeConstant: number): Tone.TimelineSignal;
    setValueCurveAtTime(values: number[], startTime: Type.Time, duration: Type.Time, scaling?: Type.NormalRange): Tone.TimelineSignal;
    cancelScheduledValues(after: Type.Time): Tone.TimelineSignal;
    setRampPoint(time: Type.Time): Tone.TimelineSignal;
    linearRampToValueBetween(value: number, start: Type.Time, finish: Type.Time): Tone.TimelineSignal;
    exponentialRampToValueBetween(value: number, start: Type.Time, finish: Type.Time): Tone.TimelineSignal;
    getValueAtTime(time: Type.Time): number;
    connect(node: Tone | AudioParam | AudioNode | Tone.Signal, output: number, input: number): Tone.TimelineSignal;
    dispose(): Tone.TimelineSignal;
  }

  let Transport: {
    bpm: Tone.Signal;
    loop: boolean;
    loopEnd: Type.Time;
    loopStart: Type.Time;
    position: Type.BarsBeatsSixteenths;
    PPQ: number;
    readonly progress: Type.NormalRange;
    seconds: Type.Seconds;
    state: Tone.State;
    swing: number;
    swingSubdivision: Type.Notation;
    ticks: Type.Ticks;
    timeSignature: number;
    clear(eventId: number): Tone.Transport;
    cancel(after: Type.Time): Tone.Transport;
    dispose(): Tone.Transport;
    nextSubdivision(subdivision: Type.Time): number;
    pause(time: Type.Time): Tone.Transport;
    schedule(callback: (e: any) => any, time: Type.Time): number;
    scheduleOnce(callback: (e: any) => any, time: Type.Time): number;
    scheduleRepeat(callback: (e: any) => any, interval: Type.Time, startTime?: Type.Time, duration?: Type.Time): number;
    setLoopPoints(startPosition: Type.Time, endPosition: Type.Time): Tone.Transport;
    start(time?: Type.Time, offset?: Type.Time): Tone.Transport;
    stop(time?: Type.Time): Tone.Transport;
    syncSignal(signal: Tone.Signal, ratio?: number): Tone.Transport;
    unsyncSignal(signal: Tone.Signal): Tone.Transport;
  };

  interface Transport extends Tone {
    // Should interact directly with Transport singleton
  }

  let Volume: {
    new(decibels: number): Tone.Volume;
  };

  interface Volume extends Tone {
    mute: boolean;
    dispose(): Tone.Volume;
  }

  let WaveShaper: {
    new(mapping: any, bufferLen?: number): Tone.WaveShaper; //TODO: change 'any' to 'Function | Array | number'
  };

  interface WaveShaper extends Tone.SignalBase {
    curve: number[];
    oversample: string;
  }
}

declare module 'tone' {
  export default Tone
}