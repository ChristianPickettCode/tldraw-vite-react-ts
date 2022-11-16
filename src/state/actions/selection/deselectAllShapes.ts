import type { Action } from '../../constants'

export const deselectAllShapes: Action = (data) => {
  data.pageState.selectedIds = []
}
