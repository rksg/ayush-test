
import { TrendType } from '@acx-ui/components'

import { severitiesDefinition } from '.'

import type { SeveritiesProps } from './types'

export const severities = new Map(
  Object
    .keys(severitiesDefinition)
    .map(key => [key, severitiesDefinition[key as keyof typeof severitiesDefinition]])
    .sort((a: (string | SeveritiesProps)[], b: (string | SeveritiesProps)[]) => {
      const [, { lte }] = a as SeveritiesProps[]
      const [, { lte: lte2 }] = b as SeveritiesProps[]
      return lte2 - lte
    }) as Iterable<readonly [string, SeveritiesProps]>
) as Map<string, SeveritiesProps>

export function calculateSeverity (severity: number): TrendType | void {
  for (let [p, filter] of severities) {
    if (severity > filter.gt) {
      return p as TrendType
    }
  }
}
