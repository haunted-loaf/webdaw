import { clamp } from 'ramda';
import { writable, Writable } from 'svelte/store';
import { Dictionary, extend, filter, identity, keys, map, mapObject, random, times, values } from 'underscore';
import { Engine } from './engine';
import { MidiEngine } from '../engines/midi';
import { ToneEngine } from '../engines/tone';
import { Pattern, PatternDumpV1 } from "./Pattern";
import { Song, SongDumpV1 } from "./Song";
import { Scale } from './Scale';
import { Transport } from 'tone';

export interface StateDumpV1 {
  kind: "state"
  version: 1
  songs: SongDumpV1[]
  songId: string
  patterns: PatternDumpV1[]
  patternId: string
  scales: Scale[]
}

export class State {

  songs: Dictionary<Song>;
  songId: string;
  get song() { return this.songs[this.songId]; }

  patterns: Dictionary<Pattern>
  patternId: string;
  get pattern() { return this.patterns[this.patternId]; }

  scales: Scale[];
  engines: Engine[];

  engine: Engine;
  beatOriginMS: number;
  tickNum: Writable<number>;

  randomTime: number = 0;

  saveLoadIsOpen: Writable<boolean> = writable(false);

  clear() {
    this.patterns = {}
    this.songs = {}
    this.scales = []
    return this;
  }

  load(data: StateDumpV1, selectSong: boolean = true, selectPattern: boolean = true) {
    this.scales = data.scales
    // this.songs = {}
    // this.patterns = {}
    data.songs.forEach(song => Song.load(this, song))
    data.patterns.forEach(pattern => Pattern.load(this, pattern))
    if (selectSong)
      this.songId = data.songId
    if (selectPattern)
      this.patternId = data.patternId
    return this
  }

  dump(): StateDumpV1 {
    return {
      kind: "state",
      version: 1,
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
    new Song(this, {});
    new Pattern(this, { type: "tone" });
    new Pattern(this, { type: "percussion" });
    this.patternId = keys(this.patterns)[0];
    this.songId = keys(this.songs)[0];
    extend(this, options)
    this.stop();
    this.tickNum = writable(0);
  }

  init() {
    // try {
    //   this.engines.push(new MidiEngine());
    // } catch (e) {
    // }
    this.engines.push(new ToneEngine());
    this.engine = this.engines[0];
  }

  lastTime: number = 0
  songTime: number = 0
  timeOffset: number = 0
  period: number = 100
  timerId: number = null;
  onUpdate: Function;

  update(wallTime: number) {
    const time = wallTime % (this.song.length * this.song.tickLength)
    const origin = wallTime - time
    const tick = time / this.song.tickLength;
    this.tickNum.set(tick);
    const playTick = (tick) % this.song.length;
    console.log(playTick)
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
          filter(pattern.notes, (note) => (note.time >= patternTick) && (note.time < patternTick + this.period / this.song.tickLength)).forEach(
            (note) => {
              const basePitch = this.song.baseNote +
                (pattern.baseOctave + note.octave) * 12 +
                pattern.scale.degrees[note.degree] + pattern.tonic
              let chord = note.chord || pattern.autoChord || {degrees: [0], delay: 0}
              chord.degrees.forEach((degree, i) => {
                if (degree === null)
                  return;
                const pitch = clamp(0, 127, basePitch + degree)
                this.engine.note(
                  (note.time + instance.time + i * chord.delay) * this.song.tickLength - origin + this.timeOffset,
                  track.channel,
                  pitch,
                  note.velocity,
                  note.length * this.song.tickLength
                );
              });
            }
          );
          pattern.playing = true;
          pattern.tickNum.set(patternTick / this.song.tickLength);
        }
      }
    }
    if (this.onUpdate)
      this.onUpdate();
  }

  async start() {
    function helper() {
      this.songTime = performance.now() - this.timeOffset
      this.update(this.songTime)
      this.lastTime = this.songTime
    }
    this.stop()
    this.timeOffset = performance.now() - this.songTime
    this.lastTime = 0
    this.timerId = window.setInterval(helper.bind(this), this.period)
  }

  restart() {
    this.timeOffset = performance.now()
    this.lastTime = 0
  }

  goto(time: number) {
    this.timeOffset = performance.now() - time * this.song.tickLength
  }

  stop() {
    if (this.timerId) {
      window.clearInterval(this.timerId)
    }
    this.timerId = null;
  }

}
