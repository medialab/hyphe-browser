/**
 * This function tests a function that returns a promise every N milliseconds,
 * until the promise resolves.
 *
 * @param promiseBuilder A function that creates the promise to test
 * @param timeout        The time in milliseconds to wait between two retries
 * @returns {Promise<*>} A promise that will succeed once the promiseBuilder
 *                       creates a "successfull" promise
 */
export default async function promiseRetry (promiseBuilder, timeout) {
  let res = null
  let retry = true

  while (retry) {
    try {
      res = await promiseBuilder()
      retry = false
    } catch (e) {
      await new Promise(resolve => setTimeout(() => resolve(), timeout))
    }
  }

  return res
}
