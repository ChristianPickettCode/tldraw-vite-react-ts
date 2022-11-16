import type { Action } from '../../constants'

export const clearSnapLines: Action = (data) => {
  data.overlays.snapLines = []
}
