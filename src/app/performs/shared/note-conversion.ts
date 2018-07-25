/**
 * To MIDI Number: C8  -> 108
 * To Note Name: 108 -> C8
 */
const nameToNumber: any = {}
const numberToNameMap: any = {}

const init = () => {
  const A0 = 0x15 // First note
  const C8 = 0x6C // Last note
  const pitchNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  for (let n = A0; n <= C8; n++) {
    const octave = (n - 12) / 12 >> 0
    const name = pitchNames[n % 12] + octave
    nameToNumber[name] = n
    numberToNameMap[n] = name
  }
}

init()

export const FULL_PITCH_RANGE: string[] = Object.keys(nameToNumber)
