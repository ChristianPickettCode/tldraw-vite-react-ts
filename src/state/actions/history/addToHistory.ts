import type { Action } from '../../constants'
import { mutables } from '../../mutables'

export const addToHistory: Action = (data) => {
  mutables.history.push(data)
}
