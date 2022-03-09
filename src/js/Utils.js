export default class Utils {

  // Return a random value between min and max based on the seed
  static getRandomInt(min, max) {
    let range = max - min;
    let n = window.rng() * range;
    return min + n;
  }

}
