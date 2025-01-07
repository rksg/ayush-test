import { useIntl } from 'react-intl'

import { Loader, Table, TableColumn, TableProps }                   from '@acx-ui/components'
import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { APStatus }                                                 from '@acx-ui/rc/components'
import { useLazyGetApNeighborsQuery, useLazyGetApRfNeighborsQuery } from '@acx-ui/rc/services'
import {
  ApRfNeighbor,
  SortResult,
  defaultSort,
  sortProp,
  useApContext
} from '@acx-ui/rc/utils'
import { WifiScopes }                  from '@acx-ui/types'
import { filterByAccess }              from '@acx-ui/user'
import { getIntl, CatchErrorResponse } from '@acx-ui/utils'

import { NewApNeighborTypes, defaultPagination } from './constants'
import { useApNeighbors }                        from './useApNeighbors'

import { apNeighborValueRender } from '.'

export default function ApRfNeighbors () {
  const { $t } = useIntl()
  const { serialNumber, venueId } = useApContext()
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const apNeighborQuery = isUseWifiRbacApi ?
    useLazyGetApNeighborsQuery :
    useLazyGetApRfNeighborsQuery
  const [ getApNeighbors, getApNeighborsStates ] = apNeighborQuery()
  // eslint-disable-next-line max-len
  const { doDetect, isDetecting, handleApiError } = useApNeighbors('rf', serialNumber!, socketHandler, venueId)

  const tableActions = [{
    scopeKey: [WifiScopes.UPDATE],
    label: $t({ defaultMessage: 'Detect' }),
    disabled: isDetecting,
    onClick: () => doDetect()
  }]

  async function socketHandler () {
    try {
      await getApNeighbors({
        params: { serialNumber, venueId },
        payload: {
          filters: [{ type: NewApNeighborTypes.RF_NEIGHBOR }],
          page: 1,
          pageSize: 10000
        }
      }).unwrap()
    } catch (error) {
      handleApiError(error as CatchErrorResponse)
    }
  }

  const isTableFetching = () => {
    return getApNeighborsStates.isFetching || isDetecting
  }

  return <Loader states={[{
    isLoading: getApNeighborsStates.isLoading,
    isFetching: isTableFetching()
  }]}>
    <Table
      settingsId='ap-rf-neighbors-table'
      rowKey='apMac'
      columns={getColumns()}
      dataSource={(getApNeighborsStates.data?.neighbors as ApRfNeighbor[]) ?? []}
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
      title: $t({ defaultMessage: 'AP Name' }),
      render: (data, row, index, highlightFn) => apNeighborValueRender(row.deviceName, highlightFn)
    },
    {
      key: 'apMac',
      dataIndex: 'apMac',
      title: $t({ defaultMessage: 'MAC Address' }),
      render: (data, row, index, highlightFn) => apNeighborValueRender(row.apMac, highlightFn)
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
      title: $t({ defaultMessage: 'Model' }),
      render: (data, row, index, highlightFn) => apNeighborValueRender(row.model, highlightFn)
    },
    {
      key: 'venueName',
      dataIndex: 'venueName',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      render: (data, row, index, highlightFn) => apNeighborValueRender(row.venueName, highlightFn)
    },
    {
      key: 'ip',
      dataIndex: 'ip',
      title: $t({ defaultMessage: 'IPv4 Address' }),
      render: (data, row, index, highlightFn) => apNeighborValueRender(row.ip, highlightFn)
    },
    {
      key: 'channel24G',
      dataIndex: 'channel24G',
      title: $t({ defaultMessage: 'Channel (2.4G)' }),
      sorter: { compare: sortProp('channel24G', compareChannelAndSnr) },
      render: (data, row, index, highlightFn) => apNeighborValueRender(row.channel24G, highlightFn)
    },
    {
      key: 'channel5G',
      dataIndex: 'channel5G',
      title: $t({ defaultMessage: 'Channel (5G)' }),
      sorter: { compare: sortProp('channel5G', compareChannelAndSnr) },
      render: (data, row, index, highlightFn) => apNeighborValueRender(row.channel5G, highlightFn)
    },
    {
      key: 'channel6G',
      dataIndex: 'channel6G',
      title: $t({ defaultMessage: 'Channel(6G/5G)' }),
      sorter: { compare: sortProp('channel5G', compareChannelAndSnr) },
      render: (data, row, index, highlightFn) => apNeighborValueRender(row.channel6G, highlightFn)
    },
    {
      key: 'snr24G',
      dataIndex: 'snr24G',
      title: $t({ defaultMessage: 'SNR (2.4G)' }),
      sorter: { compare: sortProp('snr24G', compareChannelAndSnr) },
      render: (data, row, index, highlightFn) => apNeighborValueRender(row.snr24G, highlightFn)
    },
    {
      key: 'snr5G',
      dataIndex: 'snr5G',
      title: $t({ defaultMessage: 'SNR (5G)' }),
      sorter: { compare: sortProp('snr5G', compareChannelAndSnr) },
      render: (data, row, index, highlightFn) => apNeighborValueRender(row.snr5G, highlightFn)
    },
    {
      key: 'snr6G',
      dataIndex: 'snr6G',
      title: $t({ defaultMessage: 'SNR (6G/5G)' }),
      sorter: { compare: sortProp('snr6G', compareChannelAndSnr) },
      render: (data, row, index, highlightFn) => apNeighborValueRender(row.snr6G, highlightFn)
    }
  ]

  columns.forEach(column => {
    column.sorter = column.sorter ?? { compare: sortProp(column.dataIndex as string, defaultSort) }
    column.searchable = true
  })

  return columns
}

export function compareChannelAndSnr (str1: string | null, str2: string | null): SortResult {
  const int1: number = str1 ? parseInt(str1, 10) : -1
  const int2: number = str2 ? parseInt(str2, 10) : -1

  if (int1 === int2) return 0

  return int1 > int2 ? 1 : -1
}
