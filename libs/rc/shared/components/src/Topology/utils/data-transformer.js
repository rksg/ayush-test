import { hierarchy } from 'd3'
import { get }       from 'lodash'

export const transformData = (data) => {
  const root = get(data, 'data[0]', null)
  if (root !== null) {
    return hierarchy(root, (d) => d.children)
  } else {
    return null
  }
}
