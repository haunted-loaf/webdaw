import _, { assign, extend, flatten, identity, times } from 'underscore'
import { Engine } from './engine'
import { MidiEngine } from './engines/midi'
import { ToneEngine } from './engines/tone'
import { percussionKeys } from './instruments'

export class State {
  song: Song
  engines: Engine[]
  engine: Engine
  tickNum: number
  beatOriginMS: number
  phrase: Phrase
  midiFailed: boolean
  constructor () {
    assign(this, {
      song: {
        name: "Untitled Song",
        midiFailed: false,
        tickLength: 32,
        beatLength: 16,
        barLength: 4,
        baseNote: 0,
        tracks: times(16, (n) => {
          return {
            name: `Track ${n}`,
            channel: n,
            instances: [],
          }
        }),
        channels: times(16, (x) => ({
          program: x,
          type: x == 9 ? "percussion" : "tone",
        })),
        phrases: [],
        length: 16 * 4 * 16,
        scales: [
          {
            name: "Major",
            degrees: [0, 2, 4, 5, 7, 9, 11],
          },
          {
            name: "Minor",
            degrees: [0, 2, 3, 5, 7, 8, 10],
          },
          {
            name: "Raga Malkauns",
            degrees: [0, 3, 5, 8, 10],
          },
          {
            name: "Chromatic",
            degrees: times(12, identity),
          }
        ],
        chords: [],
      },
      tickNum: null,
      beatOriginMS: performance.now(),
      engines: [],
      engine: null,
      phrase: null,
    });
    this.song.phrases.push(new Phrase(this, { type: "tone" }));
    this.song.phrases.push(
      new Phrase(this, { type: "percussion" })
    );
    this.phrase = this.song.phrases[0];
  }
  
  init() {
    try {
      this.engines.push(new MidiEngine());
    } catch (e) {
      this.midiFailed = true;
    }
    this.engines.push(new ToneEngine());
    this.engine = this.engines[0];
  }
  
}

export interface Scale {
  name: string
  degrees: number[]
}

export interface Chord {
  name: string
  degrees: number[]
}

export interface Song {
  name: string
  tickLength: number
  beatLength: number
  barLength: number
  baseNote: number
  channels: Channel[]
  tracks: Track[]
  phrases: Phrase[]
  length: number
  scales: Scale[]
  chords: Chord[]
}

export interface Channel {
  program: number
  type: "tone" | "percussion"
}

export interface Track {
  name: string
  channel: number
  instances: Instance[]
}

export interface Event {
  time: number
  length: number
}

export interface Instance extends Event {
  phrase: Phrase
  track: number
}

export const notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]

const drumScale = {
  name: "Drums",
  degrees: _.times(47, x => x + 35)
}

export class Phrase {
  name: string
  type: "tone" | "percussion"
  notes: Note[]
  length: number
  tickNum?: number
  playing?: boolean
  // colour: string
  tonic: number
  scale: Scale
  baseOctave: number
  octaves: number
  noteNames: string[]
  get tonal () : boolean {
    return this.type === "tone"
  }
  constructor (state: State, options: Partial<Phrase> = {}) {
    const defaults = {
      type       : "tone",
      length     : 512,
      tonic      : 0,
      baseOctave : 4,
      octaves    : 3,
      notes      : [],
      scale      : state.song.scales[0],
      noteNames  : flatten(times(12, (o) => times(12, (p) => notes[p] + (o - 1)))),
    }
    this.type = options.type
    if (this.tonal) {
      this.name = `Tonal ${state.song.phrases.length + 1}`;
    } else {
      this.name = `Percussive ${state.song.phrases.length + 1}`;
      extend(defaults, {
        scale: drumScale,
        noteNames: percussionKeys,
        baseOctave: 0,
        octaves: 1,
      })
    }
    extend(this, defaults)
    extend(this, options)
  }
}

export interface Note extends Event {
  on?: boolean
  octave: number
  degree: number
  velocity: number
  chord?: number[]
}
