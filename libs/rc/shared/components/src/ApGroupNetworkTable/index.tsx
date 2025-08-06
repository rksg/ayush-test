/* eslint-disable max-len */
import React, { createContext, ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import { Switch }         from 'antd'
import { cloneDeep, get } from 'lodash'
import { AlignType }      from 'rc-table/lib/interface'
import { useIntl }        from 'react-intl'
import { useParams }      from 'react-router-dom'

import { Loader, Table, TableProps, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import {
  useAddNetworkVenueTemplateMutation,
  useAddRbacNetworkVenueMutation,
  useDeleteNetworkVenueTemplateMutation,
  useDeleteRbacNetworkVenueMutation,
  useEnhanceVenueNetworkTableV2Query,
  useNewVenueNetworkTableQuery,
  useUpdateNetworkVenueMutation,
  useUpdateNetworkVenueTemplateMutation,
  useVenueDetailsHeaderQuery
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
  SupportNetworkTypes,
  WifiRbacUrlsInfo,
  generateDefaultNetworkVenue,
  IsNetworkSupport6g,
  RadioTypeEnum, RadioEnum
} from '@acx-ui/rc/utils'
import { TenantLink }                                                          from '@acx-ui/react-router-dom'
import { WifiScopes }                                                          from '@acx-ui/types'
import { filterByAccess, getUserProfile, hasAllowedOperations, hasPermission } from '@acx-ui/user'
import { getOpsApi, useTableQuery }                                            from '@acx-ui/utils'

import { useApGroupContext }                                                    from '../ApGroupDetails/ApGroupContextProvider'
import { useGetVLANPoolPolicyInstance }                                         from '../ApGroupEdit/ApGroupVlanRadioTab'
import { renderConfigTemplateDetailsComponent }                                 from '../configTemplates'
import { checkSdLanScopedNetworkDeactivateAction, useSdLanScopedVenueNetworks } from '../EdgeSdLan/useEdgeSdLanActions'
import { AddNetworkModal }                                                      from '../NetworkForm'
import { transformApGroupRadios, transformApGroupVlan }                         from '../pipes/apGroupPipes'

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
  const { name } = useApGroupContext()

  const { rbacOpsApiEnabled } = getUserProfile()

  const isSupport6gOWETransition = useIsSplitOn(Features.WIFI_OWE_TRANSITION_FOR_6G)
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase3Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE3_TOGGLE)
  const [isTableUpdating, setIsTableUpdating] = useState<boolean>(false)
  const [networkModalVisible, setNetworkModalVisible] = useState(false)

  const [tableData, setTableData] = useState(defaultArray)
  const [drawerStatus, setDrawerStatus] = useState(defaultDrawerStatus)

  const settingsId = 'apgroup-network-table'
  const tableQuery = useVenueNetworkList({ settingsId, venueId })

  const { vlanPoolingNameMap }: { vlanPoolingNameMap: KeyValue<string, string>[] } = useGetVLANPoolPolicyInstance(!tableData.length)
  const updateDataRef = useRef<NetworkVenue[]>([])
  const oldDataRef = useRef<NetworkVenue[]>([])
  const networkDataRef = useRef<string[]>([])

  const addNetworkVenueOpsAPi = getOpsApi(WifiRbacUrlsInfo.addNetworkVenue)

  const updateNetworkVenueOpsAPi = getOpsApi(WifiRbacUrlsInfo.updateNetworkVenue)

  const deleteNetworkVenueOpsAPi = getOpsApi(WifiRbacUrlsInfo.deleteNetworkVenue)

  const addNetworkOpsApi = getOpsApi(WifiRbacUrlsInfo.addNetworkDeep)

  const [updateNetworkVenue] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateNetworkVenueMutation,
    useTemplateMutationFn: useUpdateNetworkVenueTemplateMutation
  })

  const [ addRbacNetworkVenue, { isLoading: isAddRbacNetworkUpdating } ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddRbacNetworkVenueMutation,
    useTemplateMutationFn: useAddNetworkVenueTemplateMutation
  })

  const [ deleteRbacNetworkVenue, { isLoading: isDeleteRbacNetworkUpdating } ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeleteRbacNetworkVenueMutation,
    useTemplateMutationFn: useDeleteNetworkVenueTemplateMutation
  })

  const hasActivatePermission = hasPermission({ scopes: [WifiScopes.CREATE, WifiScopes.UPDATE] })

  const hasActivateNetworkVenuePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([[ addNetworkVenueOpsAPi, deleteNetworkVenueOpsAPi]])
    : (hasActivatePermission)

  const hasUpdateNetworkVenuePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([updateNetworkVenueOpsAPi])
    : (hasActivatePermission)

  const actions: TableProps<Network>['actions'] = isApGroupMoreParameterPhase3Enabled ? [
    {
      label: $t({ defaultMessage: 'Add Network' }),
      scopeKey: [WifiScopes.CREATE],
      rbacOpsIds: [addNetworkOpsApi],
      onClick: () => { setNetworkModalVisible(true) }
    }
  ] : []

  useEffect(()=>{
    if (tableQuery.data && venueId) {
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
          deepVenue: activatedVenue, // seems not using now?
          activated: activatedVenue ? { isActivated: true } : { ...item.activated }
        })
      })

      setTableData(data)
    }
  }, [tableQuery.data, venueId])

  const rowActions: TableProps<Network>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit VLAN & Radio' }),
    visible: (rows) => rows.length > 0,
    disabled: drawerStatus?.visible && !hasUpdateNetworkVenuePermission,
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

  const activateNetwork = async (checked: boolean, row: Network) => {
    if (row.allApDisabled) {
      // TODO:
      // manageAPGroups(row);
    }
    else {
      if (row.deepNetwork) {
        if (checked) { // activate
          const newNetworkVenue = generateDefaultNetworkVenue(venueId as string, row.id)
          if (IsNetworkSupport6g(row.deepNetwork, { isSupport6gOWETransition })) {
            newNetworkVenue.allApGroupsRadioTypes.push(RadioTypeEnum._6_GHz)
          }

          const apiParams = {
            tenantId,
            venueId,
            networkId: newNetworkVenue.networkId
          }

          setIsTableUpdating(true)
          addRbacNetworkVenue({
            params: apiParams,
            payload: newNetworkVenue,
            enableRbac: true,
            callback: () => {
              updateNetworkVenue({
                params: {
                  tenantId: tenantId,
                  venueId: venueId,
                  networkId: newNetworkVenue.networkId
                },
                payload: {
                  ...{
                    oldPayload: newNetworkVenue,
                    newPayload: {
                      ...newNetworkVenue,
                      isAllApGroups: false,
                      apGroups: [
                        {
                          apGroupId: apGroupId,
                          radioTypes: [
                            RadioTypeEnum._2_4_GHz,
                            RadioTypeEnum._5_GHz,
                            ...(IsNetworkSupport6g(row.deepNetwork, { isSupport6gOWETransition }) ? [RadioTypeEnum._6_GHz] : [])
                          ],
                          radio: RadioEnum.Both
                        }
                      ]
                    }
                  }
                },
                enableRbac: true
              }).then(()=>{
                setIsTableUpdating(false)
              })
            }
          })

        } else { // deactivate
          row.deepNetwork.venues.forEach((networkVenue) => {
            if (networkVenue.venueId === venueId) {
              const apiParams = {
                tenantId,
                venueId,
                networkId: networkVenue.networkId,
                networkVenueId: networkVenue.id
              }

              setIsTableUpdating(true)
              deleteRbacNetworkVenue({
                params: apiParams,
                enableRbac: true,
                callback: () => {
                  setIsTableUpdating(false)
                }
              })
            }
          })
        }
      }
    }
  }

  const columns = useApGroupNetworkColumns(
    apGroupId!, venueId!,
    vlanPoolingNameMap, undefined,
    activateNetwork, hasActivateNetworkVenuePermission,
    tableQuery.data?.data.map(item => item.id)
  )

  const isAllApGroupsScopeOrNotActivated = (record: Network) => {
    const currentVenue = getCurrentVenue(record, venueId!)
    const notActivated = !currentVenue?.apGroups?.find((apGroup) => apGroup.apGroupId === apGroupId)
    return currentVenue?.isAllApGroups || notActivated
  }

  const networkFormDefaultVals = useMemo(() => (
    venueId
      ? {
        defaultActiveVenues: [venueId],
        defaultActiveApGroups: [{
          apGroupId: apGroupId,
          apGroupName: name,
          radioTypes: [
            RadioTypeEnum._2_4_GHz,
            RadioTypeEnum._5_GHz,
            RadioTypeEnum._6_GHz
          ],
          radio: RadioEnum.Both
        }]
      }
      : undefined
  ), [venueId])

  const isFetching = isTableUpdating || isAddRbacNetworkUpdating || isDeleteRbacNetworkUpdating

  return (
    <>
      <Loader states={[ tableQuery, { isLoading: false, isFetching: isFetching } ]}>
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
            actions={filterByAccess(actions)}
            rowActions={filterByAccess(rowActions)}
            rowSelection={{
              type: 'checkbox',
              getCheckboxProps: (record) => ({
                disabled: drawerStatus?.visible || isAllApGroupsScopeOrNotActivated(record)
              })
            }}
            onChange={tableQuery.handleTableChange}
            onFilterChange={tableQuery.handleFilterChange}
            enableApiFilter={true}
          />
          <ApGroupNetworkVlanRadioDrawer updateData={handleUpdateAllApGroupVlanRadio} />
        </ApGroupNetworkVlanRadioContext.Provider>
      </Loader>
      <AddNetworkModal
        visible={networkModalVisible}
        setVisible={setNetworkModalVisible}
        defaultValues={networkFormDefaultVals}
      />
    </>
  )
}

const useVenueNetworkList = (props: { settingsId: string, venueId?: string } ) => {
  const { settingsId, venueId } = props
  const { isTemplate } = useConfigTemplate()
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)

  const rbacTableQuery = useTableQuery({
    useQuery: isApCompatibilitiesByModel
      ? useEnhanceVenueNetworkTableV2Query
      : useNewVenueNetworkTableQuery,
    defaultPayload: {
      ...defaultNewApGroupNetworkPayload,
      isTemplate: isTemplate
    },
    search: {
      searchTargetFields: defaultNewApGroupNetworkPayload.searchTargetFields as string[]
    },
    pagination: { settingsId },
    apiParams: { venueId: venueId || '' },
    option: { skip: !venueId }
  })

  return rbacTableQuery
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
  isEditable?: boolean,
  activateNetwork?: (checked: boolean, row: Network) => void,
  hasActivateNetworkVenuePermission?: boolean,
  networkIds?: string[] | undefined
) {

  const { $t } = useIntl()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase3Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE3_TOGGLE)
  const sdLanScopedNetworks = useSdLanScopedVenueNetworks(venueId, networkIds)

  const venueDetailsQuery = useVenueDetailsHeaderQuery({ params: { ...params, venueId } })

  const isSystemCreatedNetwork = (row: Network) => {
    return row?.isOweMaster === false && row?.owePairNetworkId !== undefined
  }

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
    ...(isApGroupMoreParameterPhase3Enabled && activateNetwork ? [{
      key: 'activated',
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      align: 'center' as AlignType,
      render: function (_: ReactNode, row: Network) {
        let disabled = false
        const currentVenue = getCurrentVenue(row, venueId)
        if (currentVenue?.isAllApGroups) {
          disabled = true
        }
        let title = ''
        if (hasActivateNetworkVenuePermission) {
          if((get(row,'deepNetwork.enableDhcp') && get(venueDetailsQuery.data,'venue.mesh.enabled'))){
            disabled = true
            title = $t({ defaultMessage: 'You cannot activate the DHCP Network on this <venueSingular></venueSingular> because it already enabled mesh setting' })
          } else if (row?.isOnBoarded) {
            disabled = true
            title = $t({ defaultMessage: 'This is a Onboarding network for WPA3-DPSK3 for DPSK, so its activation on this <venueSingular></venueSingular> is tied to the Service network exclusively.' })
          } else if (isSystemCreatedNetwork(row)) {
            disabled = true
            title = $t({ defaultMessage: 'Activating the OWE network also enables the read-only OWE transition network.' })
          }
        }

        return <Tooltip
          title={title}
          placement='bottom'>
          <Switch
            checked={Boolean(row.activated?.isActivated)}
            disabled={disabled}
            onClick={(checked, event) => {
              if (!checked) {
                checkSdLanScopedNetworkDeactivateAction(sdLanScopedNetworks.scopedNetworkIds, [row.id], () => {
                  activateNetwork(checked, row)
                })
              } else {
                activateNetwork(checked, row)
              }
              event.stopPropagation()
            }}
          />
        </Tooltip>
      }
    }] : []),
    ...(isEditable? [] : [{
      key: 'venues',
      title: $t({ defaultMessage: 'Scope' }),
      dataIndex: 'venues',
      render: function (_: ReactNode, row: Network) {
        const currentVenue = getCurrentVenue(row, venueId)
        return currentVenue?.isAllApGroups
          ? $t({ defaultMessage: '<VenueSingular></VenueSingular>' })
          : currentVenue?.apGroups?.find((apGroup) => apGroup.apGroupId === apGroupId) ? $t({ defaultMessage: 'AP Group' }) : ''
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
