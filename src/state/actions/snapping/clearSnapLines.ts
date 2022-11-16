import type { Action } from '../../constants'

export const clearSnaplines: Action = (data) => {
  data.overlays.snapLines = []
}
