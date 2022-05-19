
export interface Engine {
  note(time: number, channel: number, pitch: number, velocity: number, duration: number): void
  programChange(time: number, channel: number, program: number): void
  instruments(): string[]
  name: string
  waiter: Promise<this>
}
