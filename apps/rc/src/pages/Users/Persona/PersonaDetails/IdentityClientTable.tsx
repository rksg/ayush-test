import React, { useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table }                                         from '@acx-ui/components'
import { useRbacClientTableColumns }                             from '@acx-ui/rc/components'
import { useLazyGetClientsQuery, useSearchIdentityClientsQuery } from '@acx-ui/rc/services'
import {
  ClientInfo,
  IdentityClient,
  useTableQuery
} from '@acx-ui/rc/utils'

import { IdentityDetailsContext } from './index'

const defaultClientPayload = {
  searchString: '',
  searchTargetFields: ['macAddress', 'ipAddress', 'username', 'hostname', 'osType'],
  fields: ['macAddress','ipAddress','username', 'hostname','osType',
    'venueInformation', 'apInformation',
    'lastUpdatedTime', 'networkInformation'],
  page: 1,
  pageSize: 10000
}

const onboardingTypesMapping: { [key: string]: string } = {
  'dpsk': 'DPSK',
  'OpenNetwork': 'Open Network',
  'mac-auth': 'Mac Auth',
  'AAANetwork': 'AAA Network',
  'PSKNetwork': 'PSK Network',
  'eap': 'EAP/TLS'
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
  // const addClientMac = (mac: string) => setClientMacs(prev => new Set(prev.add(mac)))

  const [
    getClientList,
    { isLoading: isEsClientLoading, isFetching: isEsClientFetching }
  ] = useLazyGetClientsQuery()
  const tableQuery = useTableQuery<IdentityClient>({
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
    if (clientMacs.size === 0) return

    const aggregateClientInfo = (
      identityClients: IdentityClient[],
      esClients: ClientInfo[]
    ) : ClientInfo[] => {
      const esClientMap = new Map<string, ClientInfo>()
      esClients.forEach(esClient =>
        esClientMap.set(toClientMacFormat(esClient.macAddress), esClient))

      return identityClients.map(identityClient => {
        const existingClient = esClientMap.get(toClientMacFormat(identityClient.clientMac))
        if (existingClient && existingClient.networkInformation.id === identityClient.networkId) {
          return {
            ...identityClient,
            ...existingClient
          } as ClientInfo
        } else {
          return {
            ...identityClient,
            macAddress: identityClient.clientMac,
            signalStatus: { health: 'Default' } // disconnected icon
          } as unknown as ClientInfo
        }
      })
    }

    getClientList({
      payload: {
        ...defaultClientPayload,
        filters: { macAddress: [...clientMacs] }  // should be lowered case
      }
    })
      .then(result => {
        if (!result.data?.data) return
        setDatasource(aggregateClientInfo(
          datasource as unknown as IdentityClient[],
          result.data.data
        ))
      })
  }, [clientMacs])

  return <Loader
    states={[
      tableQuery,
      { isLoading: isEsClientLoading, isFetching: isEsClientFetching }
    ]}
  >
    <Table<ClientInfo>
      rowKey={'clientMac'}
      columns={useRbacClientTableColumns(useIntl(), false)
        .map(col =>
          col.key === 'hostname' ? { ...col, defaultSortOrder: 'descend' } : col
        )}
      settingsId={settingsId}
      dataSource={datasource}
      pagination={{ pageSize: 10, defaultPageSize: 10 }}
    />
  </Loader>
}

export default IdentityClientTable
