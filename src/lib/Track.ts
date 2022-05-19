import { Instance } from "./Instance";

export interface Track {
  name: string;
  channel: number;
  instances: Instance[];
}
