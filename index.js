const fs = require('fs')
const { KeyPatternError } = require('./errors')

class Template {
  constructor({ path, string, pattern = '@key', encoding = 'utf8' }) {
    this.handleTemplateSource(path, string, encoding)
    this.result = this.template
    this.pairs = new Map()
    this.setKeyPattern(pattern)

    // Inline getters
    this.getPairs = () => this.pairs
    this.getResult = () => this.result
    this.getTemplate = () => this.template
    this.getKeyPattern = () => this.keyPattern
  }

  /**
   * Receives a Map key-value sets to replace.
   * For each [key, value] in the Map each key found in the template will be replaced by value
   *
   * @param {string} path - Resolved path to file
   * @param {string} string - Initial template string (if not using a file)
   * @param {string} encoding - Expected encoding for file read
   * @memberof Template
   */
  handleTemplateSource(path, string, encoding) {
    if (!path && !string) {
      throw new Error('Missing template source')
    }
    if (path && string) {
      throw new Error('Cannot accept multiple template sources')
    }
    if (path) {
      this.template = fs.readFileSync(path, { encoding })
    } else {
      this.template = string
    }
  }

  /**
   * Receives a Map key-value sets to replace.
   * For each [key, value] in the Map each key found in the template will be replaced by value
   *
   * @param {Map<string, string>} [pairs] - Map of key-value pairs for replacement
   * @memberof Template
   * @return {string} - Filled template string
   */
  fill(pairs) {
    if (pairs) {
      this.addPairs(pairs)
    }

    this.pairs.forEach((value, key) => {
      let keyPatternResult;
      if (key instanceof RegExp) {
        keyPatternResult = key
      } else {
        keyPatternResult = new RegExp(this.keyPattern.replace('key', key), 'g')
      }

      this.result = this.result.replace(keyPatternResult, value)
    })

    this.pairs = new Map()

    return this.getResult()
  }

  /**
   * Receives a key and value to add to the internal replacement map
   *
   * @param {string|RegExp} key - Key to replace
   * @param {string} value - Value for replacement
   * @memberof Template
   */
  addPair(key, value) {
    const isArray = Array.isArray(key)
    if (!key) {
      throw new Error('Key cannot be undefined when setting a new pair')
    }
    if (!isArray && !value) {
      throw new Error('Value must be defined for key')
    }
    if (isArray && key.length !== 2) {
      throw new Error('Array must have length of exactly two')
    }
    if (isArray && (!key[0] || !key[1])) {
      throw new Error('Both items in the [key, value] array must be defined')
    }

    if (isArray) {
      this.pairs.set(key[0], key[1])
    } else {
      this.pairs.set(key, value)
    }
  }

  /**
   * Receives a Map of [key, value] to add to the internal replacement map
   *
   * @param {Map<string, string>} [pairs] - Map of key-value pairs
   * @memberof Template
   */
  addPairs(pairs) {
    if (!pairs || !(pairs instanceof Map)) {
      throw new TypeError('Supplied pairs must be an instance of Map')
    }
    if (pairs.size) {
      if (this.pairs.size) {
        this.pairs = new Map([...this.pairs, ...pairs])
      } else {
        this.pairs = pairs
      }
    }
  }

  /**
   * Receives a pattern for key replacement
   * First the string 'key' in the pattern is matched, then the resulting
   * string is used to find the locations in the template to insert the value
   *
   * @param {string} pattern - Key pattern. Must include the string 'key'
   * @memberof Template
   */
  setKeyPattern(pattern) {
    if (pattern.includes('key')) {
      this.keyPattern = pattern
    } else {
      throw new KeyPatternError(pattern)
    }
  }

  /**
   * Resets the modified template result to the original string
   *
   * @memberof Template
   */
  reset() {
    this.result = this.template
  }
}

module.exports = Template
