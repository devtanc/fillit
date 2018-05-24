const path = require('path')
const assert = require('assert')
const { KeyPatternError } = require('../errors')
const Template = require('..')

describe('Template Class Unit Tests', () => {
  let template = null
  let fillMap = null

  beforeEach('reset template and map', () => {
    template = new Template({
      path: path.resolve(__dirname, 'test.template.html'),
    })
    fillMap = new Map()
  })

  describe('No replacements performed', () => {
    it('Should output original template (<empty> param)', () => {
      assert.equal(template.fill(), '<div>@test@anotherTest</div>')
    })

    it('Should output original template (<null> param)', () => {
      assert.equal(template.fill(null), '<div>@test@anotherTest</div>')
    })

    it('Should output original template (empty <Map> param)', () => {
      assert.equal(template.fill(fillMap), '<div>@test@anotherTest</div>')
    })
  })

  describe('Key pattern management', () => {
    it('Should accept custom key pattern', () => {
      template.setKeyPattern('%%@key##!')
      assert.equal(template.getKeyPattern(), '%%@key##!')
    })

    it('Should accept a regular expression as a Map key', () => {      
      assert.doesNotThrow(() => template.addPair(/[Tt]est/g, 'replaced'))
    })
    
    it('Should reject key patterns that do not contain the substring "key"', () => {
      assert.throws(() => template.setKeyPattern('%%@yek##!'), KeyPatternError)
      assert.throws(() => template.setKeyPattern('ke y'), KeyPatternError)
      assert.throws(() => template.setKeyPattern('keey'), KeyPatternError)
      assert.throws(() => template.setKeyPattern(''), KeyPatternError)
    })
  })
  
  describe('Replacements', () => {
    it('Should perform a simple, single string replacement (external Map provided)', () => {
      fillMap.set('test', 'replaced')
      assert.equal(template.fill(fillMap), '<div>replaced@anotherTest</div>')
    })
    
    it('Should replace according to custom key pattern', () => {
      template = new Template({
        path: path.resolve(__dirname, 'test2.template.html'),
      })
      template.setKeyPattern('%%@key##!')
      template.addPair('thisismykey', 'replaced')
  
      assert.equal(template.fill(fillMap), '<div>replaced</div>')
    })

    it('Should allow regex key to override the key pattern for that round of replacements', () => {
      template.addPair('test', '@thisisatest')
      template.addPair(/test/gi, 'replacedwithregex')

      assert.equal(template.fill(), '<div>@thisisareplacedwithregex@anotherreplacedwithregex</div>')
    })

    it('Should accept setting of pairs internally, then performing replacement', () => {
      template.addPair('test', 'replaced')
      assert.equal(template.fill(), '<div>replaced@anotherTest</div>')
    })

    it('Should accept setting of pairs internally, then performing replacement (empty Map)', () => {
      template.addPair('test', 'replaced')
      assert.equal(template.fill(fillMap), '<div>replaced@anotherTest</div>')
    })

    it('Should perform a more complex, multi replacement', () => {
      fillMap.set('test', '<div>This is the one div</div>')
      fillMap.set('anotherTest', '<div>This is the other div</div>')
      fillMap.set(/This/, 'Replaced')

      assert.equal(
        template.fill(fillMap),
        '<div><div>Replaced is the one div</div><div>This is the other div</div></div>',
      )
    })

    it('Should include previously replaced values in subsequent replacements', () => {
      fillMap.set('test', '<div>This is the one div</div>@anotherTest')
      fillMap.set('anotherTest', '<div>This is the other div</div>')

      assert.equal(
        template.fill(fillMap),
        '<div><div>This is the one div</div><div>This is the other div</div><div>This is the other div</div></div>',
      )
    })
  })

  describe('Errors', () => {
    it('Should not allow undefined or null <key,value> pair when adding a single pair', () => {
      assert.throws(() => template.addPair(), Error)
      assert.throws(() => template.addPair(undefined,'value'), Error)
      assert.throws(() => template.addPair(null,'value'), Error)
      assert.throws(() => template.addPair('key'), Error)
    })
    it('Should only allow arrays of length 2 with defined contents when adding a single pair', () => {
      assert.throws(() => template.addPair([]), Error)
      assert.throws(() => template.addPair(['key']), Error)
      assert.throws(() => template.addPair([,'value']), Error)
      assert.doesNotThrow(() => template.addPair(['key','value']), Error)
    })

    it('Requires at least one specified template source', () => {
      assert.throws(() => template.handleTemplateSource(), Error)
    })

    it('Should not allow two template sources', () => {
      assert.throws(() => template.handleTemplateSource('/path/to/thing', 'templateString'), Error)
    })

    it('Should requirea Map to be passed in to addPairs', () => {
      assert.throws(() => template.addPairs({ key: 'value' }))
      assert.throws(() => template.addPairs(['key', 'value']))
      assert.throws(() => template.addPairs([['key', 'value'], ['key2', 'value2']]))
      assert.throws(() => template.addPairs('string'))
      assert.doesNotThrow(() => template.addPairs(new Map([['key', 'value'], ['key2', 'value2']])))
    })
  })

  describe('Proper Cleanup', () => {
    it('Should clear internal pairs map after fill', () => {
      template.addPair('test', '<div>This is the one div</div>')
      template.addPair('anotherTest', '<div>This is the other div</div>')

      assert.equal(template.getPairs().size, 2)
      template.fill()
      assert.equal(template.getPairs().size, 0)
    })

    it('Should reset result correctly', () => {
      template.addPair('test', '<div>This is the one div</div>')
      template.addPair('anotherTest', '<div>This is the other div</div>')
      template.fill()
      template.reset()

      assert.equal(template.getResult(), '<div>@test@anotherTest</div>')
    })
  })
})
