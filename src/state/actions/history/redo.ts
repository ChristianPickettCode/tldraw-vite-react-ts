import type { Action } from '../../constants'
import { mutables } from '../../mutables'

export const redo: Action = (data) => {
  const snapshot = mutables.history.redo()
  Object.assign(data, snapshot)
}
