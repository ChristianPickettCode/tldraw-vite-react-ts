import type { Action } from '../../constants'
import { mutables } from '../../mutables'

export const setPointedBoundsHandle: Action = (data, payload) => {
  mutables.pointedBoundsHandleId = payload.target
}
