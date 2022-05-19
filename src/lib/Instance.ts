import { Event } from './Event';


export interface Instance extends Event {
  pattern: string;
  track: number;
}
