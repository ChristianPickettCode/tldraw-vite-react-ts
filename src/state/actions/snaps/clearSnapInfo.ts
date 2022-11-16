import type { Action } from '../../constants'
import { mutables } from '../../mutables'

export const clearSnapInfo: Action = () => {
  mutables.snapInfo = undefined
}
