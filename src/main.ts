import './style.less'

import App from './App.svelte'
import { State } from "./lib/State"
import { builtin } from './builtin'

const state = new State()
state.init()
state.start()
state.load(builtin, false, false)

const app = new App({
  target: document.querySelector('#app'),
  props: { state: state }
})

export default app
