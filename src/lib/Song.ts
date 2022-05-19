import { Chord } from './Chord';
import { Scale } from './Scale';
import { Track } from "./Track";
import { Channel } from "./Channel";
import { State } from './State';
import { extend, identity, times } from 'underscore';
import cryptoRandomString from 'crypto-random-string';

export class Song {

  id: string;
  name: string;
  tickLength: number;
  beatLength: number;
  barLength: number;
  baseNote: number;
  channels: Channel[];
  tracks: Track[];
  length: number;
  chords: Chord[];

  constructor(state: State, options: Partial<Song> = {}) {
    const defaults = {
      id: cryptoRandomString({ length: 10 }),
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
        };
      }),
      channels: times(16, (x) => ({
        program: x,
        type: x == 9 ? "percussion" : "tone",
      })),
      length: 16 * 4 * 16,
      chords: [],
    }
    extend(this, defaults, options)
    state.songs[this.id] = this;
  }

}
