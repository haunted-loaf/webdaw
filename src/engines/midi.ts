import { instrumentNames } from "@/lib/instruments"
import { random } from "underscore"
import { Engine } from "../lib/engine"

export class MidiEngine implements Engine {

  waiter: Promise<this>
  access: WebMidi.MIDIAccess
  output: WebMidi.MIDIOutput

  constructor() {
    this.waiter = this.init()
  }

  get name() {
    return "WebMidi"
  }

  async init(): Promise<this> {
    this.access = await navigator.requestMIDIAccess({ sysex: false })
    this.output = Array.from(this.access.outputs.values())[0]
    return this
  }

  note(time: number, channel: number, pitch: number, velocity: number, duration: number) {
    this.output.send([0x90 + channel, pitch, velocity], time)
    this.output.send([0x80 + channel, pitch, velocity], time + duration - 1)
  }

  programChange(time: number, channel: number, program: number) {
    this.output.send([0xC0 + channel, program], time)
  }

  instruments() {
    return instrumentNames
  }
  
}
