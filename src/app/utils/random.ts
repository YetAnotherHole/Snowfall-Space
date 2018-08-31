export const randomChoice = (array: any[]) => {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Return a random floating-point number.
 * @REF: https://github.com/processing/p5.js/blob/master/src/math/random.js
 *
 * @method random
 * @param  {Number} [min]   the lower bound (inclusive)
 * @param  {Number} [max]   the upper bound (exclusive)
 * @return {Number} the random number
 * @example
 *
 */
export const randomBetween = (min?: number, max?: number) => {
  let rand = Math.random()

  if (typeof min === 'undefined') {
    return rand
  } else if (typeof max === 'undefined') {
    return rand * min
  } else {
    if (min > max) {
      let tmp = min
      min = max
      max = tmp
    }
    return rand * (max - min) + min
  }
}
