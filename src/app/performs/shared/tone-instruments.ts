import Tone from 'tone'
import { FULL_PITCH_RANGE } from './note-conversion'

interface IToneInstruments {
  [key: string]: Tone.Sampler | Tone.Players | any
}

interface IInstrumentOptions {
  name: string
  pitches?: string[]
}

export const getSoundfonts = (): { [key: string]: any } => {
  // @FIXME: app cradshed when dynamically require dirs
  return {
    // @REF: https://github.com/e1r0nd/rainy-mood
    ambient: require('../../assets/soundfonts/ambient/**/*.mp3'),
    shamisen: require('../../assets/soundfonts/shamisen/**/*.mp3')
    // shamisen: require('../../assets/soundfonts/acoustic-grand-piano/**/*.mp3')
  }
}

class SampleLoader {

  private defualtInstumentsOptions: IInstrumentOptions[] = [
    {
      // Atonal & FX
      name: 'ambient'
    },

    // Reguler
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
    const $isAtonal = name === 'ambient'

    const soundfonts = getSoundfonts()
    const audios = soundfonts[name]
    let samples

    if ($isAtonal) {
      samples = audios
    } else {
      samples = pitches.reduce((acc: any, value) => {
        acc[value] = audios[value]
        return acc
      }, {})
    }

    this.instruments[name] = $isAtonal
      ? new Tone.Players(samples, callback)
      : new Tone.Sampler(samples, callback)
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
