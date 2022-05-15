
export interface Engine {
  get name(): string
  init(): this
  note(time: number, channel: number, pitch: number, velocity: number, duration: number): void
  programChange(time: number, channel: number, program: number): void
  channelInstrumentNames(channel: number): string[]
}
