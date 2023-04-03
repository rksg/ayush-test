import { useMemo } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import { AnalyticsFilter }           from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table } from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { TenantLink, useParams }     from '@acx-ui/react-router-dom'
import { useDateFilter }             from '@acx-ui/utils'

import {
  Session,
  useSessionListQuery
} from './services'

export function SessionTable () {
  const intl = useIntl()
  const { clientId } = useParams()
  const { $t } = intl
  const { dateFilter } = useDateFilter()
  const filters = {
    ...dateFilter,
    mac: clientId?.toUpperCase()
  } as AnalyticsFilter
  const queryResults = useSessionListQuery(filters)

  const data = queryResults.data

  const ColumnHeaders: TableProps<Session>['columns'] = useMemo(() => [
    {
      title: $t(defineMessage({ defaultMessage: 'Start Time' })),
      dataIndex: 'firstConnection',
      key: 'firstConnection',
      render: (data) => formatter(DateFormatEnum.DateTimeFormat)(data),
      sorter: false
    },
    {
      title: $t(defineMessage({ defaultMessage: 'End Time' })),
      dataIndex: 'disconnectTime',
      key: 'disconnectTime',
      render: (data) => formatter(DateFormatEnum.DateTimeFormat)(data),
      sorter: false
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Duration' })),
      dataIndex: 'sessionDuration',
      key: 'sessionDuration',
      render: (data) => formatter('durationFormat')(data),
      sorter: false
    },
    {
      title: $t(defineMessage({ defaultMessage: 'To Client' })),
      dataIndex: 'txBytes',
      key: 'txBytes',
      render: (data) => formatter('bytesFormat')(data),
      sorter: false
    },
    {
      title: $t(defineMessage({ defaultMessage: 'From Client' })),
      dataIndex: 'rxBytes',
      key: 'rxBytes',
      render: (data) => formatter('bytesFormat')(data),
      sorter: false
    },
    {
      title: $t(defineMessage({ defaultMessage: 'AP Name' })),
      dataIndex: 'apName',
      key: 'apName',
      render: (data, row) => {
        // eslint-disable-next-line max-len
        return <TenantLink to={`/devices/wifi/${row.apSerial}/details/overview`}>{data}</TenantLink>
      },
      sorter: false,
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'AP Mac' })),
      dataIndex: 'apMac',
      key: 'apMac',
      sorter: false,
      show: false,
      searchable: true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []) // '$t' are not changing

  return (
    <Loader states={[queryResults]}>
      <Table
        dataSource={data}
        columns={ColumnHeaders}
        rowKey={(record)=> record.firstConnection + record.disconnectTime}
      />
    </Loader>
  )
}
