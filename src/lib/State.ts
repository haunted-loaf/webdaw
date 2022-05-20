import { clamp } from 'ramda';
import { writable, Writable } from 'svelte/store';
import { Dictionary, extend, filter, identity, keys, map, mapObject, random, times, values } from 'underscore';
import { Engine } from './engine';
import { MidiEngine } from '../engines/midi';
import { ToneEngine } from '../engines/tone';
import { Pattern, PatternDumpV1 } from "./Pattern";
import { Song, SongDumpV1 } from "./Song";
import { Scale } from './Scale';

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

  lastTime: number = 0
  songTime: number = 0
  timerId: number = null;
  onUpdate: Function;

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
    if (!this.timer)
      this.timer = new Timer((t) => this.update(t))
    this.stop();
    this.tickNum = writable(0);
  }

  clear() {
    this.patterns = {}
    this.songs = {}
    this.scales = []
    return this;
  }

  load(data: StateDumpV1, selectSong: boolean = true, selectPattern: boolean = true) {
    this.scales = data.scales
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

  init() {
    try {
      this.engines.push(new MidiEngine());
    } catch (e) {
    }
    this.engines.push(new ToneEngine());
    this.engine = this.engines[0];
  }

  quantum: number = 100
  quantumTime: number = 0
  quantumTick: number = 0

  rushing = writable(0)

  playQuantum(time: number) {
    const song = this.song
    const tracks = song.tracks
    const songTick = time / song.tickLength
    this.tickNum.set(songTick)
    for (const track of tracks) {
      for (const instance of track.instances) {
        const instanceTick = songTick - instance.tick
        if (instanceTick < 0 || instanceTick > instance.length)
          continue;
        const pattern = this.patterns[instance.pattern]
        const patternTick = instanceTick % pattern.length
        for (const note of pattern.notes) {
          if ((note.tick < patternTick) || (note.tick >= patternTick + this.quantum / song.tickLength))
            continue
          const chordPitch = song.baseNote + (pattern.baseOctave + note.octave) * 12 + pattern.scale.degrees[note.degree] + pattern.tonic
          const chordTick = note.tick + instance.tick
          const chord = note.chord || pattern.autoChord || { degrees: [0], delay: 0 }
          for (let i = 0; i < chord.degrees.length; i++) {
            const noteTick = chordTick + i * chord.delay
            const noteTime = noteTick * song.tickLength + this.timer.offset
            const notePitch = clamp(0, 127, chordPitch + chord.degrees[i])
            const velocity = clamp(0, 127, note.velocity + pattern.gain)
            this.engine.note(noteTime, track.channel, notePitch, velocity, note.length * song.tickLength)
          }
        }
      }
    }
  }

  update(wallTime: number) {
    for (let i = 0; i < 100 && this.quantumTime < wallTime + this.quantum; ++i) {
      this.playQuantum(this.quantumTime)
      this.quantumTime += this.quantum
      this.quantumTick = this.quantumTime / this.song.tickLength
      if (this.quantumTick > this.song.length) {
        this.goto(0);
        break;
      }
      this.rushing.set(i)
    }
    if (this.onUpdate)
      this.onUpdate();
  }

  timer: Timer

  async start() {
    this.timer.start()
  }

  restart() {
    this.goto(0)
  }

  goto(tick: number) {
    this.quantumTime = Math.floor(tick * this.song.tickLength / this.quantum) * this.quantum
    this.timer.goto(tick * this.song.tickLength)
  }

  stop() {
    this.timer.stop()
  }

}

class Timer {

  value: number
  offset: number
  timer: number
  handler: (_:number) => any
  lastTime: number | null

  constructor(handler: (_:number) => any) {
    this.value = 0
    this.handler = handler
  }

  start() {
    this.stop()
    this.goto(this.value)
    this.timer = window.setInterval(() => this.update(), 100)
  }

  stop() {
    if (this.timer)
      window.clearInterval(this.timer)
    this.lastTime = null
  }

  goto(t: number) {
    this.value = t
    this.offset = performance.now() - this.value
    this.lastTime = null
  }

  update() {
    const time = performance.now()
    if (this.lastTime) {
      const delta = time - this.lastTime
      this.value += delta
      this.handler(this.value)
    }
    this.lastTime = time
  }

}
