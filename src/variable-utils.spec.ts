/* eslint-disable jest/valid-expect */
import chai, { expect } from 'chai'

// @ts-expect-error: chai-immutable does not have TS types
import chaiImmutable from 'chai-immutable'

import { Map } from 'immutable'

import Variable from './variable'
import VariableUtils from './variable-utils'

chai.use(chaiImmutable)

describe('VariableUtils', () => {
  describe('diffing', () => {
    it('should return updated variables', () => {
      const rootVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
        '777': new Variable({
          'name': '777',
          'value': '777',
        }),
      })

      const headVariables = Map({
        'abc': new Variable({
          'name': 'ABCDEF',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
        '777': new Variable({
          'name': '888',
          'value': '777',
        }),
      })

      expect(VariableUtils.diffVariables(rootVariables, headVariables).updates).to.deep.equal(
        Map({
          'abc': new Variable({
            'name': 'ABCDEF',
            'value': 'abc',
          }),
          '777': new Variable({
            'name': '888',
            'value': '777',
          }),
        }),
      )
    })

    it('should return added variables', () => {
      const rootVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
      })

      const headVariables = Map({
        'abc': new Variable({
          'name': 'ABCDEF',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
        '777': new Variable({
          'name': '888',
          'value': '777',
        }),
        '10000': new Variable({
          'name': '1000',
          'value': '10000',
        }),
      })

      expect(VariableUtils.diffVariables(rootVariables, headVariables).additions).to.deep.equal(
        Map({
          '777': new Variable({
            'name': '888',
            'value': '777',
          }),
          '10000': new Variable({
            'name': '1000',
            'value': '10000',
          }),
        }),
      )
    })

    it('should return deleted variables', () => {
      const rootVariables = Map({
        'abc': new Variable({
          'name': 'ABCDEF',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
        '777': new Variable({
          'name': '888',
          'value': '777',
        }),
        '10000': new Variable({
          'name': '1000',
          'value': '10000',
        }),
      })

      const headVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': '',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
      })

      expect(VariableUtils.diffVariables(rootVariables, headVariables).deletions).to.deep.equal(
        Map({
          '777': new Variable({
            'name': '888',
            'value': '777',
          }),
          '10000': new Variable({
            'name': '1000',
            'value': '10000',
          }),
        }),
      )
    })

    it('should ignore deletion when an update is made', () => {
      const baseState = Map({
        'mehehe': new Variable({
          'name': 'mehehe',
          'value': 'mehehe',
          'timestamp': 1496696931079,
        }),
      })

      const aState = Map({
        'mehehe': new Variable({
          'name': 'meheheCHANGE',
          'value': 'mehehe',
          'timestamp': 1496698212326,
        }),
      })

      const bState = Map<string, Variable>()

      const aBasePatch = VariableUtils.diffVariables(baseState, aState)
      const bBasePatch = VariableUtils.diffVariables(baseState, bState)

      const resolvePatch = VariableUtils.mergePatches(aBasePatch, bBasePatch)
      expect(resolvePatch.deletions).to.deep.equal(Map<string, Variable>())
      expect(resolvePatch.updates).to.deep.equal(aState)
    })

    it('should ignore deletion when an addition is made', () => {
      const baseState = Map<string, Variable>()

      const aState = Map({
        'mehehe': new Variable({
          name: 'muhehe',
          value: 'mehehe',
          timestamp: 1496698212326,
        }),
      })

      const bState = Map<string, Variable>()

      const aBasePatch = VariableUtils.diffVariables(baseState, aState)
      const bBasePatch = VariableUtils.diffVariables(baseState, bState)

      const resolvePatch = VariableUtils.mergePatches(aBasePatch, bBasePatch)
      expect(resolvePatch.deletions).to.deep.equal(Map<string, Variable>())
      expect(resolvePatch.additions).to.deep.equal(aState)
    })
  })

  describe('appyling patches', () => {
    it('should apply patch to empty variables', () => {
      const rootVariables = Map<string, Variable>()

      const nextVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
      })

      const patch = VariableUtils.diffVariables(rootVariables, nextVariables)
      expect(VariableUtils.applyPatch(rootVariables, patch)).to.deep.equal(
        Map({
          'abc': new Variable({
            'name': 'abc',
            'value': 'abc',
          }),
          '123': new Variable({
            'name': '123',
            'value': '123',
          }),
        }),
      )
    })

    it('should apply patch with deletions and addition', () => {
      const rootVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
      })

      const nextVariables = Map({
        'added': new Variable({
          'name': 'added',
          'value': 'added',
        }),
      })

      const appliedVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
      })

      const patch = VariableUtils.diffVariables(rootVariables, nextVariables)
      expect(VariableUtils.applyPatch(appliedVariables, patch)).to.deep.equal(
        Map({
          'added': new Variable({
            'name': 'added',
            'value': 'added',
          }),
        }),
      )
    })

    it('should apply patch with deletions, addition and updates', () => {
      const rootVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
      })

      const nextVariables = Map({
        'added': new Variable({
          'name': 'added',
          'value': 'added',
        }),
        '123': new Variable({
          'name': 'ABCD',
          'value': 'ABCD',
        }),
      })

      const appliedVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
      })

      const patch = VariableUtils.diffVariables(rootVariables, nextVariables)
      expect(VariableUtils.applyPatch(appliedVariables, patch)).to.deep.equal(
        Map({
          'added': new Variable({
            'name': 'added',
            'value': 'added',
          }),
          '123': new Variable({
            'name': 'ABCD',
            'value': 'ABCD',
          }),
        }),
      )
    })
  })

  describe('resolving patch conflicts', () => {
    it('should simply merge only deletion patches', () => {
      const aVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
      })

      const aNextVariables = Map<string, Variable>()

      const bVariables = Map({
        'AAA': new Variable({
          'name': 'AAA',
          'value': 'AAA',
        }),
        'BBB': new Variable({
          'name': 'BBB',
          'value': 'BBB',
        }),
      })

      const bNextVariables = Map<string, Variable>()

      const aPatch = VariableUtils.diffVariables(aVariables, aNextVariables)
      const bPatch = VariableUtils.diffVariables(bVariables, bNextVariables)

      const resultPatch = VariableUtils.mergePatches(aPatch, bPatch)
      expect(resultPatch.deletions).to.deep.equal(aVariables.merge(bVariables))
      expect(resultPatch.additions).to.deep.equal(Map<string, Variable>())
      expect(resultPatch.updates).to.deep.equal(Map<string, Variable>())
    })

    it('should override additions in base patch by deletion in priority patch', () => {
      const aVariables = Map<string, Variable>()
      const aNextVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
      })

      const bVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
        }),
      })

      const bNextVariables = Map<string, Variable>()

      const aPatch = VariableUtils.diffVariables(aVariables, aNextVariables)
      const bPatch = VariableUtils.diffVariables(bVariables, bNextVariables)

      const resultPatch = VariableUtils.mergePatches(aPatch, bPatch)
      expect(resultPatch.deletions).to.deep.equal(bVariables)
      expect(resultPatch.additions).to.deep.equal(Map<string, Variable>())
      expect(resultPatch.updates).to.deep.equal(Map<string, Variable>())
    })

    it('should override deletes in base patch by updates older updates', () => {
      const aVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
          'timestamp': 10,
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
          'timestamp': 10,
        }),
      })

      const aNextVariables = Map<string, Variable>()

      const bVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
          'timestamp': 10,
        }),
        '123': new Variable({
          'name': '123',
          'value': '123',
          'timestamp': 10,
        }),
      })

      const bNextVariables = Map({
        'abc': new Variable({
          'name': 'ABCD',
          'value': 'abc',
          'timestamp': 15,
        }),
        '123': new Variable({
          'name': '12345566778',
          'value': '123',
          'timestamp': 15,
        }),
      })

      const aPatch = VariableUtils.diffVariables(aVariables, aNextVariables)
      const bPatch = VariableUtils.diffVariables(bVariables, bNextVariables)

      const resultPatch = VariableUtils.mergePatches(aPatch, bPatch)
      expect(resultPatch.deletions).to.deep.equal(Map<string, Variable>())
      expect(resultPatch.additions).to.deep.equal(Map<string, Variable>())
      expect(resultPatch.updates).to.deep.equal(bNextVariables)
    })

    it('should merge patches with updates and additions', () => {
      const aVariables = Map({
        'BBB': new Variable({
          'name': 'BBB',
          'value': 'BBB',
        }),
      })
      const aNextVariables = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
        }),
        'BBB': new Variable({
          'name': 'ZZZ',
          'value': 'BBB',
          'timestamp': 10,
        }),
      })

      const bVariables = Map({
        'AAA': new Variable({
          'name': 'AAA',
          'value': 'AAA',
        }),
      })

      const bNextVariables = Map({
        'AAA': new Variable({
          'name': 'AAA',
          'value': 'AAA',
        }),
        'BBB': new Variable({
          'name': 'COMPLETELY DIFFERENT',
          'value': 'BBB',
          'timestamp': 1,
        }),
      })

      const aPatch = VariableUtils.diffVariables(aVariables, aNextVariables)
      const bPatch = VariableUtils.diffVariables(bVariables, bNextVariables)

      const resultPatch = VariableUtils.mergePatches(aPatch, bPatch)
      expect(resultPatch.updates).to.deep.equal(
        Map({
          'BBB': new Variable({
            'name': 'ZZZ',
            'value': 'BBB',
            'timestamp': 10, // older than COMPLETELY_DIFFERENT
          }),
        }),
      )
      expect(resultPatch.deletions).to.deep.equal(Map<string, Variable>())
      expect(resultPatch.additions).to.deep.equal(
        Map({
          'abc': new Variable({
            'name': 'abc',
            'value': 'abc',
          }),
          'BBB': new Variable({
            'name': 'COMPLETELY DIFFERENT',
            'value': 'BBB',
            'timestamp': 1,
          }),
        }),
      )
    })
  })

  describe('complex resolving of conflicting patches', () => {
    it('should get complete new variables', () => {
      const baseState = Map({
        'abc': new Variable({
          'name': 'abc',
          'value': 'abc',
          'timestamp': 1,
        }),
        'BBB': new Variable({
          'name': 'ZZZ',
          'value': 'BBB',
          'timestamp': 2,
        }),
        'XXX': new Variable({
          'name': 'ZZZ',
          'value': 'XXX',
        }),
        'YYY': new Variable({
          'name': 'YYYY',
          'value': 'YYY',
          'timestamp': 1,
        }),
        'GGG': new Variable({
          'name': 'GGG',
          'value': 'GGG',
          'timestamp': 2,
        }),
      })

      const aState = Map({
        'abc': new Variable({
          'name': 'ABCDE',
          'value': 'abc',
          'timestamp': 10,
        }),
        'BBB': new Variable({
          'name': 'bbb',
          'value': 'BBB',
          'timestamp': 13,
        }),
        'CCC': new Variable({
          'name': 'CCC',
          'value': 'CCC',
        }),
        'YYY': new Variable({
          'name': 'YYYY',
          'value': 'YYY',
          'timestamp': 10,
        }),
        'GGG': new Variable({
          'name': 'ggggggg',
          'value': 'GGG',
          'timestamp': 1,
        }),
        'aState': new Variable({
          'name': 'aState',
          'value': 'aState',
        }),
      })

      const bState = Map({
        'BBB': new Variable({
          'name': 'BQBQBQ',
          'value': 'BBB',
          'timestamp': 30,
        }),
        'DDD': new Variable({
          'name': 'DDD',
          'value': 'DDD',
        }),
        'YYY': new Variable({
          'name': 'YYYY',
          'value': 'YYY',
          'timestamp': 1,
        }),
        'GGG': new Variable({
          'name': 'GGG',
          'value': 'GGG',
          'timestamp': 10,
        }),
        'bState': new Variable({
          'name': 'bState',
          'value': 'bState',
        }),
      })

      const aBasePatch = VariableUtils.diffVariables(baseState, aState)
      const bBasePatch = VariableUtils.diffVariables(baseState, bState)

      const resolvePatch = VariableUtils.mergePatches(aBasePatch, bBasePatch)
      const nextVariables = VariableUtils.applyPatch(baseState, resolvePatch)
      expect(nextVariables).to.deep.equal(
        Map({
          'abc': new Variable({
            'name': 'ABCDE',
            'value': 'abc',
            'timestamp': 10,
          }),
          'BBB': new Variable({
            // overridden in B added different in A (older)
            'name': 'BQBQBQ',
            'value': 'BBB',
            'timestamp': 30,
          }),
          'CCC': new Variable({
            // added in A
            'name': 'CCC',
            'value': 'CCC',
          }),
          'DDD': new Variable({
            // added in B
            'name': 'DDD',
            'value': 'DDD',
          }),
          'GGG': new Variable({
            // updated in A but added differently in B with older timestamp
            'name': 'GGG',
            'value': 'GGG',
            'timestamp': 10,
          }),
          'bState': new Variable({
            // added in B
            'name': 'bState',
            'value': 'bState',
          }),
          'aState': new Variable({
            // added in A
            'name': 'aState',
            'value': 'aState',
          }),
          'YYY': new Variable({
            // added in A and B
            'name': 'YYYY',
            'value': 'YYY',
            'timestamp': 10,
          }),
        }),
      )
    })

    it('should get added variables from empty remote state', () => {
      const baseState = Map<string, Variable>()

      const aState = Map({
        'abc': new Variable({
          'name': 'ABCDE',
          'value': 'abc',
          'timestamp': 10,
        }),
        'BBB': new Variable({
          'name': 'bbb',
          'value': 'BBB',
          'timestamp': 13,
        }),
      })

      const bState = Map<string, Variable>()

      const aBasePatch = VariableUtils.diffVariables(baseState, aState)
      const bBasePatch = VariableUtils.diffVariables(baseState, bState)

      const resolvePatch = VariableUtils.mergePatches(aBasePatch, bBasePatch)
      const nextVariables = VariableUtils.applyPatch(baseState, resolvePatch)
      expect(nextVariables).to.deep.equal(aState)
    })
  })
})
