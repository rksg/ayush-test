/* eslint-disable max-len */
import React, { ReactNode, useEffect, useState, useRef } from 'react'

import { Form, Switch }           from 'antd'
import { assign, cloneDeep, get } from 'lodash'
import { useIntl }                from 'react-intl'

import {
  Loader,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  transformVLAN,
  transformAps,
  transformRadios,
  transformScheduling,
  NetworkApGroupDialog,
  NetworkVenueScheduleDialog,
  useSdLanScopedVenueNetworks,
  checkSdLanScopedNetworkDeactivateAction,
  renderConfigTemplateDetailsComponent,
  useGetNetworkTunnelInfo,
  useIsEdgeFeatureReady,
  NetworkTunnelActionModalProps,
  NetworkTunnelActionModal,
  NetworkTunnelActionDrawer,
  NetworkTunnelActionForm,
  useUpdateNetworkTunnelAction,
  NetworkTunnelTypeEnum,
  useSoftGreTunnelActions } from '@acx-ui/rc/components'
import {
  useAddNetworkVenueMutation,
  useUpdateNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useVenueDetailsHeaderQuery,
  useVenueNetworkTableV2Query,
  useAddNetworkVenueTemplateMutation,
  useUpdateNetworkVenueTemplateMutation,
  useDeleteNetworkVenueTemplateMutation,
  useScheduleSlotIndexMap,
  useGetVLANPoolPolicyViewModelListQuery,
  useNewVenueNetworkTableQuery,
  useEnhanceVenueNetworkTableQuery,
  useGetEnhancedVlanPoolPolicyTemplateListQuery,
  useDeleteRbacNetworkVenueMutation,
  useAddRbacNetworkVenueMutation,
  useEnhanceVenueNetworkTableV2Query
} from '@acx-ui/rc/services'
import {
  useTableQuery,
  NetworkType,
  NetworkTypeEnum,
  RadioTypeEnum,
  generateDefaultNetworkVenue,
  aggregateApGroupPayload,
  Network,
  IsNetworkSupport6g,
  ApGroupModalState,
  NetworkExtended,
  SchedulerTypeEnum,
  SchedulingModalState,
  ConfigTemplateType,
  useConfigTemplate,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateTenantLink,
  KeyValue,
  VLANPoolViewModelType,
  EdgeMvSdLanViewData,
  EdgeSdLanViewDataP2,
  useConfigTemplateQueryFnSwitcher,
  TableResult,
  WifiRbacUrlsInfo,
  ConfigTemplateUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { WifiScopes }                                        from '@acx-ui/types'
import {
  filterByAccess,
  getUserProfile,
  hasAllowedOperations,
  hasCrossVenuesPermission,
  hasPermission
} from '@acx-ui/user'
import { getOpsApi } from '@acx-ui/utils'

import { useTunnelColumn } from './useTunnelColumn'

import type { FormFinishInfo } from 'rc-field-form/es/FormContext'

const defaultPayload = {
  searchString: '',
  fields: [
    'check-all',
    'name',
    'description',
    'nwSubType',
    'venues',
    'aps',
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
  ]
}

const defaultRbacPayload = {
  searchString: '',
  fields: [
    'check-all',
    'name',
    'description',
    'nwSubType',
    'venues',
    'aps',
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
    'venueApGroups'
  ]
}

const useVenueNetworkList = (props: { settingsId: string, venueId?: string } ) => {
  const { settingsId, venueId } = props
  const { isTemplate } = useConfigTemplate()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isUseNewRbacNetworkVenueApi = useIsSplitOn(Features.WIFI_NETWORK_VENUE_QUERY)
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isWifiRbacEnabled

  const nonRbacTableQuery = useTableQuery({
    useQuery: useVenueNetworkTableV2Query,
    defaultPayload: {
      ...defaultPayload,
      isTemplate: isTemplate
    },
    pagination: { settingsId },
    option: { skip: resolvedRbacEnabled || !venueId }
  })

  const rbacTableQuery = useTableQuery({
    useQuery: isApCompatibilitiesByModel
      ? (isUseNewRbacNetworkVenueApi? useEnhanceVenueNetworkTableV2Query : useEnhanceVenueNetworkTableQuery)
      : useNewVenueNetworkTableQuery,
    defaultPayload: {
      ...defaultRbacPayload,
      isTemplate: isTemplate
    },
    pagination: { settingsId },
    option: { skip: !resolvedRbacEnabled || !venueId }
  })



  return resolvedRbacEnabled? rbacTableQuery : nonRbacTableQuery
}

const defaultArray: NetworkExtended[] = []


interface schedule {
  [key: string]: string
}

export function VenueNetworksTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const { rbacOpsApiEnabled } = getUserProfile()
  const { isTemplate } = useConfigTemplate()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isSupport6gOWETransition = useIsSplitOn(Features.WIFI_OWE_TRANSITION_FOR_6G)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isWifiRbacEnabled
  const isIpSecOverNetworkEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  const addNetworkOpsApi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.addNetworkTemplateRbac
    : WifiRbacUrlsInfo.addNetworkDeep)

  const addNetworkVenueOpsAPi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.addNetworkVenueTemplateRbac
    : WifiRbacUrlsInfo.addNetworkVenue)

  const updateNetworkVenueOpsAPi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.updateNetworkVenueTemplateRbac
    : WifiRbacUrlsInfo.updateNetworkVenue)

  const deleteNetworkVenueOpsAPi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.deleteNetworkVenueTemplateRbac
    : WifiRbacUrlsInfo.deleteNetworkVenue)

  const hasUpdatePermission = hasPermission({ scopes: [WifiScopes.UPDATE] })
  const hasAddNetworkPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([addNetworkOpsApi])
    : (hasPermission({ scopes: [WifiScopes.CREATE] }) && hasCrossVenuesPermission())

  const hasActivateNetworkVenuePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([[ addNetworkVenueOpsAPi, deleteNetworkVenueOpsAPi]])
    : (hasUpdatePermission)

  const hasUpdateNetworkVenuePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([updateNetworkVenueOpsAPi])
    : (hasUpdatePermission)

  const { venueId } = params
  const settingsId = 'venue-networks-table'

  const tableQuery = useVenueNetworkList({ settingsId, venueId })

  const [tableData, setTableData] = useState(defaultArray)
  // controlling loading icon on top of table
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

  const venueDetailsQuery = useVenueDetailsHeaderQuery({ params })
  const [updateNetworkVenue] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateNetworkVenueMutation,
    useTemplateMutationFn: useUpdateNetworkVenueTemplateMutation
  })
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])

  const [ addRbacNetworkVenue, { isLoading: isAddRbacNetworkUpdating } ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddRbacNetworkVenueMutation,
    useTemplateMutationFn: useAddNetworkVenueTemplateMutation
  })
  const [ deleteRbacNetworkVenue, { isLoading: isDeleteRbacNetworkUpdating } ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeleteRbacNetworkVenueMutation,
    useTemplateMutationFn: useDeleteNetworkVenueTemplateMutation
  })

  const [ addNetworkVenue, { isLoading: isAddNetworkUpdating } ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddNetworkVenueMutation,
    useTemplateMutationFn: useAddNetworkVenueTemplateMutation
  })
  const [ deleteNetworkVenue, { isLoading: isDeleteNetworkUpdating } ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeleteNetworkVenueMutation,
    useTemplateMutationFn: useDeleteNetworkVenueTemplateMutation
  })

  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeMvSdLanReady = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)

  // hooks for tunnel column - start
  // for tunnel type data refetching
  const refetchFnRef = useRef({} as { [key: string]: () => void })
  const sdLanScopedNetworks = useSdLanScopedVenueNetworks(params.venueId, tableQuery.data?.data.map(item => item.id), refetchFnRef)
  const softGreTunnelActions = useSoftGreTunnelActions()
  const getNetworkTunnelInfo = useGetNetworkTunnelInfo()
  const updateSdLanNetworkTunnel = useUpdateNetworkTunnelAction()
  const tunnelColumn = useTunnelColumn({
    venueId: venueId!,
    sdLanScopedNetworks,
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
    enableRbac: useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  })

  useEffect(() => {
    if (instanceListResult?.data) {
      setVlanPoolingNameMap(instanceListResult.data
        ? instanceListResult.data.map(vlanPool => ({ key: vlanPool.id!, value: vlanPool.name }))
        : [])
    }
  },[instanceListResult])

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
          deepVenue: activatedVenue,
          latitude: venueDetailsQuery.data?.venue.latitude,
          longitude: venueDetailsQuery.data?.venue.longitude
        })
      })
      setExpandedRowKeys(_rows)
      setTableData(data)
    }
  }, [tableQuery.data, venueDetailsQuery.data])

  const scheduleSlotIndexMap = useScheduleSlotIndexMap(tableData, isMapEnabled)
  const linkToAddNetwork = useTenantLink('/networks/wireless/add')
  const linkToAddNetworkTemplate = useConfigTemplateTenantLink('networks/wireless/add')


  const refetchTunnelInfoData = () => {
    Object.keys(refetchFnRef.current)
      .forEach(key => refetchFnRef.current[key]())
  }

  const activateNetwork = async (checked: boolean, row: Network) => {
    if (row.allApDisabled) {
      // TODO:
      // manageAPGroups(row);
    }
    else {
      if (row.deepNetwork) {
        const venueId = params.venueId as string
        if (checked) { // activate
          const newNetworkVenue = generateDefaultNetworkVenue(venueId as string, row.id)
          if (IsNetworkSupport6g(row.deepNetwork, { isSupport6gOWETransition })) {
            newNetworkVenue.allApGroupsRadioTypes.push(RadioTypeEnum._6_GHz)
          }

          const apiParams = {
            tenantId: params.tenantId,
            venueId,
            networkId: newNetworkVenue.networkId
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
          row.deepNetwork.venues.forEach((networkVenue) => {
            if (networkVenue.venueId === venueId) {
              const apiParams = {
                tenantId: params.tenantId,
                venueId,
                networkId: networkVenue.networkId,
                networkVenueId: networkVenue.id
              }

              if (resolvedRbacEnabled) {
                setIsTableUpdating(true)
                deleteRbacNetworkVenue({
                  params: apiParams,
                  enableRbac: true,
                  callback: () => {
                    // refetch all tunnel type data because the tunnel type should be reset after network is deactivated
                    refetchTunnelInfoData()
                    setIsTableUpdating(false)
                  }
                })
              } else {
                deleteNetworkVenue({
                  params: apiParams,
                  enableRbac: false
                })
              }
            }
          })
        }
      }
    }
  }

  const getCurrentVenue = (row: Network) => {
    if (!row.activated?.isActivated) {
      return
    }
    const deepNetworkVenues = row.deepNetwork?.venues || []
    return deepNetworkVenues.find(v => v.venueId === params.venueId)
  }

  const isSystemCreatedNetwork = (row: Network) => {
    return row?.isOweMaster === false && row?.owePairNetworkId !== undefined
  }

  const getTenantLink = (row: Network) => {
    return isTemplate
      ? renderConfigTemplateDetailsComponent(ConfigTemplateType.NETWORK, row.id, row.name)
      // eslint-disable-next-line max-len
      : <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>{row.name}</TenantLink>
  }

  // TODO: Waiting for API support
  // const actions: TableProps<Network>['actions'] = [
  //   {
  //     label: $t({ defaultMessage: 'Activate' }),
  //     onClick: () => {
  //     }
  //   },
  //   {
  //     label: $t({ defaultMessage: 'Deactivate' }),
  //     onClick: () => {
  //     }
  //   }
  // ]

  const actions: TableProps<Network>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Network' }),
      scopeKey: [WifiScopes.CREATE],
      rbacOpsIds: [addNetworkOpsApi],
      onClick: () => {
        navigate(`${isTemplate ? linkToAddNetworkTemplate.pathname : linkToAddNetwork.pathname}`)
      }
    }
  ]

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        return !!row?.isOnBoarded ? <span>{row.name}</span> : getTenantLink(row)
      }
    },
    {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    },
    // { // TODO: Waiting for HEALTH feature support
    //   key: 'health',
    //   title: $t({ defaultMessage: 'Health' }),
    //   dataIndex: 'health'
    // },
    ...((isEdgeSdLanHaReady && !isEdgeMvSdLanReady && !isSoftGreEnabled) ? [{
      key: 'tunneled',
      title: $t({ defaultMessage: 'Tunnel' }),
      dataIndex: 'tunneled',
      render: function (_: ReactNode, row: Network) {
        if (Boolean(row.activated?.isActivated)) {
          const destinationsInfo = (sdLanScopedNetworks?.sdLans as EdgeSdLanViewDataP2[])
            ?.filter(sdlan => sdlan.networkIds.includes(row.id))
          return getNetworkTunnelInfo(row.id, destinationsInfo?.[0])
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
      sorter: !isWifiRbacEnabled,
      render: function (__, row) {
        let disabled = false
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
          placement='bottom'><Switch
            checked={Boolean(row.activated?.isActivated)}
            disabled={!hasActivateNetworkVenuePermission || disabled}
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
          /></Tooltip>
      }
    },
    {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      render: function (_, row) {
        const isReadOnly = !hasUpdateNetworkVenuePermission || isSystemCreatedNetwork(row) || !!row?.isOnBoarded
        return transformVLAN(
          getCurrentVenue(row),
          row.deepNetwork,
          vlanPoolingNameMap,
          (e) => handleClickApGroups(row, e),
          isReadOnly)
      }
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      width: 80,
      render: function (_, row) {
        const isReadOnly = !hasUpdateNetworkVenuePermission || isSystemCreatedNetwork(row) || !!row?.isOnBoarded
        return transformAps(
          getCurrentVenue(row),
          row.deepNetwork,
          (e) => handleClickApGroups(row, e),
          isReadOnly,
          row?.incompatible)
      }
    },
    {
      key: 'radios',
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: 140,
      render: function (_, row) {
        const isReadOnly = !hasUpdateNetworkVenuePermission || isSystemCreatedNetwork(row) || !!row?.isOnBoarded
        return transformRadios(
          getCurrentVenue(row),
          row.deepNetwork,
          (e) => handleClickApGroups(row, e),
          isReadOnly)
      }
    },
    {
      key: 'scheduling',
      title: $t({ defaultMessage: 'Scheduling' }),
      dataIndex: 'scheduling',
      render: function (_, row) {
        const isReadOnly = !hasUpdateNetworkVenuePermission || isSystemCreatedNetwork(row) || !!row?.isOnBoarded
        return transformScheduling(
          getCurrentVenue(row),
          scheduleSlotIndexMap[row.id],
          (e) => handleClickScheduling(row, e),
          isReadOnly)
      }
    },
    ...tunnelColumn
  ]

  const handleClickScheduling = (row: Network, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setScheduleModalState({
      visible: true,
      network: row,
      venue: venueDetailsQuery?.data?.venue,
      networkVenue: getCurrentVenue(row)
    })
  }

  const handleClickApGroups = (row: Network, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setApGroupModalState({
      visible: true,
      venueName: row.name,
      network: row.deepNetwork,
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

  const handleScheduleFormFinish = (name: string, info: FormFinishInfo) => {
    let data = cloneDeep(scheduleModalState.networkVenue)

    const scheduler = info.values?.scheduler
    const { type, ...weekdaysData } = scheduler || {}

    let tmpScheduleList: schedule = { type }

    if (type === SchedulerTypeEnum.ALWAYS_OFF) {
      activateNetwork(false, scheduleModalState.network!)
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
      payload: payload,
      enableRbac: resolvedRbacEnabled
    }).then(()=>{
      setScheduleModalState({
        visible: false
      })
    })
  }

  const handleFormFinish = async (name: string, newData: FormFinishInfo) => {
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
          }
        },
        enableRbac: resolvedRbacEnabled
      }).then(()=>{
        setApGroupModalState({
          visible: false
        })
      })
    }
  }

  const handleCloseTunnelModal = () =>
    setTunnelModalState({ visible: false } as NetworkTunnelActionModalProps)

  const handleNetworkTunnelActionFinish = async (
    formValues: NetworkTunnelActionForm,
    otherData: {
      tunnelTypeInitVal: NetworkTunnelTypeEnum,
      network: NetworkTunnelActionModalProps['network'],
      venueSdLan?: EdgeMvSdLanViewData
    }
  ) => {
    const { tunnelTypeInitVal, network, venueSdLan } = otherData

    try {
      await softGreTunnelActions.dectivateSoftGreTunnel(network!.venueId, network!.id, formValues)

      const shouldCloseModal = await updateSdLanNetworkTunnel(formValues, tunnelModalState.network, tunnelTypeInitVal, venueSdLan)

      if (isIpSecOverNetworkEnabled && formValues.ipsec?.enableIpsec) {
        await softGreTunnelActions.activateIpSecOverSoftGre(network!.venueId, network!.id, formValues)
      } else {
        await softGreTunnelActions.activateSoftGreTunnel(network!.venueId, network!.id, formValues)
      }
      if (shouldCloseModal !== false)
        handleCloseTunnelModal()
    } catch (e){
      // eslint-disable-next-line no-console
      console.error(e)
      handleCloseTunnelModal()
    }
  }

  const isFetching = isTableUpdating
    || isAddRbacNetworkUpdating || isDeleteRbacNetworkUpdating
    || isAddNetworkUpdating || isDeleteNetworkUpdating
  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isFetching }
    ]}>
      <Table
        settingsId={settingsId}
        rowKey='id'
        actions={hasAddNetworkPermission? filterByAccess(actions): []}
        // rowSelection={{
        //   type: 'checkbox'
        // }}
        columns={columns}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        expandedRowKeys={expandedRowKeys}
        expandIconColumnIndex={-1}
        expandIcon={
          () => <></>
        }
      />
      <Form.Provider
        onFormFinish={handleFormFinish}
      >
        <NetworkApGroupDialog
          {...apGroupModalState}
          formName='networkApGroupForm'
          tenantId={params.tenantId}
          onCancel={handleCancel}
          // onOk={handleOk}
        />
      </Form.Provider>
      <Form.Provider
        onFormFinish={handleScheduleFormFinish}
      >
        <NetworkVenueScheduleDialog
          {...scheduleModalState}
          formName='networkVenueScheduleForm'
          onCancel={handleCancel}
        />
      </Form.Provider>
      {(isEdgeMvSdLanReady || isSoftGreEnabled) && tunnelModalState.visible &&
        <>
          {!isIpSecOverNetworkEnabled && <NetworkTunnelActionModal
            {...tunnelModalState}
            onFinish={handleNetworkTunnelActionFinish}
            onClose={handleCloseTunnelModal}
          />}
          {isIpSecOverNetworkEnabled && <NetworkTunnelActionDrawer
            {...tunnelModalState}
            onFinish={handleNetworkTunnelActionFinish}
            onClose={handleCloseTunnelModal}
          />}
        </>
      }
    </Loader>
  )
}
