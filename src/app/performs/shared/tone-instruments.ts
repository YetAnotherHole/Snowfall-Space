import Tone from 'tone'
import { FULL_PITCH_RANGE } from './note-conversion'

interface IToneInstruments {
  [key: string]: Tone.Sampler
}

interface IInstrumentOptions {
  name: string
  pitches?: string[]
}

const soundfonts = require('../../assets/soundfonts/**/*.mp3')

class SampleLoader {

  private defualtInstumentsOptions: IInstrumentOptions[] = [
    {
      name: 'shamisen'
    }
  ]

  private instruments: IToneInstruments = {}

  constructor () {
    this.defualtInstumentsOptions.map(instrumentOptions => {
      this.load(instrumentOptions)
    })
  }

  load (instrumentsOptions: IInstrumentOptions, callback?: () => {}) {
    const name = instrumentsOptions.name
    const pitches = instrumentsOptions.pitches || FULL_PITCH_RANGE

    const audios = soundfonts[name]
    const samples = pitches.reduce((acc: any, value) => {
      acc[value] = audios[value]
      return acc
    }, {})

    this.instruments[name] = new Tone.Sampler(
      samples,
      callback
    )
  }

  onLoad (callback: () => {}) {
    // @TODO
  }

  onError (callback: () => {}) {
    // @TODO
  }

  exportInstruments (): IToneInstruments {
    return this.instruments
  }

}

const sampleLoader = new SampleLoader()

export const toneInstruments = sampleLoader.exportInstruments()
