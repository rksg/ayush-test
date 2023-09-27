
import { useIntl } from 'react-intl'

import { AP, useApListQuery }                              from '@acx-ui/analytics/services'
import { defaultSort, sortProp ,formattedPath }            from '@acx-ui/analytics/utils'
import { Table, TableProps, Tooltip,useDateRange, Loader } from '@acx-ui/components'
import { TenantLink }                                      from '@acx-ui/react-router-dom'

import {  Ul, Chevron, Li } from './styledComponents'
export  function APList () {
  const { $t } = useIntl()

  const { timeRange } = useDateRange()
  const pagination = { pageSize: 10, defaultPageSize: 10 }

  const results = useApListQuery({
    start: timeRange[0].format(),
    end: timeRange[1].format(),
    limit: 100,
    metric: 'traffic'
  })

  const apTablecolumnHeaders: TableProps<AP>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'apName',
      key: 'apName',
      width: 130,
      sorter: { compare: sortProp('apName', defaultSort) },
      render: (_, row : AP) => (
        <TenantLink to={`/wifi/${row.macAddress}/details/reports`}>
          {row.apName}</TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      key: 'mac',
      width: 130,
      sorter: { compare: sortProp('macAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'AP Model' }),
      dataIndex: 'apModel',
      key: 'apModel',
      width: 80,
      sorter: { compare: sortProp('apModel', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 100,

      sorter: { compare: sortProp('ipAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Version' }),
      width: 90,
      dataIndex: 'version',
      key: 'version',

      sorter: { compare: sortProp('version', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Network' }),
      width: 450,
      dataIndex: 'networkPath',
      key: 'networkPath',
      render: (_, value ) => {
        const networkPath = value.networkPath.slice(0, -1)
        return <Tooltip placement='left' title={formattedPath(networkPath, 'Name')}>
          <Ul>
            {networkPath.map(({ name }, index) => [
              index !== 0 && <Chevron key={`ap-chevron-${index}`}>{'>'}</Chevron>,
              <Li key={`ap-li-${index}`}>{name}</Li>
            ])}
          </Ul>
        </Tooltip>
      },
      sorter: { compare: sortProp('networkPath', defaultSort) }
    }
  ]

  return <Loader states={[results]}>
    <Table<AP>
      columns={apTablecolumnHeaders}
      dataSource={results.data?.aps as unknown as AP[]}
      pagination={pagination}
      settingsId='ap-search-table'
    />
  </Loader>
}
