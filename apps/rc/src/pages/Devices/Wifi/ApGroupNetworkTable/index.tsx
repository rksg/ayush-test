import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                                             from '@acx-ui/components'
import { transformApGroupRadios, transformApGroupVlan }                          from '@acx-ui/rc/components'
import { useApGroupNetworkListQuery }                                            from '@acx-ui/rc/services'
import { Network, NetworkExtended, NetworkType, NetworkTypeEnum, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                                            from '@acx-ui/react-router-dom'

const defaultPayload = {
  searchString: '',
  fields: [
    'check-all',
    'name',
    'description',
    'nwSubType',
    'clients',
    'vlan',
    'cog',
    'ssid',
    'vlanPool',
    'captiveType',
    'id',
    'isOweMaster',
    'owePairNetworkId',
    'dsaeOnboardNetwork'
  ],
  sortField: 'name',
  sortOrder: 'ASC'
}


const defaultArray: NetworkExtended[] = []

export interface ApGroupNetworksTableProps {
  venueId?: string
  apGroupId?: string
}

export default function ApGroupNetworksTable (props: ApGroupNetworksTableProps) {
  const { $t } = useIntl()
  const params = props

  const [tableData, setTableData] = useState(defaultArray)

  const tableQuery = useTableQuery({
    useQuery: useApGroupNetworkListQuery,
    apiParams: { venueId: props.venueId || '' },
    defaultPayload
  })

  const getCurrentVenue = (row: Network) => {
    if (!row.activated?.isActivated) {
      return
    }
    const deepNetworkVenues = row.deepNetwork?.venues || []
    return deepNetworkVenues.find(v => v.venueId === params.venueId)
  }

  useEffect(()=>{
    if (tableQuery.data) {
      const data: React.SetStateAction<NetworkExtended[]> = []
      // showing onboarded networks
      const _rows: string[]=[]

      tableQuery.data.data.forEach(item => {
        const activatedVenue = getCurrentVenue(item)
        if (item?.children) {
          _rows.push(item.id)
        }

        data.push({
          ...item,
          deepVenue: activatedVenue
        })
      })

      setTableData(data)
    }
  }, [tableQuery.data])


  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        const redirectUrl = `/networks/wireless/${row.id}/network-details/overview`
        return (!!row?.isOnBoarded ? <span>{row.name}</span>
          : <TenantLink to={redirectUrl}>{row.name}</TenantLink>
        )
      }
    }, {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    }, {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    }, {
      key: 'venues',
      title: $t({ defaultMessage: 'Scope' }),
      dataIndex: 'venues',
      render: function (_, row) {
        const currentVenue = getCurrentVenue(row)
        return currentVenue?.isAllApGroups?
          $t({ defaultMessage: 'Venue' }) : $t({ defaultMessage: 'AP Group' })
      }
    }, {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      render: function (_, row) {
        return transformApGroupVlan(getCurrentVenue(row), row.deepNetwork, params.apGroupId)
      }
    }, {
      key: 'radios',
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: 140,
      render: function (_, row) {
        return transformApGroupRadios(getCurrentVenue(row), row.deepNetwork, params.apGroupId)
      }
    }, {

      key: 'clients',
      title: $t({ defaultMessage: 'Connected Clients' }),
      dataIndex: 'clients',
      sorter: false, // API does not seem to be working
      align: 'center',
      render: (_, row) => {
        return row.clients || 0
      }
    }
  ]


  return (
    <Loader states={[ tableQuery ]}>
      <Table
        settingsId='apgroup-network-table'
        columns={columns}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        rowKey='id'
      />
    </Loader>
  )
}