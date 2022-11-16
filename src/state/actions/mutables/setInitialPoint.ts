import type { TLPointerInfo } from '@tldraw/core'
import type { Action } from '../../constants'
import { getPagePoint } from '../../helpers'
import { mutables } from '../../mutables'

export const setInitialPoint: Action = (data, payload: TLPointerInfo) => {
  mutables.initialPoint = getPagePoint(payload.origin, data.pageState)
  mutables.previousPoint = [...mutables.initialPoint]
}
