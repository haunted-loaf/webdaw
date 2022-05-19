import { Event } from './Event';


export interface Note extends Event {
  on?: boolean;
  octave: number;
  degree: number;
  velocity: number;
  chord: {
    degrees: number[];
    delay: number;
  }
}
