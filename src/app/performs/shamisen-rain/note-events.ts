import shuffle from 'lodash/shuffle'
import { INoteEvent, noteToMidiMap, midiToNoteMap } from '../shared'

const DEFAULT_NOTE: INoteEvent = {
  name: 'C4',
  midi: noteToMidiMap['C4'],
  duration: 0.5,
  velocity: 1
}

const generateMidiPartNoteEvents = (midiJson: any): INoteEvent[] => {
  const events: INoteEvent[] = []
  midiJson.tracks.map((track: any) => {
    events.push(...track.notes)
  })
  return events
}

// export const raindropPreludeNoteEvents = generateMidiPartNoteEvents(
//   require('./midi-json/raindrop-prelude.json')
// )

export const satieGymnopedieN1NoteEvents = generateMidiPartNoteEvents(
  require('./midi-json/satie-gymnopedie-n1.json')
)

const pentatonicScaleNotes: string[] = [
  'C2', 'Eb2', 'F2', 'G2', 'Bb2',
  'C3', 'Eb3', 'F3', 'G3', 'Bb3',
  'C4', 'Eb4', 'F4', 'G4', 'Bb4',
  'C5', 'Eb5', 'F5', 'G5', 'Bb5',
  'C6', 'Eb6', 'F6', 'G6', 'Bb6'
]

export const generatePentatonicScaleNoteEvents = (): INoteEvent[] => {
  let time = 0

  const events = pentatonicScaleNotes.map(name => {
    time += ((1 / 3) * 1)

    return {
      ...DEFAULT_NOTE,
      name,
      time,
      midi: noteToMidiMap[name]
    }
  })

  return shuffle(events)
}

// FBM: Fractal Brownian Motion
// @TODO: Regenerate, replace midis with algorithm
export const generateFBMNoteEvents = (): INoteEvent[] => {
  const midis = shuffle([
    50, 51, 34, 38, 53, 24, 34, 22,
    26, 36, 41, 29, 43, 41, 24,
    27, 43, 34, 43, 32, 36, 46,
    46, 34
  ])

  let time = 0

  const events = midis.map(midi => {
    time += ((3 / 12) * 1)
    midi -= 2

    return {
      ...DEFAULT_NOTE,
      midi,
      time,
      name: midiToNoteMap[midi]
    }
  })

  return events
}
