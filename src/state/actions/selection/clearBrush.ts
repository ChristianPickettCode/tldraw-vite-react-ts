import type { Action } from '../../constants'

export const clearBrush: Action = (data) => {
  data.pageState.brush = undefined
}
