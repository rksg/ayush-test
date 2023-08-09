import { useMemo } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import { AnalyticsFilter }           from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table } from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { defaultSort, sortProp }     from '@acx-ui/rc/utils'
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
      render: (_, { firstConnection }) => formatter(DateFormatEnum.DateTimeFormat)(firstConnection),
      sorter: { compare: sortProp('firstConnection', defaultSort) }
    },
    {
      title: $t(defineMessage({ defaultMessage: 'End Time' })),
      dataIndex: 'disconnectTime',
      key: 'disconnectTime',
      render: (_, { disconnectTime }) => formatter(DateFormatEnum.DateTimeFormat)(disconnectTime),
      sorter: { compare: sortProp('disconnectTime', defaultSort) }
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Duration' })),
      dataIndex: 'sessionDuration',
      key: 'sessionDuration',
      render: (_, { sessionDuration }) => formatter('durationFormat')(sessionDuration),
      sorter: { compare: sortProp('sessionDurationInt', defaultSort) }
    },
    {
      title: $t(defineMessage({ defaultMessage: 'To Client' })),
      dataIndex: 'txBytes',
      key: 'txBytes',
      render: (_, { txBytes }) => formatter('bytesFormat')(txBytes),
      sorter: { compare: sortProp('txBytes', defaultSort) }
    },
    {
      title: $t(defineMessage({ defaultMessage: 'From Client' })),
      dataIndex: 'rxBytes',
      key: 'rxBytes',
      render: (_, { rxBytes }) => formatter('bytesFormat')(rxBytes),
      sorter: { compare: sortProp('rxBytes', defaultSort) }
    },
    {
      title: $t(defineMessage({ defaultMessage: 'AP Name' })),
      dataIndex: 'apName',
      key: 'apName',
      render: (_, row) => {
        // eslint-disable-next-line max-len
        return <TenantLink to={`/devices/wifi/${row.apSerial}/details/overview`}>{row.apName}</TenantLink>
      },
      sorter: { compare: sortProp('apName', defaultSort) },
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
