import { Dictionary } from 'underscore';
import { Chord } from './Chord';
import { Scale } from './Scale';
import { Pattern } from "./Pattern";
import { Track } from "./Track";
import { Channel } from "./Channel";


export interface Song {
  name: string;
  tickLength: number;
  beatLength: number;
  barLength: number;
  baseNote: number;
  channels: Channel[];
  tracks: Track[];
  length: number;
  scales: Scale[];
  chords: Chord[];
}
