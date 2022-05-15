import _ from 'underscore'
import { Engine } from './engine'

export interface State {
  song: Song
  engines: Engine[]
  engine: Engine
  beatNum: number
  beatOriginMS: number
  phrase: Phrase
}

export interface Song {
  channels: Channel[]
  tracks: Track[]
  phrases: Phrase[]
  length: number
  ticksPerBar: number
  scale: number[];
  scaleNames: string[];
  octaves: number[];
}

export interface Channel {
  program: number
}

export interface Track {
  channel: number
  instances: Instance[]
}

export interface Event {
  time: number
  length: number
}

export interface Instance extends Event {
  phrase: Phrase
}

export interface Phrase {
  name: string
  notes: Note[]
  length: number
  beatNum?: number
  playing?: boolean
  colour: string
}

export interface Note extends Event  {
  on?: boolean
  octave: number
  degree: number
  velocity: number
}
