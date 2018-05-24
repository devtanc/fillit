class KeyPatternError extends Error {
  constructor(pattern) {
    super(`Invalid key pattern: ${pattern}`)
    this.name = 'KeyPatternError'
  }
}

module.exports = {
  KeyPatternError,
}
