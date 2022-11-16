import type { TLPointerInfo } from '@tldraw/core'
import type { Action } from '../../constants'
import { mutables } from '../../mutables'
import { resizeSelectedShapes } from './resizeSelectedShapes'
import { rotateSelectedShapes } from './rotateSelectedShapes'

export const transformSelectedShapes: Action = (data, payload: TLPointerInfo) => {
  const { pointedBoundsHandleId } = mutables

  if (pointedBoundsHandleId === 'rotate') {
    rotateSelectedShapes(data, payload)
  } else {
    resizeSelectedShapes(data, payload)
  }
}
