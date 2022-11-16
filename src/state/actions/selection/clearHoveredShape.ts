import type { Action } from '../../constants'

export const clearHoveredShape: Action = (data) => {
  data.pageState.hoveredId = undefined
}
