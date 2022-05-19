import cryptoRandomString from 'crypto-random-string';
import { writable, Writable } from 'svelte/store';
import { extend, flatten, keys, times } from 'underscore';
import { percussionKeys } from './instruments';
import { Scale } from './Scale';
import { State } from './State';
import { Note } from "./Note";

export const notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]

export const drumScale = {
  name: "Drums",
  degrees: times(47, x => x + 35)
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
  barLength: 4;

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
