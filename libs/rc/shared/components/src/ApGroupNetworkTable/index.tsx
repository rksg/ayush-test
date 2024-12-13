/* eslint-disable max-len */
import { ReactNode, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  useApGroupNetworkListV2Query,
  useNewApGroupNetworkListQuery,
  useNewApGroupNetworkListV2Query
} from '@acx-ui/rc/services'
import {
  KeyValue,
  Network,
  NetworkExtended,
  NetworkType,
  NetworkTypeEnum,
  useTableQuery,
  useConfigTemplate,
  ConfigTemplateType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { useGetVLANPoolPolicyInstance }                 from '../ApGroupEdit/ApGroupVlanRadioTab'
import { renderConfigTemplateDetailsComponent }         from '../configTemplates'
import { transformApGroupRadios, transformApGroupVlan } from '../pipes/apGroupPipes'

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

export const defaultNewApGroupNetworkPayload = {
  searchString: '',
  fields: [
    'check-all',
    'name',
    'description',
    'nwSubType',
    'clientCount',
    'vlan',
    'cog',
    'ssid',
    'vlanPool',
    'captiveType',
    'id',
    'isOweMaster',
    'owePairNetworkId',
    'dsaeOnboardNetwork',
    'venueApGroups.isAllApGroups',
    'venueApGroups.venueId',
    'venueApGroups.apGroupIds'
  ],
  sortField: 'name',
  sortOrder: 'ASC'
}

const defaultArray: NetworkExtended[] = []

export interface ApGroupNetworksTableProps {
  venueId?: string
  apGroupId?: string
}

export function ApGroupNetworksTable (props: ApGroupNetworksTableProps) {
  const { venueId, apGroupId } = props

  const [tableData, setTableData] = useState(defaultArray)

  const settingsId = 'apgroup-network-table'

  const tableQuery = useApGroupNetworkList({ settingsId, ...props })

  const { vlanPoolingNameMap }: { vlanPoolingNameMap: KeyValue<string, string>[] } = useGetVLANPoolPolicyInstance(!tableData.length)

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
          deepVenue: activatedVenue // seems not using now?
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

const useApGroupNetworkList = (props: { settingsId: string, venueId?: string
  apGroupId?: string } ) => {
  const { settingsId, venueId, apGroupId } = props
  const { isTemplate } = useConfigTemplate()

  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isUseNewRbacNetworkVenueApi = useIsSplitOn(Features.WIFI_NETWORK_VENUE_QUERY)
  const isTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isTemplateRbacEnabled : isWifiRbacEnabled

  const nonRbacTableQuery = useTableQuery({
    useQuery: useApGroupNetworkListV2Query,
    apiParams: { venueId: venueId || '' },
    defaultPayload: {
      ...defaultApGroupNetworkPayload,
      isTemplate: isTemplate
    },
    pagination: { settingsId },
    option: { skip: resolvedRbacEnabled }
  })

  const rbacTableQuery = useTableQuery({
    useQuery: isUseNewRbacNetworkVenueApi ? useNewApGroupNetworkListV2Query : useNewApGroupNetworkListQuery,
    apiParams: { venueId: venueId! },
    defaultPayload: {
      ...defaultNewApGroupNetworkPayload,
      filters: {
        'venueApGroups.apGroupIds': [apGroupId]
      },
      isTemplate: isTemplate,
      isTemplateRbacEnabled
    },
    pagination: { settingsId },
    option: { skip: !resolvedRbacEnabled || !venueId || !apGroupId }
  })

  return resolvedRbacEnabled ? rbacTableQuery : nonRbacTableQuery
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
  const { isTemplate } = useConfigTemplate()

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: !isEditable,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        if (isTemplate) {
          return renderConfigTemplateDetailsComponent(ConfigTemplateType.NETWORK, row.id, row.name)
        }

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
          $t({ defaultMessage: '<VenueSingular></VenueSingular>' }) : $t({ defaultMessage: 'AP Group' })
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
    ...((isEditable || isTemplate) ? [] : [{
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
