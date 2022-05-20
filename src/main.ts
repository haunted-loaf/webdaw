import './style.less'

import App from './App.svelte'
import { State, StateDumpV1 } from "./lib/State"
import builtin from './builtin.json'

const state = new State()
state.init()
state.start()
state.load(builtin as StateDumpV1, false, false)

const app = new App({
  target: document.querySelector('#app'),
  props: { state: state }
})

export default app
