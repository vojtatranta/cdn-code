import { Record as ImmutableRecord } from 'immutable'

// Usage
// ===
// const X: TypedRecord<typeof defaults, Input> = Record(defaults)
// ---
// class Y extends (Record(defaults): TypedRecord<typeof defaults, Input>) {
//   static what(data: Data): Y {
//     return new Y(data)
//   }
// }
// ===
// Where:
// - `defaults` has no optional keys (but can have optional values)
// - `Input` has the same set of keys as `defaults` with instance-specific keys
//   possibly marked as optional.
// ===

type RequiredParams<Defaults, RequiredKeys extends keyof Defaults = never> = {
  [K in RequiredKeys]: Defaults[K]
}

export interface IRecord<Defaults, RequiredKeys extends keyof Defaults = never> {
  new (
    requiredParams: RequiredParams<Defaults, RequiredKeys> &
      {
        [K in keyof Omit<Defaults, keyof RequiredParams<Defaults, RequiredKeys>>]?: Defaults[K]
      },
  ): this
  get<K extends keyof Defaults>(key: K): Defaults[K]
  set<K extends keyof Defaults, V extends Defaults[K]>(key: K, value: V): this
  delete<K extends keyof Defaults>(key: K): this
  merge(mergeObject: Partial<Defaults>): this
  update(recordUpdater: (r: this) => this): this
  update<K extends keyof Defaults, V extends Defaults[K]>(key: K, updater: (v: V) => V): this
  withMutations(cb: (r: IRecord<Defaults, RequiredKeys>) => this): this
  setIn<K1 extends keyof Defaults, V extends Defaults[K1]>(keys: [K1], val: V): this
  setIn<K1 extends keyof Defaults, K2 extends keyof Defaults[K1], V extends Defaults[K1][K2]>(
    keys: [K1, K2],
    val: V,
  ): this
  setIn<
    K1 extends keyof Defaults,
    K2 extends keyof Defaults[K1],
    K3 extends keyof Defaults[K1][K2],
    V extends Defaults[K1][K2][K3],
  >(
    keys: [K1, K2, K3],
    val: V,
  ): this
  toJS(): Defaults
  toObject(): Defaults
}

type TypedRecord<Defaults, RequiredKeys extends keyof Defaults = never> = IRecord<
  Defaults,
  RequiredKeys
>

export type { TypedRecord }

function createRecord<Defaults, RequiredKeys extends keyof Defaults = never>(
  defaults: Defaults,
  name: string,
): IRecord<Defaults, RequiredKeys> {
  return ImmutableRecord(defaults, name) as unknown as IRecord<Defaults, RequiredKeys>
}

export function Record<Defaults>(name: string, defaults: Defaults): IRecord<Defaults, never> {
  return ImmutableRecord(defaults, name) as unknown as IRecord<Defaults, never>
}

export default createRecord
