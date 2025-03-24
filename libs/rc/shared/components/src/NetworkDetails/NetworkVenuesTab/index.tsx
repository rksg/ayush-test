import React, { ReactNode, useEffect, useState, useRef } from 'react'

import { Form, Switch }           from 'antd'
import { assign, cloneDeep }      from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  Alert,
  Loader,
  showActionModal,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn }      from '@acx-ui/feature-toggle'
import {
  useAddNetworkVenueMutation,
  useAddNetworkVenuesMutation,
  useUpdateNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useDeleteNetworkVenuesMutation,
  useNetworkVenueTableV2Query,
  useAddNetworkVenueTemplateMutation,
  useDeleteNetworkVenueTemplateMutation,
  useUpdateNetworkVenueTemplateMutation,
  useGetVenueTemplateCityListQuery,
  useGetVenueCityListQuery,
  useAddNetworkVenueTemplatesMutation,
  useDeleteNetworkVenuesTemplateMutation,
  useScheduleSlotIndexMap,
  useGetVLANPoolPolicyViewModelListQuery,
  useNewNetworkVenueTableQuery,
  useNetworkDetailHeaderQuery,
  useEnhanceNetworkVenueTableQuery,
  useGetEnhancedVlanPoolPolicyTemplateListQuery,
  useAddRbacNetworkVenueMutation,
  useDeleteRbacNetworkVenueMutation,
  useEnhanceNetworkVenueTableV2Query
} from '@acx-ui/rc/services'
import {
  useTableQuery,
  NetworkSaveData,
  NetworkVenue,
  Venue,
  generateDefaultNetworkVenue,
  aggregateApGroupPayload,
  RadioTypeEnum,
  SchedulingModalState,
  IsNetworkSupport6g,
  ApGroupModalState,
  SchedulerTypeEnum,
  useConfigTemplate,
  useConfigTemplateMutationFnSwitcher,
  KeyValue,
  VLANPoolViewModelType,
  EdgeSdLanViewDataP2,
  EdgeMvSdLanViewData,
  useConfigTemplateQueryFnSwitcher,
  TableResult,
  ConfigTemplateUrlsInfo,
  WifiRbacUrlsInfo,
  ConfigTemplateType
} from '@acx-ui/rc/utils'
import { useParams }  from '@acx-ui/react-router-dom'
import { WifiScopes } from '@acx-ui/types'
import {
  filterByAccess,
  getUserProfile,
  hasAllowedOperations,
  hasPermission
} from '@acx-ui/user'
import { getOpsApi, transformToCityListOptions } from '@acx-ui/utils'

import { useEnforcedStatus }                from '../../configTemplates'
import { useGetNetworkTunnelInfo }          from '../../EdgeSdLan/edgeSdLanUtils'
import {
  useSdLanScopedNetworkVenues,
  checkSdLanScopedNetworkDeactivateAction
} from '../../EdgeSdLan/useEdgeSdLanActions'
import { NetworkApGroupDialog } from '../../NetworkApGroupDialog'
import {
  NetworkTunnelActionDrawer,
  NetworkTunnelActionModal,
  NetworkTunnelActionModalProps,
  useSoftGreTunnelActions
} from '../../NetworkTunnelActionModal'
import { NetworkTunnelActionForm, NetworkTunnelTypeEnum } from '../../NetworkTunnelActionModal/types'
import { useUpdateNetworkTunnelAction }                   from '../../NetworkTunnelActionModal/utils'
import { NetworkVenueScheduleDialog }                     from '../../NetworkVenueScheduleDialog'
import {
  transformVLAN,
  transformAps,
  transformRadios,
  transformScheduling
} from '../../pipes/apGroupPipes'
import { useIsEdgeFeatureReady } from '../../useEdgeActions'
import { useGetNetwork }         from '../services'

import { useTunnelColumn } from './useTunnelColumn'

import type { FormFinishInfo } from 'rc-field-form/es/FormContext'


const basePayload = {
  searchString: '',
  fields: [
    'name',
    'id',
    'description',
    'city',
    'country',
    'networks',
    'aggregatedApStatus',
    'radios',
    'aps',
    'activated',
    'vlan',
    'scheduling',
    'switches',
    'switchClients',
    'latitude',
    'longitude',
    'mesh',
    'status',
    'isOweMaster',
    'owePairNetworkId'
  ],
  searchTargetFields: ['name']
}

const defaultPayload = { ...basePayload }

const defaultRbacPayload = {
  ...basePayload,
  fields: [
    ...basePayload.fields,
    'venueApGroups',
    'incompatible',
    'isEnforced'
  ]
}

const useNetworkVenueList = (props: { settingsId: string, networkId?: string } ) => {
  const { settingsId, networkId } = props
  const { isTemplate } = useConfigTemplate()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const isUseNewRbacNetworkVenueApi = useIsSplitOn(Features.WIFI_NETWORK_VENUE_QUERY)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isWifiRbacEnabled

  const nonRbacTableQuery = useTableQuery({
    // eslint-disable-next-line max-len
    useQuery: useNetworkVenueTableV2Query,
    defaultPayload: {
      ...defaultPayload,
      isTemplate: isTemplate
    },
    search: {
      searchTargetFields: defaultPayload.searchTargetFields as string[]
    },
    pagination: { settingsId },
    option: { skip: resolvedRbacEnabled }
  })

  const rbacTableQuery = useTableQuery({
    useQuery: isApCompatibilitiesByModel
      ? (isUseNewRbacNetworkVenueApi
        ? useEnhanceNetworkVenueTableV2Query
        : useEnhanceNetworkVenueTableQuery)
      : useNewNetworkVenueTableQuery,
    apiParams: { networkId: networkId! },
    defaultPayload: {
      ...defaultRbacPayload,
      isTemplate: isTemplate,
      isTemplateRbacEnabled: isConfigTemplateRbacEnabled
    },
    search: {
      searchTargetFields: defaultRbacPayload.searchTargetFields as string[]
    },
    pagination: { settingsId },
    option: { skip: !resolvedRbacEnabled || !networkId }
  })

  return resolvedRbacEnabled ? rbacTableQuery : nonRbacTableQuery
}

const defaultArray: Venue[] = []
/* eslint-disable max-len */
const notificationMessage = defineMessage({
  defaultMessage: 'No <venuePlural></venuePlural> activating this network. Use the ON/OFF switches in the list to select the activating <venuePlural></venuePlural>'
})

interface schedule {
  [key: string]: string
}

export function NetworkVenuesTab () {
  const hasUpdatePermission = hasPermission({ scopes: [WifiScopes.UPDATE] })
  const params = useParams()
  const networkId = params.networkId
  const { $t } = useIntl()
  const { rbacOpsApiEnabled } = getUserProfile()
  const { isTemplate } = useConfigTemplate()

  const addNetworkVenueOpsAPi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.addNetworkVenueTemplateRbac
    : WifiRbacUrlsInfo.addNetworkVenue)

  const updateNetworkVenueOpsAPi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.updateNetworkVenueTemplateRbac
    : WifiRbacUrlsInfo.updateNetworkVenue)

  const deleteNetworkVenueOpsAPi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.deleteNetworkVenueTemplateRbac
    : WifiRbacUrlsInfo.deleteNetworkVenue)

  const hasActivateNetworkVenuePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([[ addNetworkVenueOpsAPi, deleteNetworkVenueOpsAPi]])
    : (hasUpdatePermission)

  const hasUpdateNetworkVenuePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([updateNetworkVenueOpsAPi])
    : (hasUpdatePermission)

  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeMvSdLanReady = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const isIpsecEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  const isSupport6gOWETransition = useIsSplitOn(Features.WIFI_OWE_TRANSITION_FOR_6G)
  const isPolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isWifiRbacEnabled
  const settingsId = 'network-venues-table'

  const tableQuery = useNetworkVenueList({ settingsId, networkId })
  const { cityFilterOptions } = useGetVenueCityList()

  const [tableData, setTableData] = useState(defaultArray)
  const [isTableUpdating, setIsTableUpdating] = useState<boolean>(false)
  const [apGroupModalState, setApGroupModalState] = useState<ApGroupModalState>({
    visible: false
  })
  const [scheduleModalState, setScheduleModalState] = useState<SchedulingModalState>({
    visible: false
  })
  const [tunnelModalState, setTunnelModalState] = useState<NetworkTunnelActionModalProps>({
    visible: false
  } as NetworkTunnelActionModalProps)
  const [systemNetwork, setSystemNetwork] = useState(false)

  const networkQuery = useGetNetwork()

  const { data: networkDetailHeader } = useNetworkDetailHeaderQuery({
    params: params,
    payload: { isTemplate }
  })

  const [
    addRbacNetworkVenue,
    { isLoading: isAddRbacNetworkUpdating }
  ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddRbacNetworkVenueMutation,
    useTemplateMutationFn: useAddNetworkVenueTemplateMutation
  })

  const [
    deleteRbacNetworkVenue,
    { isLoading: isDeleteRbacNetworkUpdating }
  ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeleteRbacNetworkVenueMutation,
    useTemplateMutationFn: useDeleteNetworkVenueTemplateMutation
  })

  const [updateNetworkVenue] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateNetworkVenueMutation,
    useTemplateMutationFn: useUpdateNetworkVenueTemplateMutation
  })

  // non-RBAC API
  const [
    addNetworkVenue,
    { isLoading: isAddNetworkUpdating }
  ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddNetworkVenueMutation,
    useTemplateMutationFn: useAddNetworkVenueTemplateMutation
  })
  const [
    deleteNetworkVenue,
    { isLoading: isDeleteNetworkUpdating }
  ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeleteNetworkVenueMutation,
    useTemplateMutationFn: useDeleteNetworkVenueTemplateMutation
  })

  // RBAC API doesn't support
  const [addNetworkVenues] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddNetworkVenuesMutation,
    useTemplateMutationFn: useAddNetworkVenueTemplatesMutation
  })
  const [deleteNetworkVenues] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeleteNetworkVenuesMutation,
    useTemplateMutationFn: useDeleteNetworkVenuesTemplateMutation
  })

  // hooks for tunnel column - start
  // for tunnel type data refetching
  const refetchFnRef = useRef({} as { [key: string]: () => void })
  const sdLanScopedNetworkVenues = useSdLanScopedNetworkVenues(networkId, refetchFnRef)
  const softGreTunnelActions = useSoftGreTunnelActions()
  const getNetworkTunnelInfo = useGetNetworkTunnelInfo()
  const updateSdLanNetworkTunnel = useUpdateNetworkTunnelAction()
  const tunnelColumn = useTunnelColumn({
    network: networkQuery.data,
    sdLanScopedNetworkVenues,
    setTunnelModalState,
    refetchFnRef,
    setIsTableUpdating
  })
  // hooks for tunnel column - end

  const [vlanPoolingNameMap, setVlanPoolingNameMap] = useState<KeyValue<string, string>[]>([])
  const { data: instanceListResult } = useConfigTemplateQueryFnSwitcher<TableResult<VLANPoolViewModelType>>({
    useQueryFn: useGetVLANPoolPolicyViewModelListQuery,
    useTemplateQueryFn: useGetEnhancedVlanPoolPolicyTemplateListQuery,
    skip: !tableData.length,
    payload: {
      fields: ['name', 'id', 'vlanMembers'], sortField: 'name',
      sortOrder: 'ASC', page: 1, pageSize: 10000
    },
    enableRbac: isPolicyRbacEnabled
  })

  const { hasEnforcedItem, getEnforcedActionMsg } = useEnforcedStatus(ConfigTemplateType.VENUE)

  useEffect(() => {
    if (instanceListResult?.data) {
      setVlanPoolingNameMap(instanceListResult.data
        ? instanceListResult.data.map(vlanPool => ({ key: vlanPool.id!, value: vlanPool.name }))
        : [])
    }
  },[instanceListResult])

  const getCurrentVenue = (row: Venue) => {
    if (!row.activated.isActivated) {
      return
    }
    const network = networkQuery.data
    const venueId = row.id
    let venue = row.deepVenue
    if (!venue) {
      venue = network?.venues?.find(v => v.venueId === venueId)
    }
    return venue
  }

  useEffect(()=>{
    if (tableQuery.data && networkQuery.data) {
      const data: React.SetStateAction<Venue[]> = []
      tableQuery.data.data.forEach(item => {
        const activatedVenue = item.deepVenue || networkQuery.data?.venues?.find(
          i => i.venueId === item.id
        )
        data.push({
          ...item,
          deepVenue: activatedVenue,
          // work around of read-only records from RTKQ
          activated: activatedVenue ? { isActivated: true } : { ...item.activated }
        })
        setSystemNetwork(networkQuery.data?.isOweMaster === false && networkQuery.data?.owePairNetworkId !== undefined)
      })

      setTableData(data)
    }
  }, [tableQuery.data, networkQuery.data])

  const scheduleSlotIndexMap = useScheduleSlotIndexMap(tableData, isMapEnabled)

  const refetchTunnelInfoData = () => {
    Object.keys(refetchFnRef.current)
      .forEach(key => refetchFnRef.current[key]())
  }

  const activateNetwork = async (checked: boolean, row: Venue) => {
    // TODO: Service
    // if (checked) {
    //   if (row.allApDisabled) {
    //     manageAPGroups(row);
    //   }
    // }
    const venueId = row.id
    const network = networkQuery.data
    const networkId = (network && network?.id) ? network.id : ''
    const newNetworkVenue = generateDefaultNetworkVenue(venueId, networkId)

    if (IsNetworkSupport6g(network, { isSupport6gOWETransition })) {
      newNetworkVenue.allApGroupsRadioTypes?.push(RadioTypeEnum._6_GHz)
    }

    let deactivateNetworkVenueId = ''
    if (!checked && network?.venues) {
      network?.venues.forEach((venue: NetworkVenue) => {
        if (venue.venueId === row.id || venue.id === row.id) {
          deactivateNetworkVenueId = venue.id ? venue.id : row.id
        }
      })
    }

    if (!row.allApDisabled || !checked) {
      if (checked) { // activate
        const apiParams = {
          tenantId: params.tenantId,
          venueId,
          networkId
        }

        if (resolvedRbacEnabled) {
          setIsTableUpdating(true)
          addRbacNetworkVenue({
            params: apiParams,
            payload: newNetworkVenue,
            enableRbac: true,
            callback: () => setIsTableUpdating(false)
          })
        } else {
          addNetworkVenue({
            params: apiParams,
            payload: newNetworkVenue,
            enableRbac: false
          })
        }
      } else { // deactivate
        checkSdLanScopedNetworkDeactivateAction(sdLanScopedNetworkVenues?.networkVenueIds, [row.id], () => {
          if (!deactivateNetworkVenueId) {
            tableData.forEach((venue: Venue) => {
              if (venue && venue.id === row.id) {
                deactivateNetworkVenueId = venue.deepVenue!.id ?? ''
              }
            })
          }

          const apiParams = {
            tenantId: params.tenantId,
            networkVenueId: deactivateNetworkVenueId,
            venueId: newNetworkVenue.venueId,
            networkId
          }

          if (resolvedRbacEnabled) {
            setIsTableUpdating(true)
            deleteRbacNetworkVenue({
              params: apiParams,
              enableRbac: true,
              callback: () => {
                refetchTunnelInfoData()
                setIsTableUpdating(false)
              }
            })
          } else {
            deleteNetworkVenue({ params: apiParams, enableRbac: false })
          }
        })
      }
    }
  }

  const handleAddNetworkVenues = async (networkVenues: NetworkVenue[], clearSelection: () => void) => {
    if (networkVenues.length > 0) {
      if (resolvedRbacEnabled) {
        setIsTableUpdating(true)
        const addNetworkVenueReqs = networkVenues.map((networkVenue) => {
          const params = {
            venueId: networkVenue.venueId,
            networkId: networkVenue.networkId
          }
          return addRbacNetworkVenue({
            params,
            payload: networkVenue,
            enableRbac: true,
            callback: () => setIsTableUpdating(false)
          })
        })

        await Promise.allSettled(addNetworkVenueReqs).then(clearSelection)

      } else {
        await addNetworkVenues({ payload: networkVenues }).then(clearSelection)
      }
    } else {
      clearSelection()
    }
  }

  const handleDeleteNetworkVenues = async (networkVenueIds: string[], clearSelection: () => void) => {
    if (networkVenueIds.length > 0) {
      if (resolvedRbacEnabled) {
        const network = networkQuery.data
        const networkId = (network && network?.id) ? network.id : ''
        setIsTableUpdating(true)
        const deleteNetworkVenueReqs = networkVenueIds.map((networkVenueId) => {
          const curParams = {
            venueId: networkVenueId,
            networkId: networkId
          }
          return deleteRbacNetworkVenue({
            params: curParams,
            enableRbac: true,
            callback: () => setIsTableUpdating(false)
          })
        })

        await Promise.allSettled(deleteNetworkVenueReqs).then(clearSelection)
      } else {
        deleteNetworkVenues({ payload: networkVenueIds }).then(clearSelection)
      }
    } else {
      clearSelection()
    }
  }

  const activateSelected = (activatingVenues: Venue[]) => {
    const enabledNotActivatedVenueNames: string[] = []
    const network = networkQuery.data
    const networkVenues = network?.venues || []
    const newActivatedVenues: NetworkVenue[] = []

    activatingVenues.forEach(venue => {
      const newNetworkVenue = generateDefaultNetworkVenue(venue.id, (network && network?.id) ? network.id : '')

      if (IsNetworkSupport6g(network, { isSupport6gOWETransition })) {
        newNetworkVenue.allApGroupsRadioTypes?.push(RadioTypeEnum._6_GHz)
      }
      const alreadyActivatedVenue = networkVenues.find(x => x.venueId === venue.id)
      if (!alreadyActivatedVenue && !venue.disabledActivation && !venue.allApDisabled) {
        if (!venue.activated.isDisabled && !venue.activated.isActivated) {
          newActivatedVenues.push(newNetworkVenue)
        }
      }

      if (venue.allApDisabled) {
        enabledNotActivatedVenueNames.push(venue.name)
      }
    })

    if (enabledNotActivatedVenueNames.length > 0) {
      showActionModal({
        type: 'info',
        title: $t({ defaultMessage: 'Your Attention is Required' }),
        content: (<>
          <div>
            {$t(
              { defaultMessage: 'For the following {count, plural, one {<venueSingular></venueSingular>} other {<venuePlural></venuePlural>}}, the network could not be activated on all <VenuePlural></VenuePlural>:' },
              { count: enabledNotActivatedVenueNames.length }
            )}
          </div>
          {enabledNotActivatedVenueNames.map(venue =>(<div key={venue}> {venue} </div>))}
        </>)
      })
    }

    return newActivatedVenues
  }

  const deActivateSelected = (deActivatingVenues: Venue[]) => {
    const network = networkQuery.data
    const networkVenues = network?.venues || []
    const selectedVenuesIds: string[] = []

    deActivatingVenues.forEach(venue => {
      const alreadyActivatedVenue = networkVenues.find(x => x.venueId === venue.id)
      if (alreadyActivatedVenue && !venue.disabledActivation && !venue.allApDisabled) {
        const { id, venueId } = alreadyActivatedVenue
        const selectVenueId = id ?? venueId
        const { isDisabled, isActivated } = venue.activated || {}
        if (!isDisabled && selectVenueId && isActivated === true) {
          selectedVenuesIds.push(selectVenueId)
        }
      }
    })

    return selectedVenuesIds
  }

  const activation = (selectedRows:Venue[]) => {
    const enabled = selectedRows.some((item)=>{
      return item.mesh && item.mesh.enabled && networkQuery.data && networkQuery.data.enableDhcp
    })
    return !enabled
  }
  const rowActions: TableProps<Venue>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      scopeKey: [WifiScopes.UPDATE],
      visible: activation,
      disabled: (selectedRows) => hasEnforcedItem(selectedRows),
      tooltip: (selectedRows) => getEnforcedActionMsg(selectedRows),
      onClick: (rows, clearSelection) => {
        const networkVenues = activateSelected(rows)
        handleAddNetworkVenues(networkVenues, clearSelection)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      scopeKey: [WifiScopes.UPDATE],
      visible: activation,
      disabled: (selectedRows) => hasEnforcedItem(selectedRows),
      tooltip: (selectedRows) => getEnforcedActionMsg(selectedRows),
      onClick: (rows, clearSelection) => {
        checkSdLanScopedNetworkDeactivateAction(sdLanScopedNetworkVenues?.networkVenueIds, rows.map(item => item.id), () => {
          const deActivateNetworkVenueIds = deActivateSelected(rows)
          handleDeleteNetworkVenues(deActivateNetworkVenueIds, clearSelection)
        })
      }
    }
  ]

  const columns: TableProps<Venue>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left'
    },
    {
      key: 'city',
      title: $t({ defaultMessage: 'City' }),
      dataIndex: 'city',
      filterKey: 'city',
      filterable: cityFilterOptions || false,
      sorter: true
    },
    {
      key: 'country',
      title: $t({ defaultMessage: 'Country' }),
      dataIndex: 'country',
      sorter: true
    },
    {
      key: 'networks',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: ['networks', 'count'],
      align: 'center',
      render: function (_, { networks }) { return networks?.count ? networks?.count : 0 }
    },
    {
      key: 'aggregatedApStatus',
      title: $t({ defaultMessage: 'Wi-Fi APs' }),
      dataIndex: 'aggregatedApStatus',
      align: 'center',
      render: function (_, row) {
        if (!row.aggregatedApStatus) { return 0 }
        return Object
          .values(row.aggregatedApStatus)
          .reduce((a, b) => a + b, 0)
      }
    },
    ...((isEdgeSdLanHaReady && !isEdgeMvSdLanReady && !isSoftGreEnabled) ? [{
      key: 'tunneled',
      title: $t({ defaultMessage: 'Tunnel' }),
      dataIndex: 'tunneled',
      render: function (_: ReactNode, row: Venue) {
        const destinationsInfo = sdLanScopedNetworkVenues?.sdLansVenueMap[row.id] as EdgeSdLanViewDataP2[]
        if (Boolean(row.activated?.isActivated)) {
          return getNetworkTunnelInfo(networkId!, destinationsInfo?.[0])
        } else {
          return ''
        }
      }
    }]: []),
    {
      key: 'activated',
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      align: 'center',
      render: function (_, row) {
        let disabled = false
        let title = ''
        if (hasActivateNetworkVenuePermission) {
          if (networkQuery.data && networkQuery.data.enableDhcp && row.mesh && row.mesh.enabled){
            disabled = true
            title = $t({ defaultMessage: 'You cannot activate the DHCP service on this <venueSingular></venueSingular> because it already enabled mesh setting' })
          } else if (systemNetwork) {
            disabled = true
            title = $t({ defaultMessage: 'Activating the OWE network also enables the read-only OWE transition network.' })
          } else if (hasEnforcedItem([row])) {
            disabled = true
            title = getEnforcedActionMsg([row])
          }
        }

        return <Tooltip
          title={title}
          placement='bottom'>
          <Switch
            checked={Boolean(row.activated?.isActivated)}
            disabled={!hasActivateNetworkVenuePermission || disabled}
            onClick={(checked, event) => {
              activateNetwork(checked, row)
              event.stopPropagation()
            }}
          />
        </Tooltip>
      }
    },
    {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      render: function (_, row) {
        return transformVLAN(
          getCurrentVenue(row),
          networkQuery.data as NetworkSaveData,
          vlanPoolingNameMap,
          (e) => handleClickApGroups(row, e),
          (!hasUpdateNetworkVenuePermission || systemNetwork))
      }
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      width: 80,
      render: function (_, row) {
        return transformAps(
          getCurrentVenue(row),
          networkQuery.data as NetworkSaveData,
          (e) => handleClickApGroups(row, e),
          (!hasUpdateNetworkVenuePermission || systemNetwork),
          row.incompatible)
      }
    },
    {
      key: 'radios',
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: 140,
      render: function (_, row) {
        return transformRadios(
          getCurrentVenue(row),
          networkQuery.data as NetworkSaveData,
          (e) => handleClickApGroups(row, e),
          (!hasUpdateNetworkVenuePermission || systemNetwork))
      }
    },
    {
      key: 'scheduling',
      title: $t({ defaultMessage: 'Scheduling' }),
      dataIndex: 'scheduling',
      render: function (_, row) {
        return transformScheduling(
          getCurrentVenue(row),
          scheduleSlotIndexMap[row.id],
          (e) => handleClickScheduling(row, e),
          (!hasUpdateNetworkVenuePermission || systemNetwork))
      }
    },
    ...tunnelColumn
  ]

  const handleClickScheduling = (row: Venue, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setScheduleModalState({
      visible: true,
      venue: row,
      networkVenue: getCurrentVenue(row)
    })
  }

  const handleClickApGroups = (row: Venue, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setApGroupModalState({
      visible: true,
      venueName: row.name,
      network: networkQuery.data,
      networkVenue: getCurrentVenue(row)
    })
  }

  const handleCancel = () => {
    setApGroupModalState({
      visible: false
    })
    setScheduleModalState({
      visible: false
    })
  }

  const handleCloseTunnelModal = () =>
    setTunnelModalState({ visible: false } as NetworkTunnelActionModalProps)

  const handleFormFinish = (name: string, newData: FormFinishInfo) => {
    if (name === 'networkApGroupForm') {
      let oldData = cloneDeep(apGroupModalState.networkVenue)
      const payload = aggregateApGroupPayload(newData, oldData)

      updateNetworkVenue({
        params: {
          tenantId: params.tenantId,
          networkVenueId: payload.id,
          venueId: payload.venueId,
          networkId: payload.networkId
        },
        payload: {
          ...{
            oldPayload: oldData,
            newPayload: payload
          },
          isTemplate: isTemplate
        },
        enableRbac: resolvedRbacEnabled
      }).then(()=>{
        setApGroupModalState({
          visible: false
        })
      })
    }
  }

  const handleScheduleFormFinish = (name: string, info: FormFinishInfo) => {
    let data = cloneDeep(scheduleModalState.networkVenue)

    const scheduler = info.values?.scheduler
    const { type, ...weekdaysData } = scheduler || {}

    let tmpScheduleList: schedule = { type }

    if (type === SchedulerTypeEnum.ALWAYS_OFF) {
      activateNetwork(false, scheduleModalState.venue! as Venue)
      setScheduleModalState({
        visible: false
      })
      return
    }

    if (type === SchedulerTypeEnum.CUSTOM) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let map: { [key: string]: any } = weekdaysData
      for (let key in map) {
        let scheduleList: string[] = []
        for(let i = 0; i < 96; i++){
          scheduleList.push('0')
        }
        map[key].forEach((item: string) => {
          const value = parseInt(item.split('_')[1], 10)
          scheduleList[value] = '1'
        })
        tmpScheduleList[key] = scheduleList.join('')
      }
    }

    const payload = assign(data, { scheduler: tmpScheduleList })

    updateNetworkVenue({
      params: {
        tenantId: params.tenantId,
        networkVenueId: payload.id,
        venueId: payload.venueId,
        networkId: payload.networkId
      },
      payload: {
        ...payload,
        isTemplate: isTemplate
      },
      enableRbac: resolvedRbacEnabled
    }).then(()=>{
      setScheduleModalState({
        visible: false
      })
    })
  }

  const handleNetworkTunnelActionFinish = async (
    formValues: NetworkTunnelActionForm,
    otherData: {
      tunnelTypeInitVal: NetworkTunnelTypeEnum,
      network: NetworkTunnelActionModalProps['network'],
      venueSdLan?: EdgeMvSdLanViewData
    }
  ) => {
    const { tunnelTypeInitVal, network, venueSdLan } = otherData

    try{
      await softGreTunnelActions.dectivateSoftGreTunnel(network!.venueId, network!.id, formValues)

      const shouldCloseModal = await updateSdLanNetworkTunnel(formValues, tunnelModalState.network, tunnelTypeInitVal, venueSdLan)

      if (isIpsecEnabled && formValues.ipsec?.enableIpsec) {
        await softGreTunnelActions.activateIpSecOverSoftGre(network!.venueId, network!.id, formValues)
      } else {
        await softGreTunnelActions.activateSoftGreTunnel(network!.venueId, network!.id, formValues)
      }

      if (shouldCloseModal !== false)
        handleCloseTunnelModal()

    } catch(err) {
      // eslint-disable-next-line no-console
      console.error(err)
      handleCloseTunnelModal()
    }
  }

  const isFetching = isTableUpdating
    || isAddRbacNetworkUpdating || isDeleteRbacNetworkUpdating
    || isAddNetworkUpdating || isDeleteNetworkUpdating

  return (
    <Loader states={[
      tableQuery,
      networkQuery,
      { isLoading: false, isFetching: isFetching }
    ]}>
      {
        !networkDetailHeader?.activeVenueCount &&
        <Alert message={$t(notificationMessage)} type='info' showIcon closable />
      }
      <Table
        settingsId={settingsId}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasUpdateNetworkVenuePermission && !systemNetwork && {
          type: 'checkbox'
        }}
        columns={columns}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        getAllPagesData={tableQuery.getAllPagesData}
        enableApiFilter={true}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
      />
      <Form.Provider
        onFormFinish={handleFormFinish}
      >
        <NetworkApGroupDialog
          {...apGroupModalState}
          tenantId={params.tenantId}
          formName='networkApGroupForm'
          onCancel={handleCancel}
        />
      </Form.Provider>
      <Form.Provider
        onFormFinish={handleScheduleFormFinish}
      >
        <NetworkVenueScheduleDialog
          {...scheduleModalState}
          formName='networkVenueScheduleForm'
          network={networkQuery.data}
          onCancel={handleCancel}
        />
      </Form.Provider>
      {(isEdgeMvSdLanReady || isSoftGreEnabled) && tunnelModalState.visible &&
        <>
          {!isIpsecEnabled &&
            <NetworkTunnelActionModal
              {...tunnelModalState}
              onFinish={handleNetworkTunnelActionFinish}
              onClose={handleCloseTunnelModal}
            />}
          {isIpsecEnabled &&
            <NetworkTunnelActionDrawer
              {...tunnelModalState}
              onFinish={handleNetworkTunnelActionFinish}
              onClose={handleCloseTunnelModal}
            />}
        </>
      }
    </Loader>
  )
}

function useGetVenueCityList () {
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const isRbacEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)

  const venueCityListTemplate = useGetVenueTemplateCityListQuery({
    params,
    enableRbac: isConfigTemplateRbacEnabled
  }, {
    selectFromResult: ({ data }) => ({
      cityFilterOptions: transformToCityListOptions(data)
    }),
    skip: !isTemplate
  })

  const venueCityList = useGetVenueCityListQuery({
    params,
    enableRbac: isRbacEnabled
  }, {
    selectFromResult: ({ data }) => ({
      cityFilterOptions: transformToCityListOptions(data)
    }),
    skip: isTemplate
  })

  return isTemplate ? venueCityListTemplate : venueCityList
}
