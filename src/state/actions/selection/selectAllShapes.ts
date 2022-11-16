import type { Action } from '../../constants'

export const selectAllShapes: Action = (data) => {
  data.pageState.selectedIds = Object.keys(data.page.shapes)
}
