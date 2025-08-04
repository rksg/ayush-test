/* eslint-disable max-len */
import { createContext, ReactNode, useEffect, useRef, useState } from 'react'

import { cloneDeep } from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps }      from '@acx-ui/components'
import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import {
  useApGroupNetworkListV2Query,
  useNewApGroupNetworkListQuery,
  useNewApGroupNetworkListV2Query,
  useUpdateNetworkVenueMutation,
  useUpdateNetworkVenueTemplateMutation
} from '@acx-ui/rc/services'
import {
  KeyValue,
  Network,
  NetworkExtended,
  NetworkType,
  NetworkTypeEnum,
  useConfigTemplate,
  ConfigTemplateType,
  NetworkVenue,
  useConfigTemplateMutationFnSwitcher,
  networkTypes,
  SupportNetworkTypes
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'
import { useTableQuery }  from '@acx-ui/utils'

import { useGetVLANPoolPolicyInstance }                 from '../ApGroupEdit/ApGroupVlanRadioTab'
import { renderConfigTemplateDetailsComponent }         from '../configTemplates'
import { transformApGroupRadios, transformApGroupVlan } from '../pipes/apGroupPipes'

import { ApGroupNetworkVlanRadioDrawer } from './ApGroupNetworkVlanRadioDrawer'

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
  searchTargetFields: ['name'],
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

export type ApGroupNetworkVlanRadioDrawerState = {
  visible: boolean,
  editData: Network[]
}

const defaultDrawerStatus: ApGroupNetworkVlanRadioDrawerState = {
  visible: false,
  editData: [] as Network[]
}

export const ApGroupNetworkVlanRadioContext = createContext({} as {
  apGroupId: string
  venueId: string
  tableData: Network[] | undefined
  setTableData: (data: Network[]) => void
  drawerStatus: ApGroupNetworkVlanRadioDrawerState
  setDrawerStatus: (data: ApGroupNetworkVlanRadioDrawerState) => void
  vlanPoolingNameMap: KeyValue<string, string>[]
})

export function ApGroupNetworksTable (props: ApGroupNetworksTableProps) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { venueId, apGroupId } = props

  const [tableData, setTableData] = useState(defaultArray)
  const [drawerStatus, setDrawerStatus] = useState(defaultDrawerStatus)

  const settingsId = 'apgroup-network-table'

  const tableQuery = useApGroupNetworkList({ settingsId, ...props })

  const { vlanPoolingNameMap }: { vlanPoolingNameMap: KeyValue<string, string>[] } = useGetVLANPoolPolicyInstance(!tableData.length)
  const updateDataRef = useRef<NetworkVenue[]>([])
  const oldDataRef = useRef<NetworkVenue[]>([])
  const networkDataRef = useRef<string[]>([])

  const [updateNetworkVenue] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateNetworkVenueMutation,
    useTemplateMutationFn: useUpdateNetworkVenueTemplateMutation
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
          deepVenue: activatedVenue // seems not using now?
        })
      })

      setTableData(data)
    }
  }, [tableQuery.data])

  const rowActions: TableProps<Network>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit VLAN & Radio' }),
    visible: (rows) => rows.length > 0,
    disabled: drawerStatus?.visible,
    onClick: (rows) => {
      setDrawerStatus({
        visible: true,
        editData: rows
      })
    }
  }]

  const handleUpdateAllApGroupVlanRadio = async (editData: Network[], oldData: Network[]) => {
    for (let i = 0; i < editData.length; i++) {
      const editNetworkVenue = cloneDeep(getCurrentVenue(editData[i], venueId!)!)
      const oldNetworkVenue = cloneDeep(getCurrentVenue(oldData[i], venueId!)!)
      const findIdx = updateDataRef.current.findIndex(d => (d.id === editNetworkVenue.id))
      if (findIdx === -1) {
        updateDataRef.current.push(editNetworkVenue)
        oldDataRef.current.push(oldNetworkVenue)
        networkDataRef.current.push(editData[i].id)
      } else {
        updateDataRef.current.splice(findIdx, 1, editNetworkVenue)
        oldDataRef.current.splice(findIdx, 1, oldNetworkVenue)
        networkDataRef.current.splice(findIdx, 1, editData[i].id)
      }
    }
    const updateData = updateDataRef.current
    const updateOldData = oldDataRef.current
    const networkIds = networkDataRef.current

    if (updateData.length > 0) {
      const allReqs = updateData.map((data, idx) => {
        return updateNetworkVenue({
          params: {
            tenantId: tenantId,
            venueId: venueId,
            networkId: networkIds[idx]
          },
          payload: {
            oldPayload: updateOldData[idx],
            newPayload: data
          },
          enableRbac: true
        }).unwrap()
      })
      await Promise.allSettled(allReqs)
    }
  }

  const columns = useApGroupNetworkColumns(apGroupId!, venueId!, vlanPoolingNameMap)

  const isAllApGroupsScope = (record: Network) => {
    const currentVenue = getCurrentVenue(record, venueId!)
    return currentVenue?.isAllApGroups
  }

  return (
    <Loader states={[ tableQuery ]}>
      <ApGroupNetworkVlanRadioContext.Provider value={{
        venueId: venueId!, apGroupId: apGroupId!,
        tableData, setTableData,
        drawerStatus, setDrawerStatus,
        vlanPoolingNameMap }} >
        <Table
          rowKey='id'
          settingsId={settingsId}
          columns={columns}
          dataSource={tableData}
          pagination={tableQuery.pagination}
          rowActions={filterByAccess(rowActions)}
          rowSelection={{
            type: 'checkbox',
            getCheckboxProps: (record) => ({
              disabled: drawerStatus?.visible || isAllApGroupsScope(record)
            })
          }}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
        <ApGroupNetworkVlanRadioDrawer updateData={handleUpdateAllApGroupVlanRadio} />
      </ApGroupNetworkVlanRadioContext.Provider>
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
      search: {
        searchTargetFields: defaultNewApGroupNetworkPayload.searchTargetFields as string[]
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

  const networkTypesOptions = SupportNetworkTypes.map((networkType: NetworkTypeEnum) => {
    return { key: networkType, value: $t(networkTypes[networkType]) }
  })

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: !isEditable,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      searchable: !isEditable,
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
      filterable: !isEditable && networkTypesOptions,
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
