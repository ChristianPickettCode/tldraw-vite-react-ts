import type { Action } from '../../constants'

export const clearPerformanceMode: Action = (data) => {
  data.performanceMode = undefined
}
