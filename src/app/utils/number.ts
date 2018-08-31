// Clamp
export const limitBetween = (value: number, min: number, max: number) => {
  value = Math.min(value, max)
  value = Math.max(value, min)
  return value
}
