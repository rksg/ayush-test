import { useEffect, useState } from 'react'

import { Empty, Space }        from 'antd'
import { clone, get, isEmpty } from 'lodash'
import { DndProvider }         from 'react-dnd'
import { HTML5Backend }        from 'react-dnd-html5-backend'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Button, Loader, showActionModal }                                                                                                       from '@acx-ui/components'
import { BulbOutlined }                                                                                                                          from '@acx-ui/icons'
import { useAddFloorPlanMutation, useDeleteFloorPlanMutation, useFloorPlanListQuery, useGetAllDevicesQuery, useUpdateFloorPlanMutation }         from '@acx-ui/rc/services'
import { FloorPlanDto, FloorPlanFormDto, NetworkDevice, NetworkDevicePayload, NetworkDevicePosition, NetworkDeviceType, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'

import AddEditFloorplanModal from './FloorPlanModal'
import GalleryView           from './GalleryView/GalleryView'
import PlainView             from './PlainView/PlainView'
import * as UI               from './styledComponents'


export function sortByFloorNumber (floor1: FloorPlanDto, floor2: FloorPlanDto) {
  if (floor1.floorNumber < floor2.floorNumber) {
    return -1
  }
  if (floor1.floorNumber > floor2.floorNumber) {
    return 1
  }
  return 0
}

export function FloorPlan () {
  const params = useParams()
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
  const [allNetworkdDevices, setAllNeworkDevices] = useState<any>()
  const [unplacedDevicesCount, setUnplacedDevicesCount] = useState<number>(0)

  const defaultDevices = {
    ap: [],
    switches: [],
    LTEAP: [],
    RogueAP: [],
    cloudpath: [],
    DP: []
  } as TypeWiseNetworkDevices

  const networkDevicePayload: NetworkDevicePayload = {
    // eslint-disable-next-line max-len
    fields: ['id', 'name', 'switchName', 'deviceStatus', 'serialNumber', 'rogueCategory', 'floorplanId', 'xPercent', 'yPercent'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const [networkDevicesVisibility, setNetworkDevicesVisibility] = useState<NetworkDeviceType[]>([])

  const getNetworkDevices = useGetAllDevicesQuery({ params, payload: networkDevicePayload })

  useEffect(() => {
    setFloorPlans([])
    if(floorPlanQuery?.data){
      const queryData: FloorPlanDto[] = clone(floorPlanQuery?.data)
      queryData.sort(sortByFloorNumber)
      const _selectedFP = updatedFloorPlanName ?
        queryData.filter((floor) => floor.name === updatedFloorPlanName)[0]
        : queryData[0]

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
          continue // rouge ap is not controlled(placed) by user
        }
        const _deviceType = deviceType as keyof typeof NetworkDeviceType
        const networkDevicetype = NetworkDeviceType[_deviceType] as NetworkDeviceType
        _networkDevicesVisibility.push(networkDevicetype)
      }
      setNetworkDevicesVisibility(_networkDevicesVisibility)
      loadNetworkDevices()
    }

    if (getNetworkDevices?.data?.data){
      const allDevices = getNetworkDevices?.data?.data
      setAllNeworkDevices(allDevices)
    }
  }, [selectedFloorPlan, getNetworkDevices?.data])


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

      setUnplacedDevicesCount(getUnplacedDevicesCount(typeWiseUnplacedNetworkDevices))

      setDevicesByFlooplanId(floorplansDevices)

    }
  }

  function getUnplacedDevicesCount (unplacedDevices: TypeWiseNetworkDevices): number {
    const apsCount = get(unplacedDevices, 'ap.length', 0)
    const switchesCount = get(unplacedDevices, 'switches.length', 0)
    const lteApsCount = get(unplacedDevices, 'LTEAP.length', 0)
    const coudpathsCount = get(unplacedDevices, 'cloudpath.length', 0)
    return apsCount + switchesCount + lteApsCount + coudpathsCount
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
    console.log(device)
  }

  return (
    <Loader states={[floorPlanQuery,
      { isLoading: false, isFetching: isDeleteFloorPlanUpdating },
      { isLoading: false, isFetching: isAddFloorPlanUpdating },
      { isLoading: false, isFetching: isUpdateFloorPlanUpdating }
    ]}>
      {floorPlans?.length ?
        <UI.FloorPlanContainer>
          { showGalleryView ?
            <DndProvider backend={HTML5Backend}> <GalleryView
              floorPlans={floorPlans ?? []}
              onFloorPlanClick={onFloorPlanClick}
              networkDevices={devicesByFlooplanId}
              networkDevicesVisibility={networkDevicesVisibility}/>
            </DndProvider>
            : <DndProvider backend={HTML5Backend}><PlainView
              setCoordinates={setCoordinates}
              floorPlans={floorPlans ?? []}
              toggleGalleryView={galleryViewHandler}
              defaultFloorPlan={!isEmpty(selectedFloorPlan) ? selectedFloorPlan : floorPlans[0]}
              deleteFloorPlan={onDeleteFloorPlan}
              onAddEditFloorPlan={onAddEditFloorPlan}
              networkDevices={devicesByFlooplanId}
              networkDevicesVisibility={networkDevicesVisibility}/>
            </DndProvider>
          }
          <UI.StyledSpace size={24}>
            <AddEditFloorplanModal
              buttonTitle={$t({ defaultMessage: '+ Add Floor Plan' })}
              onAddEditFloorPlan={onAddEditFloorPlan}
              isEditMode={false}/>
            <Button size='small' type='link' disabled={unplacedDevicesCount ? false : true}>
              {$t({ defaultMessage: 'Unplaced Devices ({unplacedDevicesCount})' },
                { unplacedDevicesCount })}
            </Button>
          </UI.StyledSpace>
        </UI.FloorPlanContainer>
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
          <AddEditFloorplanModal
            buttonTitle={$t({ defaultMessage: 'Add Floor Plan' })}
            onAddEditFloorPlan={onAddEditFloorPlan}
            isEditMode={false}/>
        </UI.EpmtyFloorplanContainer>
      }
    </Loader>
  )
}
