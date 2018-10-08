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
  SampleLoader,
  midiToNoteMap,
  noteToMidiMap
} from '../shared'

import {
  // satieGymnopedieN1NoteEvents,
  // raindropPreludeNoteEvents,
  // generatePentatonicScaleNoteEvents,
  traditionalJapanNoteEvents,
  generateFBMNoteEvents
} from './note-events'

// @TODO: Optimize experience for vision and hearing
// @TODO: Support dynamic sequence, auto switch to next sequence if current was ended
export class ShamisenRainConductor extends BaseConductor {
  private ambient: Tone.Players
  private shamisen: Tone.Sampler
  private visibilityId: number | boolean

  private bass: Tone.Sequence
  private melody: Tone.Part

  // Particles
  private drops: $$Raindrop[]

  // Display objects
  private $loading: PIXI.Text
  private $$sky: $$Sky

  setup () {
    this.showLoading()

    const toneInstruments = new SampleLoader().exportInstruments()

    this.ambient = toneInstruments['ambient']
    this.shamisen = toneInstruments['shamisen']
    this.melody = this.generateRandomMelody()
    this.bass = this.generateBass()
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
          note.duration / 2,
          Tone.now(),
          note.velocity
        )
        this.$$sky.thunder(
          power,
          this.playThunder
        )

        this.drops.splice(index, 1)
        $$drop.destroy()
      }
    })
  }

  onmount () {
    this.initObjects()

    // Listen page visibility
    if (visibility.state() === 'hidden') {
      return Tone.Transport.pause()
    }

    this.visibilityId = visibility.change((e, state) => {
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

    if (
      Tone.Transport.state === 'stopped' &&
      this.shamisen.loaded
    ) {
      this.handleLoaded()
    }
  }

  onunmount () {
    Tone.Transport.stop()
    visibility.unbind(this.visibilityId as number)
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
      color: power ? COLORS.YELLOW_700 : COLORS.GRAY_BLACK,
      x: this.generateRandomRaindropX()
    })
  }

  generateRandomRaindropX (): number {
    const { width } = this.app.screen
    const x = Math.floor(Math.random() * width)
    const middleGap = width * 0.1

    if (Math.abs((width / 2 - x)) < middleGap) {
      return this.generateRandomRaindropX()
    }

    return x
  }

  generateRandomMelody (): Tone.Part {
    const eventsSet = [
      traditionalJapanNoteEvents
      // satieGymnopedieN1NoteEvents
      // raindropPreludeNoteEvents
      // generatePentatonicScaleNoteEvents()
      // generateFBMNoteEvents()
    ]

    const events = randomChoice(eventsSet)

    const part = new Tone.Part((time, note) => {
      this.handleMelodyNoteEmit(note)
    }, events).start(0)

    part.loopEnd = parseInt(events[events.length - 1].time, 10)
    part.loop = true

    return part
  }

  generateBass (): Tone.Sequence {
    const sequence = [
      'C1', 'F1'
    ]

    const bass = new Tone.Sequence((time, name) => {
      const note = {
        name,
        midi: noteToMidiMap[name],
        duration: 10,
        velocity: 0.1
      }
      this.handleBassNoteEmit(note)
    }, sequence, '1m')

    bass.start(0)
    bass.loop = true

    return bass
  }

  handleLoaded () {
    this.hideLoading()

    // Backgroundsound
    this.ambient.toMaster()
    const backgroundEvents = [
      'rain-heavy',
      'rain-soft'
    ]
    backgroundEvents.map(value => {
      const player = this.ambient.get(value)
      if (value === 'rain-heavy') {
        player.volume.setValueAtTime(-27, 0.1)
      } else {
        player.volume.setValueAtTime(-5, 0.1)
      }
      player.fadeIn = 2
      player.loop = true
      player.sync().start()
    })

    // Frontsound
    const pingPong = new Tone.PingPongDelay({
      delayTime: '4n',
			wet: 0.3
    }).toMaster()
    const reverb = new Tone.Freeverb(0.8).toMaster()
    const gain = new Tone.Gain(1.2).toMaster()
    this.shamisen
      .connect(reverb)
      .connect(gain)
      .connect(pingPong)
      .toMaster()
    this.shamisen.release = 1
    this.shamisen.volume.setValueAtTime(-12, 0.1)

    // Main timeline
    Tone.Transport.bpm.value = 50
    Tone.Transport.start()

    console.log(
      'Shamisen',
      this.shamisen,
      Tone.Transport,
      this.melody
    )
  }

  handleMelodyNoteEmit (note: INoteEvent) {
    const $$raindrop = this.genereateRainDrop(note)
    $$raindrop.appendTo(this.app.stage)
    this.drops.push($$raindrop)
  }

  handleBassNoteEmit (note: INoteEvent) {
    const { width } = this.app.screen
    const $$raindrop = new $$Raindrop({
      note,
      x: width / 2
    })
    $$raindrop.appendTo(this.app.stage)
    this.drops.push($$raindrop)
  }

  computePowerByMidi (midi: number): number {
    let power = 0
    const middleMidi = noteToMidiMap['A4']
    const midiDiff = Math.abs(middleMidi - midi)
    const threshold = 10

    if (
      midiDiff - threshold > 0 &&
      midi % 2
    ) {
      power = midiDiff / 90
    }

    return power
  }

  playThunder = (power: number): void => {
    const threshold = 0.4

    const thunderName = randomChoice([
      'thunder-close-long',
      'thunder-distant-quite',
      'thunder-middle-fast',
      'thunder-slow-chill'
    ])
    const player = this.ambient.get(thunderName)

    if (
      power < threshold ||
      player.state !== 'stopped'
    ) {
      return
    }

    player.volume.setValueAtTime(-10, 0.1)
    player.fadeIn = 1
    player.start()
  }

  showLoading () {
    this.$loading = new PIXI.Text(__('perform.shamisenRain.loading'), {
      fontFamily: FONT_FAMILY,
      fontSize: 26,
      fill: COLORS.GRAY_BLACK
    })

    this.alignCenterAndMiddle(this.$loading)
    this.app.stage.addChild(this.$loading)
  }

  hideLoading () {
    if (this.$loading) {
      this.$loading.destroy()
      delete this.$loading
    }
  }

}
