import type { Action } from '../../constants'
import { mutables } from '../../mutables'

export const clearPointedShape: Action = () => {
  mutables.pointedShapeId = undefined
}
