import _ from 'lodash'

import { Incident }   from '@acx-ui/analytics/utils'
import { TableProps } from '@acx-ui/components'

export interface ImpactedTableProps {
  incident: Incident
}

const defaultSort = (a: string | number, b: string | number) => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export function sortedColumn <RecordType> (
  prop: keyof RecordType,
  columns: Partial<TableProps<RecordType>['columns'][number]>
): TableProps<RecordType>['columns'][number] {
  return {
    ...columns,
    sorter: {
      compare: (a: RecordType, b: RecordType) => {
        const valueA = _.get(a, prop)
        const valueB = _.get(b, prop)
        return defaultSort(valueA, valueB)
      }
    }
  } as TableProps<RecordType>['columns'][number]
}
