import type { Action } from '../../constants'
import { mutables } from '../../mutables'

export const restoreSnapshot: Action = (data) => {
  Object.assign(data, mutables.snapshot)
}
