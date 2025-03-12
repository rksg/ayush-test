
import { stringify }         from 'csv-stringify/browser/esm/sync'
import moment                from 'moment'
import { MessageDescriptor } from 'react-intl'

import {
  TableProps,
  ConfigChange,
  type ConfigChangeChartRowMappingType
}                                                      from '@acx-ui/components'
import { getIntl, handleBlobDownloadFile, PathFilter } from '@acx-ui/utils'

import { getConfiguration, getEntityValue } from '../PagedTable/util'

export function handleConfigChangeDownload (
  configChanges: ConfigChange[],
  columns: TableProps<ConfigChange>['columns'],
  entityTypeMapping: ConfigChangeChartRowMappingType[],
  { startDate, endDate }: PathFilter
) {
  const { $t } = getIntl()
  const data = stringify(
    configChanges.map(item => {
      const configValue = getConfiguration(item.type, item.key)

      const oldValues = item.oldValues?.map(value => {
        const mapped = getEntityValue(item.type, item.key, value)
        return (typeof mapped === 'string')
          ? mapped : $t(mapped as MessageDescriptor)
      })

      const newValues = item.newValues?.map(value => {
        const mapped = getEntityValue(item.type, item.key, value)
        return (typeof mapped === 'string')
          ? mapped : $t(mapped as MessageDescriptor)
      })
      return ({
        timestamp: moment(Number(item.timestamp)).format(),
        type: entityTypeMapping.find(type => type.key === item.type)!.label,
        name: item.name,
        key: (typeof configValue === 'string')
          ? configValue
          : $t(configValue as MessageDescriptor),
        oldValues: oldValues.join(', '),
        newValues: newValues.join(', ')
      })
    }),
    {
      header: true,
      quoted: true,
      cast: {
        string: s => s === '--' ? '-' : s
      },
      columns: columns.map(({ key, title }) => ({
        key: key,
        header: title as string
      }))
    }
  )
  handleBlobDownloadFile(
    new Blob([data], { type: 'text/csv;charset=utf-8;' }),
    `Config-Changes-${startDate}-${endDate}.csv`
  )
}
