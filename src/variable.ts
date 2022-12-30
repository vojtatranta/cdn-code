import createRecord, { TypedRecord } from './ts-record-utils'

export type Defaults = {
  type: string
  name: string
  value: string
  regex: boolean
  timestamp: number
}

const defaults: Defaults = {
  type: 'var',
  name: '',
  value: '',
  regex: false,
  timestamp: 0,
}

export default class Variable extends (createRecord(defaults, 'Variable') as TypedRecord<
  typeof defaults,
  'value'
>) {
  static fromData(data: {
    type?: string,
    name?: string,
    newvalue?: string,
    value?:string,
    searchvalue?:string,
    regex?: boolean,
    timestamp?: number
  } = {}) {
    const cleanData: typeof defaults = {
      'type': data['type'] || '',
      'name': data['name'] || data['newvalue'] || '',
      'value': data['value'] || data['searchvalue'] || '',
      'regex': Boolean(data['regex']),
      'timestamp': data['timestamp'] || 0,
    }

    return new Variable(cleanData)
  }
}
