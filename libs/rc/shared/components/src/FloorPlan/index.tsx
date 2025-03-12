import { createContext, useEffect, useState } from 'react'

import { Alert, Dropdown, Empty, Space }    from 'antd'
import { clone, get, isEmpty }              from 'lodash'
import { DndProvider }                      from 'react-dnd'
import { HTML5Backend }                     from 'react-dnd-html5-backend'
import { useIntl }                          from 'react-intl'
import { Location, useLocation, useParams } from 'react-router-dom'

import { Button, Loader, showActionModal }                 from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { BulbOutlined, EyeOpenOutlined, EyeSlashOutlined } from '@acx-ui/icons'
import {
  useAddFloorPlanMutation, useApListQuery, useDeleteFloorPlanMutation,
  useFloorPlanListQuery, useGetAllDevicesQuery, useGetVenueRogueApQuery,
  useRemoveApPositionMutation,
  useUpdateApPositionMutation,
  useUpdateFloorPlanMutation,
  useUpdateRwgPositionMutation,
  useUpdateSwitchPositionMutation } from '@acx-ui/rc/services'
import {
  APMeshRole,
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  FloorPlanDto, FloorPlanFormDto, NetworkDevice, NetworkDevicePayload,
  NetworkDevicePosition,
  NetworkDeviceType,
  SwitchRbacUrlsInfo,
  TypeWiseNetworkDevices,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'
import {
  RolesEnum,
  SwitchScopes,
  WifiScopes
}            from '@acx-ui/types'
import {
  getUserProfile,
  hasAllowedOperations,
  hasPermission,
  hasRoles,
  useUserProfileContext
} from '@acx-ui/user'
import {
  getOpsApi,
  TABLE_QUERY_POLLING_INTERVAL,
  useTrackLoadTime,
  widgetsMapping
}                   from '@acx-ui/utils'

import AddEditFloorplanModal from './FloorPlanModal'
import GalleryView           from './GalleryView/GalleryView'
import PlainView             from './PlainView/PlainView'
import * as UI               from './styledComponents'
import { UnplacedDevices }   from './UnplacedDevices'



export function sortByFloorNumber (floor1: FloorPlanDto, floor2: FloorPlanDto) {
  if (floor1.floorNumber < floor2.floorNumber) {
    return -1
  }
  if (floor1.floorNumber > floor2.floorNumber) {
    return 1
  }
  return 0
}

export const NetworkDeviceContext = createContext<Function | null>(null)

export function FloorPlan () {
  const params = useParams()
  const location: Location = useLocation()
  const { rbacOpsApiEnabled } = getUserProfile()

  const floorPlanQuery = useFloorPlanListQuery({ params })
  const { $t } = useIntl()
  const [showGalleryView, setShowGalleryView] = useState(false)

  const [floorPlans, setFloorPlans] = useState<FloorPlanDto[]>([] as FloorPlanDto[])
  const [selectedFloorPlan, setSelectedFloorPlan] = useState({} as FloorPlanDto)
  const [updatedFloorPlanName, setUpdatedFloorPlanName] = useState<string>()
  const [devicesByFlooplanId, setDevicesByFlooplanId] = useState<{
    [key: string]: TypeWiseNetworkDevices
}>({} as {
  [key: string]: TypeWiseNetworkDevices
})
  const [unplacedDevicesCount, setUnplacedDevicesCount] = useState<number>(0)
  const [unplacedDevicesState, setUnplacedDevicesState]
  = useState<TypeWiseNetworkDevices>({} as TypeWiseNetworkDevices)
  const [closeOverlay, setCloseOverlay] = useState<boolean>(false)
  const [showRogueAp, setShowRogueAp] = useState<boolean>(false)
  const [deviceList, setDeviceList] = useState<TypeWiseNetworkDevices>({} as TypeWiseNetworkDevices)
  const isApMeshTopologyFFOn = useIsSplitOn(Features.AP_MESH_TOPOLOGY)
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const defaultDevices = {
    ap: [],
    switches: [],
    LTEAP: [],
    RogueAP: [],
    DP: [],
    rwg: []
  } as TypeWiseNetworkDevices

  const clearDevicePositionValues: NetworkDevicePosition = {
    floorplanId: '',
    xPercent: 0,
    yPercent: 0
  }

  const networkDevicePayload: NetworkDevicePayload = {
    // eslint-disable-next-line max-len
    fields: ['id', 'name', 'switchName', 'deviceStatus', 'serialNumber', 'rogueCategory', 'floorplanId', 'xPercent', 'yPercent'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const [networkDevicesVisibility, setNetworkDevicesVisibility] = useState<NetworkDeviceType[]>([])
  const { isCustomRole } = useUserProfileContext()
  const showRwgDevice = useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const rwgHasPermission = hasRoles([RolesEnum.PRIME_ADMIN,
    RolesEnum.ADMINISTRATOR,
    RolesEnum.READ_ONLY]) || isCustomRole
  const getNetworkDevices = useGetAllDevicesQuery({ params: { ...params,
    showRwgDevice: '' + (showRwgDevice && rwgHasPermission)
  },
  payload: networkDevicePayload },
  {
    pollingInterval: TABLE_QUERY_POLLING_INTERVAL
  })

  const { data: apsList } = useApListQuery({
    params, payload: {
      fields: ['serialNumber', 'meshRole'],
      filters: { venueId: [params.venueId] }
    },
    enableRbac: isUseWifiRbacApi
  }, { skip: !isApMeshTopologyFFOn,
    pollingInterval: TABLE_QUERY_POLLING_INTERVAL })

  // Set mesh role for unplaced AP
  useEffect(() => {
    if (!isApMeshTopologyFFOn || !apsList?.data || isEmpty(unplacedDevicesState.ap)) return

    if (unplacedDevicesState.ap.some(ap => ap.meshRole)) return //XXX  Don't proceed if there is any AP has been set the mesh role

    const apDevices = [...unplacedDevicesState.ap]

    apDevices.forEach((apDevice: NetworkDevice) => {
      const apWithMeshRole = apsList.data.find(ap => ap.serialNumber === apDevice.serialNumber)
      apDevice.meshRole = apWithMeshRole?.meshRole as APMeshRole
    })

    setUnplacedDevicesState({
      ...unplacedDevicesState,
      ap: apDevices
    })

  }, [isApMeshTopologyFFOn, apsList?.data, unplacedDevicesState])

  useEffect(() => {
    setFloorPlans([])
    if(floorPlanQuery?.data){
      const queryData: FloorPlanDto[] = clone(floorPlanQuery?.data)
      queryData.sort(sortByFloorNumber)
      const _selectedFP = updatedFloorPlanName ?
        queryData.filter((floor) => floor.name === updatedFloorPlanName)[0]
        : (location?.state) ? (location.state as {
            param: { floorplan: FloorPlanDto }
        }).param?.floorplan : queryData[0]

      setTimeout(() => {
        setFloorPlans(queryData)
        setSelectedFloorPlan(_selectedFP)
      }, 200)
    }
  }, [floorPlanQuery?.data])

  useEffect(() => {
    if (floorPlans.length) {
      const _networkDevicesVisibility: NetworkDeviceType[] = [...networkDevicesVisibility]
      for (let deviceType in NetworkDeviceType) {
        if (deviceType === NetworkDeviceType.rogue_ap) {
          continue // rogue ap is not controlled(placed) by user
        }
        const _deviceType = deviceType as keyof typeof NetworkDeviceType
        const networkDevicetype = NetworkDeviceType[_deviceType] as NetworkDeviceType
        _networkDevicesVisibility.push(networkDevicetype)
      }
      setNetworkDevicesVisibility(_networkDevicesVisibility)
      loadNetworkDevices()
    }

  }, [selectedFloorPlan, getNetworkDevices?.data])

  useTrackLoadTime({
    itemName: widgetsMapping.FLOOR_PLAN,
    states: [floorPlanQuery],
    isEnabled: isMonitoringPageEnabled
  })

  const [
    deleteFloorPlan,
    { isLoading: isDeleteFloorPlanUpdating }
  ] = useDeleteFloorPlanMutation()

  const [
    addFloorPlan,
    { isLoading: isAddFloorPlanUpdating }
  ] = useAddFloorPlanMutation()

  const [
    updateFloorPlan,
    { isLoading: isUpdateFloorPlanUpdating }
  ] = useUpdateFloorPlanMutation()

  const [
    updateSwitchPosition,
    { isLoading: isUpdateSwitchPosition }
  ] = useUpdateSwitchPositionMutation()

  const [
    updateApPosition,
    { isLoading: isUpdateApPosition }
  ] = useUpdateApPositionMutation()

  const [
    removeApPosition,
    { isLoading: isRemoveApPosition }
  ] = useRemoveApPositionMutation()

  const [
    updateRwgPosition,
    { isLoading: isUpdateRwgPosition }
  ] = useUpdateRwgPositionMutation()

  const { data: venueRogueApData } = useGetVenueRogueApQuery({ params })

  const galleryViewHandler = () => {
    setShowGalleryView(true)
  }

  const onFloorPlanClick = (selectedFloorPlan: FloorPlanDto) => {
    setSelectedFloorPlan(selectedFloorPlan)
    setShowGalleryView(false)
  }

  const loadNetworkDevices = async () => {

    if (getNetworkDevices?.data) {
      const _devices = getNetworkDevices?.data?.data[0]

      setDeviceList(_devices as TypeWiseNetworkDevices)

      let devices = { ..._devices }
      const networkDeviceTypeArray = Object.values(NetworkDeviceType)
      let typeWisePlacedNetworkDevices: TypeWiseNetworkDevices = { ...defaultDevices }
      let typeWiseUnplacedNetworkDevices: TypeWiseNetworkDevices = { ...defaultDevices }
      let floorplansDevices: { [key: string]: TypeWiseNetworkDevices } = {}
      for (const type of networkDeviceTypeArray) {
        if (type === NetworkDeviceType.lte_ap) {
          continue
        }
        if (devices && !devices[type]) {
          devices[type] = [] as NetworkDevice[]
        }

        devices[type] = devices[type].map((device: NetworkDevice) => ({
          ...device,
          networkDeviceType: type
        }))

        extractPlacedDevices(type, devices[type],
          typeWisePlacedNetworkDevices, typeWiseUnplacedNetworkDevices)

        await preparePlacedDevicePosition(type, typeWisePlacedNetworkDevices)
        if (!isEmpty(typeWisePlacedNetworkDevices[type]))
          await prepareFloorplansDevicesObject(type, typeWisePlacedNetworkDevices,
            floorplansDevices)
      }

      setUnplacedDevicesState(typeWiseUnplacedNetworkDevices)
      setUnplacedDevicesCount(getUnplacedDevicesCount(typeWiseUnplacedNetworkDevices))

      setDevicesByFlooplanId(floorplansDevices)

    }
  }

  function getUnplacedDevicesCount (unplacedDevices: TypeWiseNetworkDevices): number {
    const apsCount = get(unplacedDevices, 'ap.length', 0)
    const switchesCount = get(unplacedDevices, 'switches.length', 0)
    const lteApsCount = get(unplacedDevices, 'LTEAP.length', 0)
    const rwgCount = get(unplacedDevices, 'rwg.length', 0)
    return apsCount + switchesCount + lteApsCount + rwgCount
  }

  const extractPlacedDevices = (deviceType: NetworkDeviceType,
    devices: NetworkDevice[],
    typeWisePlacedNetworkDevices: TypeWiseNetworkDevices,
    typeWiseUnplacedNetworkDevices: TypeWiseNetworkDevices) => {
    const _placedDevices: NetworkDevice[] = []
    const _unplacedDevices: NetworkDevice[] = []

    devices.forEach((device) => {
      if (!isEmpty(device.floorplanId)) {
        _placedDevices.push(device)
      } else {
        _unplacedDevices.push(device)
      }
    })

    typeWisePlacedNetworkDevices[deviceType] = _placedDevices
    typeWiseUnplacedNetworkDevices[deviceType] = _unplacedDevices

  }

  const preparePlacedDevicePosition = async (deviceType: NetworkDeviceType,
    typeWisePlacedNetworkDevices: TypeWiseNetworkDevices) => {
    const _typeWisePlacedNetworkDevices: NetworkDevice[] =
    typeWisePlacedNetworkDevices[deviceType].map(device => { return ({
      ...device,
      position: {
        floorplanId: device.floorplanId,
        xPercent: device.xPercent,
        yPercent: device.yPercent
      } as NetworkDevicePosition
    })})

    typeWisePlacedNetworkDevices[deviceType] = _typeWisePlacedNetworkDevices

  }

  const prepareFloorplansDevicesObject = async (deviceType: NetworkDeviceType,
    typeWisePlacedNetworkDevices: TypeWiseNetworkDevices,
    floorplansDevices: { [key: string]: TypeWiseNetworkDevices }) => {

    floorPlans.forEach(async (floorplan: FloorPlanDto) => {

      const targetDevices = typeWisePlacedNetworkDevices[deviceType]
        .filter((device: NetworkDevice) =>
          get(device, 'position.floorplanId') === floorplan.id)

      if (!isEmpty(targetDevices)) {
        floorplansDevices[floorplan.id] = { ...defaultDevices, ...floorplansDevices[floorplan.id] }
        floorplansDevices[floorplan.id][deviceType] = targetDevices
      }

    })
  }

  const onDeleteFloorPlan = (floorPlanId: string, floorPlanName: string) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Floor Plan' }),
        entityValue: floorPlanName
      },
      onOk: () => deleteFloorPlan({ params: { ...params, floorPlanId } })
    })
  }

  const onAddEditFloorPlan = async (floorPlan: FloorPlanFormDto, isEditMode: boolean) => {

    setUpdatedFloorPlanName(floorPlan.name)

    isEditMode ?
      updateFloorPlan({ params: { ...params, floorPlanId: floorPlan.id } , payload: floorPlan })
      : addFloorPlan({ params: { ...params } , payload: floorPlan })
  }

  const setCoordinates = function (device: NetworkDevice) {
    publishDevicePositionUpdate(device, false)
  }


  function publishDevicePositionUpdate (device: NetworkDevice, clear: boolean) {
    switch (device.networkDeviceType) {
      case NetworkDeviceType.ap:
      case NetworkDeviceType.lte_ap:
        if(clear && isUseWifiRbacApi) {
          removeApPosition({
            params: {
              ...params,
              floorplanId: device.floorplanId,
              serialNumber: device.serialNumber
            }
          })
        } else {
          updateApPosition({
            params: {
              ...params,
              floorplanId: device.position?.floorplanId,
              serialNumber: device.serialNumber
            },
            payload: (clear ? clearDevicePositionValues : device.position),
            enableRbac: isUseWifiRbacApi
          })
        }
        break
      case NetworkDeviceType.switch:
        updateSwitchPosition({ params: { ...params, serialNumber: device.serialNumber },
          enableRbac: isSwitchRbacEnabled,
          payload: clear ? clearDevicePositionValues : device.position })
        break
      case NetworkDeviceType.rwg:
        updateRwgPosition({ params: { ...params, gatewayId: device.id },
          payload: clear ? clearDevicePositionValues : device.position })
    }
  }

  function clearDevice (device: NetworkDevice) {
    publishDevicePositionUpdate(device, true)
  }

  const _props = {
    unplacedDevicesState: unplacedDevicesState
  }

  function closeDropdown () {
    setCloseOverlay(!closeOverlay)
  }

  function onVisibleChange (flag: boolean) {
    setCloseOverlay(flag)
  }

  function showRogueAps () {
    setShowRogueAp(!showRogueAp)
  }

  return (
    <Loader states={[floorPlanQuery,
      { isLoading: false, isFetching: isDeleteFloorPlanUpdating },
      { isLoading: false, isFetching: isAddFloorPlanUpdating },
      { isLoading: false, isFetching: isUpdateFloorPlanUpdating },
      { isLoading: false, isFetching: isUpdateSwitchPosition },
      { isLoading: false, isFetching: isUpdateApPosition || isRemoveApPosition },
      { isLoading: false, isFetching: isUpdateRwgPosition }
    ]}>
      {floorPlans?.length ?
        <NetworkDeviceContext.Provider value={clearDevice}>
          { !(deviceList?.ap?.length + deviceList?.switches?.length)
          && <Space direction='vertical'>
            <Alert
              // eslint-disable-next-line max-len
              message={$t({ defaultMessage: 'This <venueSingular></venueSingular> contains no networking device' })}
              type='info'
              icon={<UI.BulbOutlinedIcon />}
              showIcon
              action={
                <Space direction='horizontal'>
                  { hasPermission({ scopes: [WifiScopes.CREATE],
                    rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.addAp)]
                  }) && <TenantLink to='devices/wifi/add'>
                    <Button size='small' type='primary'>
                      {$t({ defaultMessage: 'Add AP' })}
                    </Button>
                  </TenantLink>
                  }
                  { hasPermission({ scopes: [SwitchScopes.CREATE],
                    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.addSwitch)]
                  }) && <TenantLink to='devices/switch/add'>
                    <Button size='small' type='primary'>
                      {$t({ defaultMessage: 'Add Switch' })}
                    </Button>
                  </TenantLink>}
                </Space>
              }
            />
          </Space>
          }
          <DndProvider backend={HTML5Backend}>
            <UI.FloorPlanContainer style={{
              backgroundColor: (!showGalleryView && showRogueAp) ? 'rgba(0, 0, 0, 0.4)' : ''
            }}>
              { showGalleryView ?
                <GalleryView
                  setCoordinates={setCoordinates}
                  floorPlans={floorPlans ?? []}
                  onFloorPlanClick={onFloorPlanClick}
                  networkDevices={devicesByFlooplanId}
                  showRogueAp={showRogueAp}
                  networkDevicesVisibility={networkDevicesVisibility}/>
                : <PlainView
                  setCoordinates={setCoordinates}
                  floorPlans={floorPlans ?? []}
                  toggleGalleryView={galleryViewHandler}
                  defaultFloorPlan={!isEmpty(selectedFloorPlan) ? selectedFloorPlan : floorPlans[0]}
                  deleteFloorPlan={onDeleteFloorPlan}
                  onAddEditFloorPlan={onAddEditFloorPlan}
                  networkDevices={devicesByFlooplanId}
                  networkDevicesVisibility={networkDevicesVisibility}
                  showRogueAp={showRogueAp}/>
              }
              { <UI.StyledSpace size={24}>
                { venueRogueApData?.enabled && <UI.RogueApButton key='rogueApBtn'
                  size='small'
                  type='link'
                  icon={showRogueAp ? <EyeSlashOutlined/> : <EyeOpenOutlined/>}
                  onClick={showRogueAps} >
                  {showRogueAp ? $t({ defaultMessage: 'Hide Rogue APs' })
                    : $t({ defaultMessage: 'View Rogue APs' })}
                </UI.RogueApButton> }
                {(
                  rbacOpsApiEnabled?
                    hasAllowedOperations([getOpsApi(CommonUrlsInfo.addFloorplan)])
                    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
                ) &&
                  <AddEditFloorplanModal
                    buttonTitle={$t({ defaultMessage: '+ Add Floor Plan' })}
                    onAddEditFloorPlan={onAddEditFloorPlan}
                    isEditMode={false}/>
                }
                {
                  hasPermission({
                    scopes: [WifiScopes.UPDATE, SwitchScopes.UPDATE],
                    rbacOpsIds: [
                      getOpsApi(CommonRbacUrlsInfo.UpdateSwitchPosition),
                      getOpsApi(CommonRbacUrlsInfo.UpdateApPosition)
                    ]
                  }) &&
                  <Dropdown trigger={['click']}
                    onVisibleChange={onVisibleChange}
                    visible={closeOverlay}
                    disabled={
                      (!showGalleryView && unplacedDevicesCount && !showRogueAp) ? false : true}
                    overlay={
                      <UnplacedDevices {..._props} closeDropdown={closeDropdown}/>}>
                    <Button
                      size='small'
                      type='link'>
                      {$t({ defaultMessage: 'Unplaced Devices ({unplacedDevicesCount})' },
                        { unplacedDevicesCount })}
                    </Button>
                  </Dropdown>
                }
              </UI.StyledSpace>
              }
            </UI.FloorPlanContainer>
          </DndProvider>
        </NetworkDeviceContext.Provider>
        :
        <UI.EpmtyFloorplanContainer>
          <Empty description={
            <Space><BulbOutlined />
              {$t({
                defaultMessage:
                // eslint-disable-next-line max-len
                'You can place your devices on floor plans or map to view their geographical distribution'
              })}
            </Space>}>
          </Empty>
          {(
            rbacOpsApiEnabled?
              hasAllowedOperations([ getOpsApi(CommonUrlsInfo.addFloorplan) ]) :
              hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
          ) && <AddEditFloorplanModal
            buttonTitle={$t({ defaultMessage: 'Add Floor Plan' })}
            onAddEditFloorPlan={onAddEditFloorPlan}
            isEditMode={false}/>
          }
        </UI.EpmtyFloorplanContainer>
      }
    </Loader>
  )
}
