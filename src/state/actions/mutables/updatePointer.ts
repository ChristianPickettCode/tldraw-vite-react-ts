import type { TLPointerInfo } from '@tldraw/core'
import type { Action } from '../../constants'
import { getPagePoint } from '../../helpers'
import { mutables } from '../../mutables'

export const updatePointer: Action = (data, payload: TLPointerInfo) => {
  mutables.previousPoint = [...mutables.currentPoint]
  mutables.currentPoint = getPagePoint(payload.point, data.pageState)
}
