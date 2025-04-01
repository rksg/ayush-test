import { cssStr } from '../../../theme/helper'

export const nodes = [
  { name: 'Non-Interfering AP', value: 12, color: cssStr('--acx-accents-blue-50') },
  { name: 'Co-Channel Interfering AP', value: 9, color: cssStr('--acx-semantics-red-50') },
  { name: 'Rogue AP', value: 5, color: cssStr('--acx-neutrals-80') }
]

export const nodesWithZeroValue = [
  { name: 'Non-Interfering AP', value: 0, color: cssStr('--acx-accents-blue-50') },
  { name: 'Co-Channel Interfering AP', value: 9, color: cssStr('--acx-semantics-red-50') },
  { name: 'Rogue AP', value: 5, color: cssStr('--acx-neutrals-80') }
]

export const rootNode = { name: 'AP', color: cssStr('--acx-neutrals-50') }

export const nodeSize = {
  max: 120,
  min: 50
}
