import { PageHeader }                                           from 'antd'
import moment                                                   from 'moment'
import { useIntl, defineMessage, IntlShape, MessageDescriptor } from 'react-intl'

import { defaultSort, sortProp, useAnalyticsFilter }       from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, ConfigChange, cssStr } from '@acx-ui/components'
import { DateFormatEnum, formatter }                       from '@acx-ui/formatter'
import { noDataDisplay }                                   from '@acx-ui/utils'

import { useConfigChangeQuery } from '../services'

import { Block, Dot }                           from './styledComponents'
import { EntityType, enumTextMap, jsonMapping } from './util'

const configuredModeMapping = ($t: IntlShape['$t']) => [
  {
    key: 'ap',
    value: $t({ defaultMessage: 'AP' }),
    color: cssStr('--acx-viz-qualitative-4')
  },
  {
    key: 'apGroup',
    value: $t({ defaultMessage: 'AP Group' }),
    color: cssStr('--acx-viz-qualitative-3')
  },
  {
    key: 'wlan',
    value: $t({ defaultMessage: 'WLAN' }),
    color: cssStr('--acx-viz-qualitative-2')
  },
  {
    key: 'zone',
    value: $t({ defaultMessage: 'Venue' }),
    color: cssStr('--acx-viz-qualitative-1')
  }
] as { key: string, value: string, color: string }[]

export function ConfigChangeTable () {
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
      render: (value) => configuredModeMapping($t).map(type => {
        if (type.key !== value) {
          return
        } else {
          return <Block>
            <Dot color={type.color}/>
            {type.value}
          </Block>
        }
      }),
      filterable: configuredModeMapping($t),
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
    <div>
      <PageHeader title={$t({ defaultMessage: 'Configuration Change Listing' })}/>
      <Loader states={[queryResults]}>
        <Table
          settingsId='config-change-table'
          type='tall'
          columns={ColumnHeaders}
          dataSource={queryResults.data}
          rowSelection={{ type: 'radio', ...rowSelection }}
          tableAlertRender={false}
          forceShowHeader={true}
          rowKey={(config) => config.key + config.timestamp}
          showSorterTooltip={false}
          columnEmptyText={noDataDisplay}
        />
      </Loader>
    </div>
  )
}
