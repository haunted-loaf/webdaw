import cryptoRandomString from 'crypto-random-string'
import { clamp } from 'ramda'
import randomstring from 'randomstring'
import { tick } from 'svelte'
import { writable, Writable } from 'svelte/store'
import _, { assign, Dictionary, extend, flatten, identity, keys, random, times, values } from 'underscore'
import { Engine } from './engine'
import { MidiEngine } from './engines/midi'
import { ToneEngine } from './engines/tone'
import { percussionKeys } from './instruments'

export class State {
  song: Song
  engines: Engine[]
  engine: Engine
  tickNum: Writable<number>
  beatOriginMS: number
  phraseId: string
  midiFailed: boolean
  constructor() {
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
        phrases: {},
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
      } as Song,
      tickNum: null,
      beatOriginMS: performance.now(),
      engines: [],
      engine: null,
      phrase: null,
    });
    new Phrase(this, { type: "tone" });
    new Phrase(this, { type: "percussion" });
    this.phraseId = keys(this.song.phrases)[0];
    stop();
    this.tickNum = writable(0)
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

  tick(timeMS: number) {
    const tickNum = Math.floor(timeMS / this.song.tickLength)
    this.tickNum.set(tickNum);
    const playTick = (tickNum + 1) % this.song.length;
    for (let phrase of values(this.song.phrases)) {
      phrase.playing = false;
      phrase.tickNum.set(0);
    }
    for (let track of this.song.tracks) {
      for (let instance of track.instances) {
        const phrase = this.song.phrases[instance.phrase];
        const instTick = playTick - instance.time;
        if (instTick >= 0 && instTick < instance.length) {
          const phraseTick = instTick % phrase.length;
          _.filter(phrase.notes, (note) => note.time == phraseTick).forEach(
            (note) => {
              (note.chord || [0]).forEach((chord) => {
                const pitch = clamp(
                  0,
                  127,
                  this.song.baseNote +
                    (phrase.baseOctave + note.octave) * 12 +
                    phrase.scale.degrees[note.degree] +
                    chord
                );
                this.engine.note(
                  timeMS + this.beatOriginMS,
                  track.channel,
                  pitch,
                  note.velocity,
                  note.length * this.song.tickLength
                );
              });
            }
          );
          phrase.playing = true;
          phrase.tickNum.set(phraseTick);
        }
      }
    }
  }

  timerId: number = null;

  onUpdate: Function

  async update(timeMS: number) {
    const beatsPerUpdate = Math.max(1, 100 / this.song.tickLength);
    for (let i = 0; i < beatsPerUpdate; ++i) {
      this.tick(timeMS + i * this.song.tickLength);
    }
    if (this.onUpdate)
      this.onUpdate()
  }

  async start() {
    stop();
    this.timerId = window.setInterval(() => {
      const time = performance.now() - this.beatOriginMS;
      const timeQ =
        Math.floor(time / this.song.tickLength) * this.song.tickLength;
        this.update(timeQ + this.song.tickLength);
    }, 100);
  }

  stop() {
    if (this.timerId) window.clearInterval(this.timerId);
    this.timerId = null;
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
  phrases: Dictionary<Phrase>
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
  phrase: string
  track: number
}

export const notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]

const drumScale = {
  name: "Drums",
  degrees: _.times(47, x => x + 35)
}

export class Phrase {
  id: string
  name: string
  type: "tone" | "percussion"
  notes: Note[]
  length: number
  tickNum: Writable<number>
  playing?: boolean
  tonic: number
  scale: Scale
  baseOctave: number
  octaves: number
  noteNames: string[]
  get tonal(): boolean {
    return this.type === "tone"
  }
  constructor(state: State, options: Partial<Phrase> = {}) {
    const defaults = {
      id: cryptoRandomString({ length: 10 }),
      type: "tone",
      length: 64,
      tonic: 0,
      baseOctave: 4,
      octaves: 3,
      notes: [],
      scale: state.song.scales[0],
      noteNames: flatten(times(12, (o) => times(12, (p) => notes[p] + (o - 1)))),
    }
    this.type = options.type
    if (this.tonal) {
      this.name = `Tonal ${keys(state.song.phrases).length + 1}`;
    } else {
      this.name = `Percussive ${keys(state.song.phrases).length + 1}`;
      extend(defaults, {
        scale: drumScale,
        noteNames: percussionKeys,
        baseOctave: 0,
        octaves: 1,
      })
    }
    extend(this, defaults)
    extend(this, options)
    this.tickNum = writable(0)
    state.song.phrases[this.id] = this
  }
}

export interface Note extends Event {
  on?: boolean
  octave: number
  degree: number
  velocity: number
  chord?: number[]
}
