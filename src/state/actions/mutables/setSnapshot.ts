import { current } from 'immer'
import type { Action } from '../../constants'
import { mutables } from '../../mutables'

export const setSnapshot: Action = (data) => {
  mutables.snapshot = current(data)
}
