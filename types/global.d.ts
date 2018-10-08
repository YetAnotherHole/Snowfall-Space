declare var module: any
declare var require: any
declare var process: any

declare interface Window {
  TONE_SILENCE_VERSION_LOGGING: boolean
}

declare type Partial<T> = {
  [P in keyof T]?: T[P]
}
