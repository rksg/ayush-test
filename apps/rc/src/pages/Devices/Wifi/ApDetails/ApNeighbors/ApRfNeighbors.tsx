import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                              from '@acx-ui/components'
import { APStatus }                                               from '@acx-ui/rc/components'
import { useGetApRfNeighborsQuery, useDetectApNeighborsMutation } from '@acx-ui/rc/services'
import {
  ApRfNeighbor,
  SortResult,
  defaultSort,
  getPokeSocket,
  sortProp,
  useApContext
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'
import { getIntl }        from '@acx-ui/utils'

let pokeSocket: SocketIOClient.Socket

export function ApRfNeighbors () {
  const { $t } = useIntl()
  const { serialNumber } = useApContext()
  const tableQuery = useGetApRfNeighborsQuery({ params: { serialNumber } })
  const [ detectApNeighbors ] = useDetectApNeighborsMutation()
  const [ requestId, setRequestId ] = useState('')

  useEffect(() => {
    if (!requestId) return

    if (pokeSocket) pokeSocket.close()

    pokeSocket = getPokeSocket(requestId)
    pokeSocket.on('pokeEvent', (message: string) => {
      console.log(message)
    })

    return () => {
      if (pokeSocket) pokeSocket.close()
    }
  }, [requestId])

  const doDetect = async () => {
    try {
      const result = await detectApNeighbors({
        params: { serialNumber },
        payload: { action: 'DETECT_RF_NEIGHBOR' }
      }).unwrap()

      setRequestId(result.requestId)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const tableActions = [{
    label: $t({ defaultMessage: 'Detect' }),
    onClick: doDetect
  }]

  return <Loader states={[tableQuery]}>
    <Table
      settingsId='ap-rf-neighbors-table'
      rowKey='apMac'
      columns={getColumns()}
      dataSource={tableQuery.data?.neighbors ?? []}
      actions={filterByAccess(tableActions)}
    />
  </Loader>
}

function getColumns (): TableProps<ApRfNeighbor>['columns'] {
  const { $t } = getIntl()

  return [
    {
      key: 'deviceName',
      dataIndex: 'deviceName',
      title: $t({ defaultMessage: 'AP Name' }),
      sorter: { compare: sortProp('deviceName', defaultSort) },
      searchable: true
    },
    {
      key: 'apMac',
      dataIndex: 'apMac',
      title: $t({ defaultMessage: 'MAC Address' }),
      sorter: { compare: sortProp('apMac', defaultSort) },
      searchable: true
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: $t({ defaultMessage: 'Status' }),
      sorter: { compare: sortProp('status', defaultSort) },
      render: (_, row) => <APStatus status={row.status} />,
      searchable: true
    },
    {
      key: 'model',
      dataIndex: 'model',
      title: $t({ defaultMessage: 'Model' }),
      sorter: { compare: sortProp('model', defaultSort) },
      searchable: true
    },
    {
      key: 'venueName',
      dataIndex: 'venueName',
      title: $t({ defaultMessage: 'Venue' }),
      sorter: { compare: sortProp('venueName', defaultSort) },
      searchable: true
    },
    {
      key: 'ip',
      dataIndex: 'ip',
      title: $t({ defaultMessage: 'IPv4 Address' }),
      sorter: { compare: sortProp('ip', defaultSort) },
      searchable: true
    },
    {
      key: 'channel24G',
      dataIndex: 'channel24G',
      title: $t({ defaultMessage: 'Channel (2.4G)' }),
      sorter: { compare: sortProp('channel24G', compareNumberStrings) },
      searchable: true,
      render: emtpyRenderer
    },
    {
      key: 'channel5G',
      dataIndex: 'channel5G',
      title: $t({ defaultMessage: 'Channel (5G)' }),
      sorter: { compare: sortProp('channel5G', compareNumberStrings) },
      searchable: true,
      render: emtpyRenderer
    },
    {
      key: 'snr24G',
      dataIndex: 'snr24G',
      title: $t({ defaultMessage: 'SNR (2.4G)' }),
      sorter: { compare: sortProp('snr24G', compareNumberStrings) },
      searchable: true,
      render: emtpyRenderer
    },
    {
      key: 'snr5G',
      dataIndex: 'snr5G',
      title: $t({ defaultMessage: 'SNR (5G)' }),
      sorter: { compare: sortProp('snr5G', compareNumberStrings) },
      searchable: true,
      render: emtpyRenderer
    },
    {
      key: 'snr6G',
      dataIndex: 'snr6G',
      title: $t({ defaultMessage: 'SNR (6G/5G)' }),
      sorter: { compare: sortProp('snr6G', compareNumberStrings) },
      searchable: true,
      render: emtpyRenderer
    }
  ]
}

function emtpyRenderer (value?: React.ReactNode): React.ReactNode | string {
  const { $t } = getIntl()
  return value ? value : $t({ defaultMessage: 'N/A' })
}

function compareNumberStrings (str1: string | null, str2: string | null): SortResult {
  const int1: number = str1 ? parseInt(str1, 10) : -1
  const int2: number = str2 ? parseInt(str2, 10) : -1

  if (int1 === int2) return 0

  return int1 > int2 ? 1 : -1
}
