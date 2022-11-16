import type { Action } from '../../constants'
import { mutables } from '../../mutables'

export const undo: Action = (data) => {
  const snapshot = mutables.history.undo()
  Object.assign(data, snapshot)
}
