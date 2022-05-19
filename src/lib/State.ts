import { clamp } from 'ramda';
import { writable, Writable } from 'svelte/store';
import { Dictionary, extend, filter, identity, keys, map, mapObject, times, values } from 'underscore';
import { Engine } from './engine';
import { MidiEngine } from '../engines/midi';
import { ToneEngine } from '../engines/tone';
import { Pattern, PatternDumpV1 } from "./Pattern";
import { Song, SongDumpV1 } from "./Song";
import { Scale } from './Scale';

export interface StateDumpV1 {
  kind:       "state"
  version:    1
  songs:      SongDumpV1[]
  songId:     string
  patterns:   PatternDumpV1[]
  patternId:  string
  scales:     Scale[]
}

export class State {

  songs: Dictionary<Song>;
  songId: string;
  get song () { return this.songs[this.songId]; }

  patterns: Dictionary<Pattern>
  patternId: string;
  get pattern () { return this.patterns[this.patternId]; }

  scales: Scale[];
  engines: Engine[];

  engine: Engine;
  beatOriginMS: number;
  tickNum: Writable<number>;

  saveLoadIsOpen: Writable<boolean> = writable(true);

  clear() {
    this.patterns = {}
    this.songs = {}
    this.scales = []
    return this;
  }

  load(data: StateDumpV1) {
    this.scales = data.scales
    // this.songs = {}
    // this.patterns = {}
    data.songs.forEach(song => Song.load(this, song))
    data.patterns.forEach(pattern => Pattern.load(this, pattern))
    this.songId = data.songId
    this.patternId = data.patternId
    return this
  }

  dump() : StateDumpV1 {
    return {
      kind:       "state",
      version:    1,
      songs: map(values(this.songs), x => x.dump()),
      songId: this.songId,
      patterns: map(values(this.patterns), x => x.dump()),
      patternId: this.patternId,
      scales: this.scales,
    }
  }

  constructor(options: Partial<State> = {}) {
    extend(this, {
      patterns: {},
      songs: {},
      beatOriginMS: performance.now(),
      engines: [],
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
    });
    new Song(this, { });
    new Pattern(this, { type: "tone" });
    new Pattern(this, { type: "percussion" });
    this.patternId = keys(this.patterns)[0];
    this.songId = keys(this.songs)[0];
    extend(this, options)
    this.stop();
    this.tickNum = writable(0);
  }

  init() {
    try {
      this.engines.push(new MidiEngine());
    } catch (e) {
    }
    this.engines.push(new ToneEngine());
    this.engine = this.engines[0];
  }

  tick(timeMS: number) {
    const tickNum = Math.floor(timeMS / this.song.tickLength);
    this.tickNum.set(tickNum);
    const playTick = (tickNum + 1) % this.song.length;
    for (let pattern of values(this.patterns)) {
      pattern.playing = false;
      pattern.tickNum.set(0);
    }
    for (let track of this.song.tracks) {
      for (let instance of track.instances) {
        const pattern = this.patterns[instance.pattern];
        const instTick = playTick - instance.time;
        if (instTick >= 0 && instTick < instance.length) {
          const patternTick = instTick % pattern.length;
          filter(pattern.notes, (note) => note.time == patternTick).forEach(
            (note) => {
              (note.chord || [0]).forEach((chord) => {
                const pitch = clamp(
                  0,
                  127,
                  this.song.baseNote +
                  (pattern.baseOctave + note.octave) * 12 +
                  pattern.scale.degrees[note.degree] +
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
          pattern.playing = true;
          pattern.tickNum.set(patternTick);
        }
      }
    }
  }

  timerId: number = null;

  onUpdate: Function;

  async update(timeMS: number) {
    const beatsPerUpdate = Math.max(1, 100 / this.song.tickLength);
    for (let i = 0; i < beatsPerUpdate; ++i) {
      this.tick(timeMS + i * this.song.tickLength);
    }
    if (this.onUpdate)
      this.onUpdate();
  }

  async start() {
    this.stop();
    this.timerId = window.setInterval(() => {
      const time = performance.now() - this.beatOriginMS;
      const timeQ = Math.floor(time / this.song.tickLength) * this.song.tickLength;
      this.update(timeQ + this.song.tickLength);
    }, 100);
  }

  stop() {
    if (this.timerId)
      window.clearInterval(this.timerId);
    this.timerId = null;
  }


}
