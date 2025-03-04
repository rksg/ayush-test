import React, { useContext, useEffect, useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Tooltip }                    from '@acx-ui/components'
import { OSIconContainer }                                       from '@acx-ui/rc/components'
import { useLazyGetClientsQuery, useSearchIdentityClientsQuery } from '@acx-ui/rc/services'
import {
  ClientInfo,
  dateSort,
  defaultSort,
  getOsTypeIcon,
  IdentityClient,
  sortProp,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { noDataDisplay } from '@acx-ui/utils'

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

function IdentityClientTable (props: { personaId?: string, personaGroupId?: string }) {
  const { $t } = useIntl()
  const { personaId, personaGroupId } = props

  const { setDeviceCount } = useContext(IdentityDetailsContext)
  const settingsId = 'identity-client-table'
  const [ datasource, setDatasource ] = useState<IdentityClient[]>([])
  const [ clientMacs, setClientMacs ] = useState<Set<string>>(new Set())
  const addClientMac = (mac: string) => setClientMacs(prev => new Set(prev.add(mac)))

  const [
    getClientList,
    { isLoading: isEsClientLoading, isFetching: isEsClientFetching }
  ] = useLazyGetClientsQuery()
  const tableQuery = useTableQuery<IdentityClient>({
    useQuery: useSearchIdentityClientsQuery,
    apiParams: { },
    defaultPayload: { identityIds: [personaId] },
    option: { skip: !personaId || !personaGroupId }
  })

  // ClientMac format should be: 11:22:33:44:55:66
  const toClientMacFormat = (macAddress: string) => {
    return macAddress.replaceAll('-', ':').toUpperCase()
  }

  // FIXME: need to remove 'true'
  useEffect(() => {
    setDatasource([{
      id: '1',
      tenantId: 'tenantId',
      groupId: personaGroupId,
      identityId: personaId,
      networkId: '2f35a5f920774c0ea2bdc91f447e0eec',
      clientMac: '80:a9:97:23:ff:47',
      deviceName: 'test',
      onboardType: 'DPSK'
    } as IdentityClient,
      {
        id: '2',
        tenantId: 'tenantId',
        groupId: personaGroupId,
        identityId: personaId,
        networkId: '2f35a5f920774c0ea2bdc91f447e0eec',
        clientMac: '80:a9:97:23:ff:11',
        deviceName: 'test',
        onboardType: 'DPSK'
      } as IdentityClient])
    addClientMac(toClientMacFormat('80:a9:97:23:ff:47'))
  }, [])

  useEffect(() => {
    if (tableQuery.data) {
      const macs = tableQuery.data.data.map((client) => toClientMacFormat(client.clientMac))
      setClientMacs(new Set(macs))
      setDatasource(tableQuery.data.data)
      setDeviceCount(clientMacs.size)
    }
  }, [tableQuery.data])

  useEffect(() => {
    if (clientMacs.size === 0) return

    const aggregateClientInfo = (
      identityClients: IdentityClient[],
      esClients: ClientInfo[]
    ) : IdentityClient[] => {
      const esClientMap = new Map<string, ClientInfo>()
      esClients.forEach(esClient =>
        esClientMap.set(toClientMacFormat(esClient.macAddress), esClient))

      return identityClients.map(identityClient => {
        const existingClient = esClientMap.get(toClientMacFormat(identityClient.clientMac))
        if (existingClient && existingClient.networkInformation.id === identityClient.networkId) {
          return {
            ...identityClient,
            os: existingClient.osType,
            username: existingClient.username,
            ip: existingClient.ipAddress,
            lastSeenAt: existingClient.lastUpdatedTime,
            apInformation: existingClient.apInformation,
            venueInformation: existingClient.venueInformation,
            networkInformation: existingClient.networkInformation,
            deviceName: existingClient.hostname
          }
        } else {
          return identityClient
        }
      })
    }

    getClientList({
      payload: {
        ...defaultClientPayload,
        filters: { macAddress: [...clientMacs] }
      }
    })
      .then(result => {
        if (!result.data?.data) return
        setDatasource(aggregateClientInfo(datasource, result.data.data))
      })
  }, [clientMacs])

  const columns: TableProps<IdentityClient>['columns'] = [
    {
      key: 'deviceName',
      dataIndex: 'deviceName',
      searchable: true,
      title: $t({ defaultMessage: 'Device Name' }),
      sorter: { compare: sortProp('deviceName', defaultSort) }
    },
    {
      key: 'os',
      dataIndex: 'os',
      align: 'center',
      title: $t({ defaultMessage: 'OS' }),
      render: (_, { os }) => {
        return <OSIconContainer>
          <Tooltip title={os}>
            { getOsTypeIcon(os as string) }
          </Tooltip>
        </OSIconContainer>
      },
      sorter: { compare: sortProp('os', defaultSort) }
    },
    {
      key: 'clientMac',
      dataIndex: 'clientMac',
      searchable: true,
      title: $t({ defaultMessage: 'MAC Address' }),
      sorter: { compare: sortProp('macAddress', defaultSort) },
      render: (_, row) => row.clientMac.replaceAll(':', '-').toUpperCase()
    },
    {
      key: 'ip',
      dataIndex: 'ip',
      searchable: true,
      align: 'center',
      title: $t({ defaultMessage: 'IP Address' }),
      sorter: { compare: sortProp('ip', defaultSort) },
      render: (_, row) => row.ip ?? noDataDisplay
    },
    {
      key: 'username',
      dataIndex: 'username',
      searchable: true,
      align: 'center',
      title: $t({ defaultMessage: 'Username' }),
      sorter: { compare: sortProp('username', defaultSort) },
      render: (_, row) => row.username ?? noDataDisplay
    },
    {
      key: 'venueInformation.id',
      dataIndex: ['venueInformation', 'name'],
      align: 'center',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      sorter: { compare: sortProp('venueInformation.name', defaultSort) },
      render: (_, { venueInformation }) => {
        const { id, name } = venueInformation ?? {}
        if (!id || !name) return name ?? id ?? noDataDisplay

        return <TenantLink to={`/venues/${id}/venue-details/overview`}>
          {name}
        </TenantLink>
      }
    },
    {
      key: 'apInformation.serialNumber',
      dataIndex: ['apInformation', 'name'],
      align: 'center',
      title: $t({ defaultMessage: 'AP' }),
      sorter: { compare: sortProp('ap', defaultSort) },
      render: (_, { apInformation }) => {
        const { serialNumber, name } = apInformation ?? {}
        if (!serialNumber || !name) return name ?? serialNumber ?? noDataDisplay

        return (
          <TenantLink to={`/devices/wifi/${serialNumber}/details/overview`}>
            {name}
          </TenantLink>
        )
      }
    },
    {
      key: 'onboardType',
      dataIndex: 'onboardType',
      searchable: true,
      align: 'center',
      title: $t({ defaultMessage: 'Onboarding Mechanism' }),
      sorter: { compare: sortProp('onboardType', defaultSort) }
    },
    {
      key: 'lastSeenAt',
      dataIndex: 'lastSeenAt',
      title: $t({ defaultMessage: 'Last Seen' }),
      render: (_, { lastSeenAt }) => {
        return lastSeenAt
          ? moment(lastSeenAt!).format('YYYY/MM/DD HH:mm A')
          : noDataDisplay
      },
      sorter: { compare: sortProp('lastSeenAt', dateSort) }
    }
  ]

  return <Loader
    states={[
      tableQuery,
      { isLoading: isEsClientLoading, isFetching: isEsClientFetching }
    ]}
  >
    <Table<IdentityClient>
      rowKey={'clientMac'}
      columns={columns}
      settingsId={settingsId}
      dataSource={datasource}
    />
  </Loader>
}

export default IdentityClientTable
