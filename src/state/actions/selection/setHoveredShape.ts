import type { TLPointerInfo } from '@tldraw/core'
import type { Action } from '../../constants'

export const setHoveredShape: Action = (data, payload: TLPointerInfo) => {
  data.pageState.hoveredId = payload.target
}
