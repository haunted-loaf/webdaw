import cryptoRandomString from 'crypto-random-string';
import { writable, Writable } from 'svelte/store';
import { extend, flatten, keys, times } from 'underscore';
import { percussionKeys } from './instruments';
import { Scale } from './Scale';
import { State, StateDumpV1 } from './State';
import { Note } from "./Note";

export const notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]

export const drumScale = {
  name: "Drums",
  degrees: times(47, x => x + 35)
}

export interface PatternDumpV1 {
  kind:       "pattern"
  version:    1
  id:         string
  name:       string
  type:       "tone" | "percussion"
  notes:      Note[]
  length:     number
  tonic:      number
  scale:      Scale
  baseOctave: number
  octaves:    number
  noteNames:  string[]
  barLength:  number
}

export class Pattern {
  id: string;
  name: string;
  type: "tone" | "percussion";
  notes: Note[];
  length: number;
  tickNum: Writable<number>;
  playing?: boolean;
  tonic: number;
  scale: Scale;
  baseOctave: number;
  octaves: number;
  noteNames: string[];
  barLength: number = 4;

  static load(state: State, pattern: PatternDumpV1): Pattern {
    return new Pattern(state, {
      id:         pattern.id,
      name:       pattern.name,
      type:       pattern.type,
      notes:      pattern.notes,
      length:     pattern.length,
      tonic:      pattern.tonic,
      scale:      pattern.scale,
      baseOctave: pattern.baseOctave,
      octaves:    pattern.octaves,
      noteNames:  pattern.noteNames,
      barLength:  pattern.barLength,
    })
  }

  dump() : PatternDumpV1 {
    return {
      kind:       "pattern",
      version:    1,
      id:         this.id,
      name:       this.name,
      type:       this.type,
      notes:      this.notes,
      length:     this.length,
      tonic:      this.tonic,
      scale:      this.scale,
      baseOctave: this.baseOctave,
      octaves:    this.octaves,
      noteNames:  this.noteNames,
      barLength:  this.barLength,
    }
  }

  get tonal(): boolean {
    return this.type === "tone";
  }

  constructor(state: State, options: Partial<Pattern> = {}) {
    const defaults = {
      id: cryptoRandomString({ length: 10 }),
      type: "tone",
      length: 64,
      tonic: 0,
      barLength: 4,
      baseOctave: 4,
      octaves: 3,
      notes: [],
      scale: state.scales[0],
      noteNames: flatten(times(12, (o) => times(12, (p) => notes[p] + (o - 1)))),
    };
    this.type = options.type;
    if (this.tonal) {
      this.name = `Tonal ${keys(state.patterns).length + 1}`;
    } else {
      this.name = `Percussive ${keys(state.patterns).length + 1}`;
      extend(defaults, {
        scale: drumScale,
        noteNames: percussionKeys,
        baseOctave: 0,
        octaves: 1,
      });
    }
    extend(this, defaults, options);
    this.tickNum = writable(0);
    state.patterns[this.id] = this;
  }

}
