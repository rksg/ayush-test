import React, { useContext, useEffect, useState } from 'react'

import { SortOrder } from 'antd/lib/table/interface'
import { useIntl }   from 'react-intl'

import { Loader, Table, TableProps }                             from '@acx-ui/components'
import { defaultRbacClientPayload, useRbacClientTableColumns }   from '@acx-ui/rc/components'
import { useLazyGetClientsQuery, useSearchIdentityClientsQuery } from '@acx-ui/rc/services'
import {
  ClientInfo, defaultSort,
  IdentityClient, SORTER, sortProp,
  usePollingTableQuery
} from '@acx-ui/rc/utils'

import { IdentityDetailsContext } from './index'

const defaultClientPagination = {
  page: 1,
  pageSize: 10000
}

const onboardingTypesMapping: { [key: string]: string } = {
  'dpsk': 'DPSK',
  'OpenNetwork': 'Open Network',
  'mac-auth': 'Mac Auth',
  'AAANetwork': 'AAA Network',
  'PSKNetwork': 'PSK Network',
  'eap': 'EAP/TLS',
  'Hotspot20Network': 'Hotspot 2.0 Network',
  'GuestNetwork': 'Guest Network'
}

const getOnboardingTerm = (type?: string): string => {
  if (!type) return ''
  return onboardingTypesMapping[type] || type.toUpperCase()
}

function IdentityClientTable (props: { personaId?: string, personaGroupId?: string }) {
  const { $t } = useIntl()
  const { personaId, personaGroupId } = props

  const { setDeviceCount } = useContext(IdentityDetailsContext)
  const settingsId = 'identity-client-table'
  const [ datasource, setDatasource ] = useState<ClientInfo[]>([])
  const [ clientMacs, setClientMacs ] = useState<Set<string>>(new Set())
  const [ esSorter, setEsSorter ] = useState<SORTER>()
  // const addClientMac = (mac: string) => setClientMacs(prev => new Set(prev.add(mac)))

  const [
    getClientList,
    { isLoading: isEsClientLoading, isFetching: isEsClientFetching }
  ] = useLazyGetClientsQuery()
  const tableQuery = usePollingTableQuery<IdentityClient>({
    useQuery: useSearchIdentityClientsQuery,
    apiParams: { },
    pagination: { pageSize: 100 },  // Design intent: Only show 100 clients
    sorter: {
      sortField: 'updatedAt',
      sortOrder: 'DESC'
    },
    defaultPayload: { identityIds: [personaId] },
    option: { skip: !personaId || !personaGroupId }
  })

  // ClientMac format should be: 11:22:33:44:55:66
  const toClientMacFormat = (macAddress: string) => {
    return macAddress.replaceAll('-', ':').toLowerCase()
  }

  useEffect(() => {
    if (tableQuery.data) {
      const macs = tableQuery.data.data.map((client) => toClientMacFormat(client.clientMac))
      setClientMacs(new Set(macs))
      setDatasource(tableQuery.data.data as unknown as ClientInfo[])
      setDeviceCount(new Set(macs).size)
    }
  }, [tableQuery.data])

  useEffect(() => {
    if (tableQuery.isFetching) return
    if (clientMacs.size === 0) return

    const aggregateClientInfo = (
      identityClients: IdentityClient[],
      esClients: ClientInfo[]
    ) : ClientInfo[] => {
      const aggregatedClients: ClientInfo[] = []
      const identityClientMap = new Map<string, IdentityClient>()
      identityClients.forEach(identityClient =>
        identityClientMap.set(toClientMacFormat(identityClient.clientMac), identityClient))

      // ES data as major sorted data
      esClients.forEach(esClient => {
        const identityClient = identityClientMap.get(toClientMacFormat(esClient.macAddress))
        if (identityClient && identityClient.networkId === esClient.networkInformation.id) {
          identityClientMap.delete(toClientMacFormat(esClient.macAddress))
          aggregatedClients.push({
            ...identityClient,
            ...esClient
          } as ClientInfo)
        }
      })

      // Remaining data (disconnected)
      identityClientMap.forEach(identityClient => {
        aggregatedClients.push({
          ...identityClient,
          macAddress: identityClient.clientMac,
          signalStatus: { health: 'Default' } // disconnected icon
        } as unknown as ClientInfo)
      })

      return aggregatedClients
    }

    getClientList({
      payload: {
        ...defaultRbacClientPayload,
        ...defaultClientPagination,
        ...esSorter,
        filters: { macAddress: [...clientMacs] }  // should be lowered case
      }
    })
      .then(result => {
        if (!result.data?.data) return
        setDatasource(aggregateClientInfo(
          tableQuery.data?.data ?? [],
          result.data.data
        ))
      })
  }, [clientMacs, tableQuery.isFetching, esSorter])

  const useClientTableColumns = () => {
    return useRbacClientTableColumns(useIntl(), false).map(c => {
      if (c.key === 'macAddress') {
        return { ...c, searchable: true, filterable: false }
      } else if (c.key === 'hostname') {
        return {
          ...c,
          searchable: true,
          defaultSortOrder: 'descend' as SortOrder,
          filterable: false
        }
      } else {
        return { ...c, filterable: false }
      }
    })
  }

  const handleTableChange: TableProps<ClientInfo>['onChange'] = (
    _pagination, _filters, sorters
  ) => {
    const sorter = Array.isArray(sorters) ? sorters[0] : sorters

    if (!sorter.columnKey) return
    if (typeof sorter.columnKey === 'string' && sorter.columnKey === 'onboardType') {
      // `onBoardType` is the data from identity not ES, so it can not be sorted
      return
    }

    setEsSorter(
      {
        sortField: sorter.columnKey,
        sortOrder: sorter?.order === 'ascend' ? 'ASC' : 'DESC'
      } as SORTER)
  }

  return <Loader
    states={[
      tableQuery,
      { isLoading: isEsClientLoading, isFetching: isEsClientFetching }
    ]}
  >
    <Table<ClientInfo>
      rowKey={'clientMac'}
      columns={[
        ...useClientTableColumns(),
        {
          key: 'onboardType',
          dataIndex: 'onboardType',
          align: 'center',
          title: $t({ defaultMessage: 'Onboarding Mechanism' }),
          sorter: { compare: sortProp('onboardType', defaultSort) },
          render: (_, row) => getOnboardingTerm((row as unknown as IdentityClient).onboardType)
        }
      ]}
      settingsId={settingsId}
      dataSource={datasource}
      onChange={handleTableChange}
      pagination={{ pageSize: 10, defaultPageSize: 10 }}
    />
  </Loader>
}

export default IdentityClientTable
