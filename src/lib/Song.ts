import { Chord } from './Chord';
import { Scale } from './Scale';
import { Track } from "./Track";
import { Channel } from "./Channel";
import { State, StateDumpV1 } from './State';
import { extend, identity, keys, times } from 'underscore';
import cryptoRandomString from 'crypto-random-string';

export interface SongDumpV1 {
  kind:       "song"
  version:    1
  id:         string
  name:       string
  tickLength: number
  beatLength: number
  barLength:  number
  baseNote:   number
  channels:   Channel[]
  tracks:     Track[]
  length:     number
}

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
  synth: any;

  static load(state: State, song: SongDumpV1): Song {
    return new Song(state, {
      id:         song.id,
      name:       song.name,
      tickLength: song.tickLength,
      beatLength: song.beatLength,
      barLength:  song.barLength,
      baseNote:   song.baseNote,
      channels:   song.channels,
      tracks:     song.tracks,
      length:     song.length,
    })
  }

  constructor(state: State, options: Partial<Song> = {}) {
    const defaults = {
      id: cryptoRandomString({ length: 10 }),
      name: `Song ${keys(state.songs).length + 1}`,
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

  setupChannels(state: State) {
    this.channels.forEach((channel, i) => {
      state.engine.programChange(
        0,
        i,
        channel.program
      );
    })
  }

  dump() : SongDumpV1 {
    return {
      kind:       "song",
      version:    1,
      id:         this.id,
      name:       this.name,
      tickLength: this.tickLength,
      beatLength: this.beatLength,
      barLength:  this.barLength,
      baseNote:   this.baseNote,
      channels:   this.channels,
      tracks:     this.tracks,
      length:     this.length,
    }
  }

}
