import Tone from 'tone'
import { FULL_PITCH_RANGE } from './note-conversion'

interface IToneInstruments {
  [key: string]: Tone.Sampler
}

interface IInstrumentOptions {
  name: string
  pitches?: string[]
}

export const getSoundfonts = (): { [key: string]: any } => {
  // @FIXME: app cradshed when dynamically require dirs
  return {
    shamisen: require('../../assets/soundfonts/shamisen/**/*.mp3')
    // shamisen: require('../../assets/soundfonts/acoustic-grand-piano/**/*.mp3')
  }
}

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

    const soundfonts = getSoundfonts()
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
