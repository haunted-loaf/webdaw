import './style.less'

import App from './App.svelte'
import { State } from "./lib/State"

const state = new State()
state.init()
state.start()

const app = new App({
  target: document.querySelector('#app'),
  props: { state: state }
})

export default app
