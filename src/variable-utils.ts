import { Map, is } from 'immutable'
import type Variable from './variable'

// NOTE: <string, Variable>, where string is variable value (as being unique) eg.: #fffff
type VariableMap = Map<string, Variable>
type VariablePatch = {
  additions: VariableMap
  deletions: VariableMap
  updates: VariableMap
}
export default class VariableUtils {
  static diffVariables(parentVariables: VariableMap, headVariables: VariableMap): VariablePatch {
    const updates = headVariables.filter((variable, variableValue) => {
      // NOTE: for update to have sense variables must exist in both maps
      const parentVariable = parentVariables.get(variableValue)

      if (!parentVariable) {
        return false
      }

      // NOTE: if head and parent variables are same, the update makes no sense
      return !is(variable, parentVariable)
    })

    // NOTE: simple, if variable exists in head and does not exist in parent it is an addition
    const additions = headVariables.filter((variable, variableValue) => {
      return !parentVariables.get(variableValue)
    })

    // NOTE: simple, if variable does not exist in head but exists in parent it is an deletion
    const deletions = parentVariables.filter((variable, variableValue) => {
      return !headVariables.get(variableValue)
    })

    return {
      updates,
      additions,
      deletions,
    }
  }

  static isPatchEmpty(patch: VariablePatch): boolean {
    return [patch.updates, patch.additions, patch.deletions].every((variablesMap) => {
      return variablesMap.size === 0
    })
  }

  static applyPatch(rootVariables: VariableMap, patch: VariablePatch): VariableMap {
    if (VariableUtils.isPatchEmpty(patch)) {
      return rootVariables
    }

    return rootVariables
      .merge(patch.updates)
      .merge(patch.additions)
      .update((vars) => {
        return patch.deletions.reduce((nextVars, value, key) => {
          return nextVars.delete(key)
        }, vars)
      })
  }

  // NOTE: in caase of conflict (addition clashes with update) timestamp is used to resolve the conflict,
  // if variable does not exist in parent variables (bVariables - but depends on usage) it will be considered as newer
  // by timestamp
  static createVariableTimestampComparator =
    (bVariables: VariableMap) => (aVariable: Variable, variableValue: string) => {
      const bVariable = bVariables.get(variableValue)

      if (!bVariable) {
        return true
      }

      return aVariable.get('timestamp') > bVariable.get('timestamp')
    }

  static excludeSameKeys =
    (bVariables: VariableMap) => (aVariable: Variable, variableValue: string) => {
      return !bVariables.get(variableValue)
    }

  static mergePatches(basePatch: VariablePatch, priorityPatch: VariablePatch): VariablePatch {
    const additions = basePatch.additions // NOTE: possible conflicts between additions an updates are resolved by timestamp
      .merge(
        priorityPatch.additions.filter(
          VariableUtils.createVariableTimestampComparator(basePatch.additions),
        ),
      ) // NOTE: updates are considered as deletions when same addition does not exist in base patch
      .merge(
        priorityPatch.updates.filter((variable, variableValue) => {
          return basePatch.additions.get(variableValue)
        }),
      )
      .filter((variable, variableKey) => {
        return !priorityPatch.deletions.get(variableKey)
      })

    const updates = basePatch.updates // NOTE: conflicts are resolved by timestamp
      .merge(
        priorityPatch.updates.filter(
          VariableUtils.createVariableTimestampComparator(basePatch.updates),
        ),
      ) // NOTE: addition can be considered as update when same update does not exist in base patch
      .merge(
        priorityPatch.additions.filter(
          VariableUtils.createVariableTimestampComparator(basePatch.updates),
        ),
      )

    const deletions = basePatch.deletions // NOTE: ignores deletions when updates are made in base patch (deletion and update cannot be resolved by timestamp)
      .merge(priorityPatch.deletions.filter(VariableUtils.excludeSameKeys(basePatch.updates))) // NOTE: additions and updates have priority compared to deletions
      .filter(VariableUtils.excludeSameKeys(priorityPatch.additions))
      .filter(VariableUtils.excludeSameKeys(priorityPatch.updates))

    return {
      additions,
      deletions,
      updates,
    }
  }
}
