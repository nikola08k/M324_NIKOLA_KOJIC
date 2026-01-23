// index.test.js
import assert from 'assert'
import { sum } from './index.js'

describe('sum', () => {
  it('should add 1 + 2 to equal 3', () => {
    assert.equal(sum(1, 2), 3)
  })

  it('should add decimals: 1.1 + 2.2 = 3.3', () => {
    assert.equal(sum(1.1, 2.2), 3.3)
  })
})
