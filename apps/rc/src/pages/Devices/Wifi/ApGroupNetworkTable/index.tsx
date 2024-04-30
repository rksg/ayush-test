/* eslint-disable max-len */
import { ReactNode, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                    from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { transformApGroupRadios, transformApGroupVlan } from '@acx-ui/rc/components'
import {
  useApGroupNetworkListQuery,
  useApGroupNetworkListV2Query,
  useGetVLANPoolPolicyViewModelListQuery
} from '@acx-ui/rc/services'
import {
  KeyValue,
  Network,
  NetworkExtended,
  NetworkType,
  NetworkTypeEnum,
  VLANPoolViewModelType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

export const defaultApGroupNetworkPayload = {
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
    'dsaeOnboardNetwork',
    'isAllApGroups'
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
  const isUseWifiApiV2 = useIsSplitOn(Features.WIFI_API_V2_TOGGLE)
  const { venueId, apGroupId } = props
  const { tenantId } = useParams()

  const [tableData, setTableData] = useState(defaultArray)

  const settingsId = 'apgroup-network-table'
  const tableQuery = useTableQuery({
    useQuery: isUseWifiApiV2? useApGroupNetworkListV2Query : useApGroupNetworkListQuery,
    apiParams: { venueId: venueId || '' },
    defaultPayload: defaultApGroupNetworkPayload,
    pagination: { settingsId }
  })

  const { vlanPoolingNameMap }: { vlanPoolingNameMap: KeyValue<string, string>[] } = useGetVLANPoolPolicyViewModelListQuery({
    params: { tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10000
    }
  }, {
    skip: !tableData.length,
    selectFromResult: ({ data }: { data?: { data: VLANPoolViewModelType[] } }) => ({
      vlanPoolingNameMap: data?.data
        ? data.data.map(vlanPool => ({ key: vlanPool.id!, value: vlanPool.name }))
        : [] as KeyValue<string, string>[]
    })
  })

  useEffect(()=>{
    if (tableQuery.data) {
      const data: React.SetStateAction<NetworkExtended[]> = []
      // showing onboarded networks
      const _rows: string[]=[]

      tableQuery.data.data.forEach(item => {
        const activatedVenue = getCurrentVenue(item, venueId!)
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


  const columns = useApGroupNetworkColumns(apGroupId!, venueId!, vlanPoolingNameMap)

  return (
    <Loader states={[ tableQuery ]}>
      <Table
        rowKey='id'
        settingsId={settingsId}
        columns={columns}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
  )
}

export const getCurrentVenue = (row: Network, venueId: string) => {
  if (!row.activated?.isActivated) {
    return
  }
  const deepNetworkVenues = row.deepNetwork?.venues || []
  return deepNetworkVenues.find(v => v.venueId === venueId)
}

export function useApGroupNetworkColumns (
  apGroupId: string, venueId: string,
  vlanPoolingNameMap?: KeyValue<string, string>[],
  isEditable?: boolean
) {

  const { $t } = useIntl()

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: !isEditable,
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
      sorter: !isEditable
    }, {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: !isEditable,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    },
    ...(isEditable? [] : [{
      key: 'venues',
      title: $t({ defaultMessage: 'Scope' }),
      dataIndex: 'venues',
      render: function (_: ReactNode, row: Network) {
        const currentVenue = getCurrentVenue(row, venueId)
        return currentVenue?.isAllApGroups?
          $t({ defaultMessage: 'Venue' }) : $t({ defaultMessage: 'AP Group' })
      }
    }]), {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      render: function (_, row) {
        return transformApGroupVlan(getCurrentVenue(row, venueId), row.deepNetwork, apGroupId, vlanPoolingNameMap)
      }
    }, {
      key: 'radios',
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: 140,
      render: function (_, row) {
        return transformApGroupRadios(getCurrentVenue(row, venueId), row.deepNetwork, apGroupId)
      }
    },
    ...(isEditable? [] : [{
      key: 'clients',
      title: $t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      sorter: false,
      align: 'center' as 'center',
      render: (_: ReactNode, row: Network) => {
        return row.clients || 0
      }
    }])
  ]

  return columns
}
