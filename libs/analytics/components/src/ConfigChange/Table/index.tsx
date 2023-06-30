import moment                                        from 'moment'
import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'

import { defaultSort, sortProp, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Loader,
  TableProps,
  Table as CommonTable,
  ConfigChange,
  getConfigChangeEntityTypeMapping
}                                                    from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { noDataDisplay }             from '@acx-ui/utils'

import { useConfigChangeQuery } from '../services'

import { Block, Dot }                           from './styledComponents'
import { EntityType, enumTextMap, jsonMapping } from './util'

export function Table () {
  const { $t } = useIntl()
  const { filters: { path, startDate, endDate } } = useAnalyticsFilter()
  const queryResults = useConfigChangeQuery({ path, start: startDate, end: endDate })

  const ColumnHeaders: TableProps<ConfigChange>['columns'] = [
    {
      key: 'timestamp',
      title: $t(defineMessage({ defaultMessage: 'Timestamp' })),
      dataIndex: 'timestamp',
      render: (value) => formatter(DateFormatEnum.DateTimeFormat)(
        moment(Number(value)).format('YYYY-MM-DD[T]HH:mm:ss[Z]')),
      sorter: { compare: sortProp('timestamp', defaultSort) },
      width: 130
    },
    {
      key: 'type',
      title: $t(defineMessage({ defaultMessage: 'Entity Type' })),
      dataIndex: 'type',
      render: (value) => getConfigChangeEntityTypeMapping().map(type => {
        return type.key === value &&
          <Block>
            <Dot color={type.color}/>
            {type.label}
          </Block>
      }),
      filterable: getConfigChangeEntityTypeMapping()
        .map(({ label, ...rest }) => ({ ...rest, value: label })),
      sorter: { compare: sortProp('type', defaultSort) },
      width: 100
    },
    {
      key: 'name',
      title: $t(defineMessage({ defaultMessage: 'Entity Name' })),
      dataIndex: 'name',
      render: (value, row, _, highlightFn) => highlightFn(String(value)),
      searchable: true,
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      key: 'key',
      title: $t(defineMessage({ defaultMessage: 'Configuration' })),
      dataIndex: 'key',
      render: (_, { type, key }) => jsonMapping[type as EntityType].configMap.get(key)
        ? $t(jsonMapping[type as EntityType].configMap.get(key) as MessageDescriptor)
        : key,
      sorter: { compare: sortProp('key', defaultSort) }
    },
    {
      key: 'oldValues',
      title: $t(defineMessage({ defaultMessage: 'Change From' })),
      dataIndex: ['oldValues'],
      align: 'center',
      ellipsis: true,
      render: (_, { oldValues, type, key }) => {
        const generateValues = oldValues?.map(value => (enumTextMap.get(
          `${(jsonMapping[type as EntityType].enumMap).get(key, '')}-${value}`))
          ? $t(enumTextMap.get(`${jsonMapping[type as EntityType]
            .enumMap.get(key, '')}-${value}`) as MessageDescriptor)
          : value)
        return generateValues.join(', ')
      },
      sorter: { compare: sortProp('oldValues', defaultSort) }
    },
    {
      key: 'newValues',
      title: $t(defineMessage({ defaultMessage: 'Change To' })),
      dataIndex: ['newValues'],
      align: 'center',
      ellipsis: true,
      render: (_, { newValues, type, key }) => {
        const generateValues = newValues?.map(value => (enumTextMap.get(
          `${(jsonMapping[type as EntityType].enumMap).get(key, '')}-${value}`))
          ? $t(enumTextMap.get(`${jsonMapping[type as EntityType]
            .enumMap.get(key, '')}-${value}`) as MessageDescriptor)
          : value)
        return generateValues.join(', ')
      },
      sorter: { compare: sortProp('newValues', defaultSort) }
    }
  ]

  const rowSelection = {
    // TODO: need to handle sync betweem chart and table
    onChange: (selectedRowKeys: React.Key[], selectedRows: ConfigChange[]) => {
      // eslint-disable-next-line no-console
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
    }
  }

  return (
    <Loader states={[queryResults]}>
      <CommonTable
        settingsId='config-change-table'
        columns={ColumnHeaders}
        dataSource={queryResults.data}
        rowSelection={{ type: 'radio', ...rowSelection }}
        tableAlertRender={false}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataDisplay}
      />
    </Loader>
  )
}
