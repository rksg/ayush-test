/* eslint-disable max-len */
import React, { useEffect, useState, useRef } from 'react'

import { Form, Switch }                 from 'antd'
import { assign, cloneDeep, get, omit } from 'lodash'
import { useIntl }                      from 'react-intl'

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
  NetworkTunnelActionModalProps,
  NetworkTunnelActionModal,
  NetworkTunnelActionDrawer,
  NetworkTunnelActionForm,
  useUpdateNetworkTunnelAction,
  NetworkTunnelTypeEnum,
  useSoftGreTunnelActions } from '@acx-ui/rc/components'
import {
  useUpdateNetworkVenueMutation,
  useVenueDetailsHeaderQuery,
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
  useConfigTemplateQueryFnSwitcher,
  WifiRbacUrlsInfo,
  ConfigTemplateUrlsInfo,
  networkTypes,
  SupportNetworkTypes
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
import { TableResult, useTableQuery, getOpsApi, FILTER, SEARCH } from '@acx-ui/utils'

import { useTunnelColumn } from './useTunnelColumn'

import type { FormFinishInfo } from 'rc-field-form/es/FormContext'

const defaultRbacPayload = {
  searchString: '',
  searchTargetFields: ['name'],
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
  const isUseNewRbacNetworkVenueApi = useIsSplitOn(Features.WIFI_NETWORK_VENUE_QUERY)
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)

  const rbacTableQuery = useTableQuery({
    useQuery: isApCompatibilitiesByModel
      ? (isUseNewRbacNetworkVenueApi? useEnhanceVenueNetworkTableV2Query : useEnhanceVenueNetworkTableQuery)
      : useNewVenueNetworkTableQuery,
    defaultPayload: {
      ...defaultRbacPayload,
      isTemplate: isTemplate
    },
    search: {
      searchTargetFields: defaultRbacPayload.searchTargetFields as string[]
    },
    pagination: { settingsId },
    option: { skip: !venueId }
  })

  return rbacTableQuery
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
  const isSupport6gOWETransition = useIsSplitOn(Features.WIFI_OWE_TRANSITION_FOR_6G)
  const isIpSecOverNetworkEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  const isSupportActivationColumnSorting = useIsSplitOn(Features.WIFI_NETWORK_ACTIVATION_QUERY)

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

  const hasActivatePermission = hasPermission({ scopes: [WifiScopes.CREATE, WifiScopes.UPDATE] })
  const hasAddNetworkPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([addNetworkOpsApi])
    : (hasPermission({ scopes: [WifiScopes.CREATE] }) && hasCrossVenuesPermission())

  const hasActivateNetworkVenuePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([[ addNetworkVenueOpsAPi, deleteNetworkVenueOpsAPi]])
    : (hasActivatePermission)

  const hasUpdateNetworkVenuePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([updateNetworkVenueOpsAPi])
    : (hasActivatePermission)

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

  // hooks for tunnel column - start
  // for tunnel type data refetching
  const refetchFnRef = useRef({} as { [key: string]: () => void })
  const sdLanScopedNetworks = useSdLanScopedVenueNetworks(params.venueId, tableQuery.data?.data.map(item => item.id), refetchFnRef)
  const softGreTunnelActions = useSoftGreTunnelActions()
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

          setIsTableUpdating(true)
          addRbacNetworkVenue({
            params: apiParams,
            payload: newNetworkVenue,
            enableRbac: true,
            callback: () => setIsTableUpdating(false)
          })

        } else { // deactivate
          row.deepNetwork.venues.forEach((networkVenue) => {
            if (networkVenue.venueId === venueId) {
              const apiParams = {
                tenantId: params.tenantId,
                venueId,
                networkId: networkVenue.networkId,
                networkVenueId: networkVenue.id
              }

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

  /*
  const networkTypesOptions = [
    { key: NetworkTypeEnum.PSK, value: $t(networkTypes[NetworkTypeEnum.PSK]) },
    { key: NetworkTypeEnum.DPSK, value: $t(networkTypes[NetworkTypeEnum.DPSK]) },
    { key: NetworkTypeEnum.AAA, value: $t(networkTypes[NetworkTypeEnum.AAA]) },
    { key: NetworkTypeEnum.HOTSPOT20, value: $t(networkTypes[NetworkTypeEnum.HOTSPOT20]) },
    { key: NetworkTypeEnum.CAPTIVEPORTAL, value: $t(networkTypes[NetworkTypeEnum.CAPTIVEPORTAL]) },
    { key: NetworkTypeEnum.OPEN, value: $t(networkTypes[NetworkTypeEnum.OPEN]) }
  ]
  */
  const networkTypesOptions = SupportNetworkTypes.map((networkType: NetworkTypeEnum) => {
    return { key: networkType, value: $t(networkTypes[networkType]) }
  })

  const activatedOption = [
    { key: 'activated', value: $t({ defaultMessage: 'Activated' }) },
    { key: 'deactivated', value: $t({ defaultMessage: 'Deactivated' }) }
  ]

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
      searchable: true,
      render: function (_, row) {
        return !!row?.isOnBoarded ? <span>{row.name}</span> : getTenantLink(row)
      }
    },
    {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      filterable: networkTypesOptions,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    },
    {
      key: 'activated',
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      align: 'center',
      sorter: isSupportActivationColumnSorting,
      filterable: isSupportActivationColumnSorting && activatedOption,
      filterKey: 'venueApGroups.venueId',
      filterMultiple: false,
      filterPlaceholder: $t({ defaultMessage: 'Activated Status' }),
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
      enableRbac: true
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
        enableRbac: true
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

  const handleTableChange: TableProps<Network>['onChange'] = (
    pagination, filters, sorter, extra
  ) => {
    const customSorter = Array.isArray(sorter)
      ? sorter[0] : sorter

    tableQuery.handleTableChange?.(pagination, filters, customSorter, extra)

    const { columnKey, order } = customSorter
    if (columnKey === 'activated') {
      const { current, pageSize } = pagination
      const customPayload = {
        ...tableQuery.payload,
        page: current,
        pageSize,
        sortField: 'activated',
        sortOrder: order === 'ascend' ? 'ASC' : 'DESC',
        sortParameters: {
		      venueId: venueId!
	      }
      }
      tableQuery.setPayload(customPayload)
    }
  }

  const handleFilterChange = (
    customFilters: FILTER,
    customSearch: SEARCH
  ) => {
    let excludeFilters = {}
    let _customFilters = {
      ...customFilters
    }
    const activatedFilters = customFilters['venueApGroups.venueId']
    if (activatedFilters) {
      const isActivated = activatedFilters[0] === 'activated'
      if (isActivated) {
        _customFilters = {
          ...customFilters,
          'venueApGroups.venueId': [venueId!]
        }
      } else {
        _customFilters = omit(customFilters, ['venueApGroups.venueId'])
        excludeFilters = {
          'venueApGroups.venueId': [venueId!]
        }
      }
    }

    const customPayload = {
      ...tableQuery.payload,
      ...customSearch,
      filters: _customFilters,
      excludeFilters: excludeFilters
    }

    tableQuery.setPayload(customPayload)
  }

  const isFetching = isTableUpdating
    || isAddRbacNetworkUpdating || isDeleteRbacNetworkUpdating

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
        onChange={handleTableChange}
        onFilterChange={handleFilterChange}
        enableApiFilter={true}
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
      {tunnelModalState.visible &&
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
