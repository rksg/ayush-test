import { useIntl } from 'react-intl'

import { Loader, Table, TableColumn, TableProps } from '@acx-ui/components'
import { APStatus }                               from '@acx-ui/rc/components'
import { useLazyGetApRfNeighborsQuery }           from '@acx-ui/rc/services'
import {
  ApRfNeighbor,
  CatchErrorResponse,
  SortResult,
  defaultSort,
  sortProp,
  useApContext
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'
import { getIntl }        from '@acx-ui/utils'

import { defaultPagination }           from './constants'
import { handleError, useApNeighbors } from './useApNeighbors'

export default function ApRfNeighbors () {
  const { $t } = useIntl()
  const { serialNumber } = useApContext()
  const [ getApRfNeighbors, getApRfNeighborsStates ] = useLazyGetApRfNeighborsQuery()
  const { doDetect, isDetecting } = useApNeighbors('rf', serialNumber!, socketHandler)

  const tableActions = [{
    label: $t({ defaultMessage: 'Detect' }),
    disabled: isDetecting,
    onClick: doDetect
  }]

  function socketHandler () {
    try {
      getApRfNeighbors({ params: { serialNumber } }).unwrap()
    } catch (error) {
      handleError(error as CatchErrorResponse)
    }
  }

  const isTableFetching = () => {
    return getApRfNeighborsStates.isFetching || isDetecting
  }

  return <Loader states={[{
    isLoading: getApRfNeighborsStates.isLoading,
    isFetching: isTableFetching()
  }]}>
    <Table
      settingsId='ap-rf-neighbors-table'
      rowKey='apMac'
      columns={getColumns()}
      dataSource={getApRfNeighborsStates.data?.neighbors ?? []}
      pagination={defaultPagination}
      actions={filterByAccess(tableActions)}
    />
  </Loader>
}

function getColumns (): TableProps<ApRfNeighbor>['columns'] {
  const { $t } = getIntl()

  const columns: TableColumn<ApRfNeighbor, 'text'>[] = [
    {
      key: 'deviceName',
      dataIndex: 'deviceName',
      title: $t({ defaultMessage: 'AP Name' })
    },
    {
      key: 'apMac',
      dataIndex: 'apMac',
      title: $t({ defaultMessage: 'MAC Address' })
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: $t({ defaultMessage: 'Status' }),
      render: (_, row) => <APStatus status={row.status} />
    },
    {
      key: 'model',
      dataIndex: 'model',
      title: $t({ defaultMessage: 'Model' })
    },
    {
      key: 'venueName',
      dataIndex: 'venueName',
      title: $t({ defaultMessage: 'Venue' })
    },
    {
      key: 'ip',
      dataIndex: 'ip',
      title: $t({ defaultMessage: 'IPv4 Address' })
    },
    {
      key: 'channel24G',
      dataIndex: 'channel24G',
      title: $t({ defaultMessage: 'Channel (2.4G)' }),
      sorter: { compare: sortProp('channel24G', compareChannelAndSnr) }
    },
    {
      key: 'channel5G',
      dataIndex: 'channel5G',
      title: $t({ defaultMessage: 'Channel (5G)' }),
      sorter: { compare: sortProp('channel5G', compareChannelAndSnr) }
    },
    {
      key: 'channel6G',
      dataIndex: 'channel6G',
      title: $t({ defaultMessage: 'Channel(6G/5G)' }),
      sorter: { compare: sortProp('channel5G', compareChannelAndSnr) }
    },
    {
      key: 'snr24G',
      dataIndex: 'snr24G',
      title: $t({ defaultMessage: 'SNR (2.4G)' }),
      sorter: { compare: sortProp('snr24G', compareChannelAndSnr) }
    },
    {
      key: 'snr5G',
      dataIndex: 'snr5G',
      title: $t({ defaultMessage: 'SNR (5G)' }),
      sorter: { compare: sortProp('snr5G', compareChannelAndSnr) }
    },
    {
      key: 'snr6G',
      dataIndex: 'snr6G',
      title: $t({ defaultMessage: 'SNR (6G/5G)' }),
      sorter: { compare: sortProp('snr6G', compareChannelAndSnr) }
    }
  ]

  columns.forEach(column => {
    column.sorter = column.sorter ?? { compare: sortProp(column.dataIndex as string, defaultSort) }
    column.searchable = true
    column.render = column.render ?? emtpyRenderer
  })

  return columns
}

export function emtpyRenderer (value?: React.ReactNode): React.ReactNode | string {
  const { $t } = getIntl()
  return value ? value : $t({ defaultMessage: 'N/A' })
}

export function compareChannelAndSnr (str1: string | null, str2: string | null): SortResult {
  const int1: number = str1 ? parseInt(str1, 10) : -1
  const int2: number = str2 ? parseInt(str2, 10) : -1

  if (int1 === int2) return 0

  return int1 > int2 ? 1 : -1
}
