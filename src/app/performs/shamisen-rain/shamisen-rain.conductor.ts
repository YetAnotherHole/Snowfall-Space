import * as PIXI from 'pixi.js'
import Tone from 'tone'
import visibility from 'visibilityjs'
import { __ } from '../../services/i18n'
import { FONT_FAMILY, COLORS } from '../../utils/constants'
import { randomChoice } from '../../utils/random'
import { $$Raindrop, $$Sky } from './display-objects'

import {
  BaseConductor,
  INoteEvent,
  toneInstruments,
  midiToNoteMap,
  noteToMidiMap
} from '../shared'

import {
  satieGymnopedieN1NoteEvents,
  // raindropPreludeNoteEvents,
  generatePentatonicScaleNoteEvents,
  generateFBMNoteEvents
} from './note-events'

// @TODO: Optimize experience for vision and hearing
// @TODO: Support dynamic sequence, auto switch to next sequence if current was ended
class ShamisenRainConductor extends BaseConductor {
  private shamisen: Tone.Sampler
  private sequence: Tone.Part

  // Particles
  private drops: $$Raindrop[]

  // Display objects
  private $loading: PIXI.Text
  private $$sky: $$Sky

  setup () {
    this.showLoading()

    this.shamisen = toneInstruments['shamisen']
    this.sequence = this.generateRandomSequence()

    // Listen page visibility
    if (visibility.state() === 'hidden') {
      return Tone.Transport.pause()
    }

    visibility.change((e, state) => {
      if (state === 'hidden') {
        Tone.Transport.pause()
      } else {
        Tone.Transport.start()
      }
    })

    if (Tone.Transport.state !== 'stopped') {
      window.location.reload()
      return this.hideLoading()
    }

    // Handle loaded
    Tone.Buffer.on('load', () => {
      this.handleLoaded()
    })
  }

  update (lastTime: number) {
    const { height } = this.app.renderer.screen

    this.$$sky.update()

    this.drops.map(($$drop, index) => {
      $$drop.dropAction()

      if ($$drop.isDead(height)) {
        const note = $$drop.getNote()
        const power = this.computePowerByMidi(note.midi)

        this.shamisen.triggerAttackRelease(
          note.name,
          note.duration,
          Tone.now(),
          note.velocity
        )
        this.$$sky.thunder(power)

        this.drops.splice(index, 1)
        $$drop.destroy()
      }
    })
  }

  onmount () {
    this.initObjects()

    if (
      Tone.Transport.state === 'stopped' &&
      this.shamisen.loaded
    ) {
      this.handleLoaded()
    }
  }

  onunmount () {
    Tone.Transport.stop()
  }

  onresize (width: number, height: number) {
    this.$$sky.onresize(width, height)
  }

  initObjects () {
    const { width, height } = this.app.screen

    this.drops = []

    this.$$sky = new $$Sky()
    this.$$sky.draw(width, height)
    this.$$sky.appendTo(this.app.stage)
  }

  genereateRainDrop (note: INoteEvent): $$Raindrop {
    const { width } = this.app.screen
    const power = this.computePowerByMidi(note.midi)

    return new $$Raindrop({
      note,
      color: power ? COLORS.SOFT_YELLOW : COLORS.LIGHT_WHITE,
      x: Math.floor(Math.random() * width)
    })
  }

  generateRandomSequence (): Tone.Part {
    const eventsSet = [
      satieGymnopedieN1NoteEvents
      // raindropPreludeNoteEvents
      // generatePentatonicScaleNoteEvents()
      // generateFBMNoteEvents()
    ]

    const events = randomChoice(eventsSet)

    const part = new Tone.Part((time, note) => {
      this.handleSequenceNoteEmit(note)
    }, events).start(0)

    part.loopEnd = parseInt(events[events.length - 1].time, 10)
    part.loop = true

    return part
  }

  handleLoaded () {
    const reverb = new Tone.Freeverb(0.8).toMaster()
    const tremolo = new Tone.Tremolo(9, 0.75).toMaster().start()
    const gain = new Tone.Gain(2.5).toMaster()

    this.hideLoading()
    this.shamisen
      .connect(reverb)
      .connect(tremolo)
      .connect(gain)
      .toMaster()

    this.shamisen.release = 10
    Tone.Transport.bpm.value = 60
    Tone.Transport.start()

    console.log(
      'Shamisen',
      this.shamisen,
      Tone.Transport,
      this.sequence
    )
  }

  handleSequenceNoteEmit (note: INoteEvent) {
    const $$raindrop = this.genereateRainDrop(note)
    $$raindrop.appendTo(this.app.stage)
    this.drops.push($$raindrop)
  }

  computePowerByMidi (midi: number): number {
    let power = 0

    if (
      noteToMidiMap['C5'] - midi > 0 &&
      midi & 2
    ) {
      power = midi / 120
    }

    return power
  }

  alignMiddleAndCenter (displayObject: PIXI.Sprite) {
    displayObject.x = this.app.screen.width / 2
    displayObject.y = this.app.screen.height / 2
    displayObject.anchor.x = 0.5
    displayObject.anchor.y = 0.5
  }

  showLoading () {
    this.$loading = new PIXI.Text(__('perform.shamisenRain.loading'), {
      fontFamily: FONT_FAMILY,
      fontSize: 26,
      fill: COLORS.LIGHT_WHITE
    })

    this.alignMiddleAndCenter(this.$loading)
    this.app.stage.addChild(this.$loading)
  }

  hideLoading () {
    if (this.$loading) {
      this.$loading.destroy()
      delete this.$loading
    }
  }

}

export const shamisenRainConductor = new ShamisenRainConductor()
