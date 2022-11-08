import React, { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Input, Row, Select, Space, Tooltip, Typography } from 'antd'
import { DefaultOptionType }                                         from 'antd/lib/select'
import { isEqual, omit, omitBy, pick }                               from 'lodash'
import { useIntl }                                                   from 'react-intl'

import {
  Button,
  GoogleMap,
  GoogleMapMarker,
  PageHeader,
  Loader,
  Modal,
  showToast,
  showActionModal,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  useApListQuery,
  useAddApMutation,
  useGetApQuery,
  useLazyApGroupListQuery,
  useLazyGetDhcpApQuery,
  useUpdateApMutation,
  useVenuesListQuery,
  useWifiCapabilitiesQuery
} from '@acx-ui/rc/services'
import {
  ApDeep,
  ApDhcpRoleEnum,
  APMeshRole,
  apNameRegExp,
  checkObjectNotExists,
  checkValues,
  DeviceGps,
  DhcpApInfo,
  DhcpModeEnum,
  gpsRegExp,
  hasGraveAccentAndDollarSign,
  serialNumberRegExp,
  // Venue,
  VenueExtended,
  WifiNetworkMessages
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { validationMessages } from '@acx-ui/utils'

import { ApEditContext } from '../ApEdit/index'

import * as UI from './styledComponents'

const defaultPayload = {
  fields: ['name', 'country', 'latitude', 'longitude', 'dhcp', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const defaultApPayload = {
  fields: ['serialNumber', 'name', 'venueId'],
  pageSize: 10000
}

export function ApForm () {
  const { $t } = useIntl()
  const isApGpsFeatureEnabled = useIsSplitOn(Features.AP_GPS)
  const { tenantId, action, serialNumber } = useParams()
  const formRef = useRef<StepsFormInstance<ApDeep>>()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')
  const isEditMode = action === 'edit'

  const {
    editContextData,
    setEditContextData
  } = useContext(ApEditContext)

  const apList = useApListQuery({ params: { tenantId }, payload: defaultApPayload })
  const { data: venuesList, isLoading: isVenuesListLoading }
    = useVenuesListQuery({ params: { tenantId }, payload: defaultPayload })
  const [apGroupList] = useLazyApGroupListQuery()
  const apDetails = useGetApQuery({ params: {
    tenantId, serialNumber: serialNumber ? serialNumber : '' } })

  const [selectedVenue, setSelectedVenue] = useState({} as unknown as VenueExtended)
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [apGroupOption, setApGroupOption] = useState([] as DefaultOptionType[])
  const [gpsModalVisible, setGpsModalVisible] = useState(false)
  const [deviceGps, setDeviceGps] = useState(null as unknown as DeviceGps)

  const [addAp] = useAddApMutation()
  const [updateAp, { isLoading: isApDetailsUpdating }] = useUpdateApMutation()

  const [getDhcpAp] = useLazyGetDhcpApQuery()
  const wifiCapabilities = useWifiCapabilitiesQuery({ params: { tenantId } })
  const [dhcpRoleDisabled, setDhcpRoleDisabled] = useState(false)
  const [apMeshRoleDisabled, setApMeshRoleDisabled] = useState(false)
  const [cellularApModels, setCellularApModels] = useState([] as string[])

  useEffect(() => {
    if (!wifiCapabilities.isLoading) {
      setCellularApModels(wifiCapabilities?.data?.apModels
        ?.filter(apModel => apModel.canSupportCellular)
        .map(apModel => apModel.model) ?? [])
    }
  }, [wifiCapabilities])

  useEffect(() => {
    if (!apDetails.isLoading && apDetails?.data && isEditMode) {
      const setData = async (apDetails: ApDeep) => {
        const selected = getVenueById(
          venuesList?.data as unknown as VenueExtended[], apDetails.venueId)
        const options = await getApGroupOptions(apDetails.venueId)
        const dhcpAp = (await getDhcpAp({
          params: { tenantId }, payload: [serialNumber] }, true).unwrap())?.response?.[0]
        setSelectedVenue(selected as unknown as VenueExtended)
        setApGroupOption(options as DefaultOptionType[])
        setApMeshRoleDisabled(
          !!apDetails?.meshRole && (apDetails?.meshRole !== APMeshRole.DISABLED))
        setDhcpRoleDisabled(checkDhcpRoleDisabled(dhcpAp as DhcpApInfo))
        setDeviceGps((apDetails?.deviceGps ?? null) as unknown as DeviceGps)
        formRef?.current?.setFieldsValue(apDetails)
      }

      setData(apDetails.data)
    }
  }, [apDetails])

  useEffect(() => {
    if (!isVenuesListLoading) {
      setVenueOption(venuesList?.data?.map(item => ({
        label: item.name, value: item.id
      })) ?? [])
    }
  }, [venuesList])

  const handleAddAp = async (values: ApDeep) => {
    try {
      const payload = [{
        ...omit(values, 'deviceGps'),
        ...(deviceGps && { deviceGps: deviceGps })
      }]
      await addAp({ params: { tenantId: tenantId }, payload }).unwrap()
      navigate(`${basePath.pathname}/aps`, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleUpdateAp = async (values: ApDeep) => {
    try {
      const payload = {
        ...values,
        deviceGps: transformLatLng(values?.deviceGps as string)
      }
      await updateAp({ params: { tenantId, serialNumber }, payload }).unwrap()
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const getApGroupOptions = async (venueId: string) => {
    const list = venueId
      ? (await apGroupList({ params: { tenantId, venueId } }, true)).data
      : []

    return venueId && list?.length
      ? list?.map((item) => ({
        label: !item.isDefault
          ? item.name
          : $t({ defaultMessage: 'No group (inherit from Venue)' }),
        value: item.isDefault && !isEditMode ? null : item.id
      })) : [{
        label: $t({ defaultMessage: 'No group (inherit from Venue)' }),
        value: null
      }]
  }

  const handleVenueChange = async (value: string) => {
    const selected = getVenueById(venuesList?.data as unknown as VenueExtended[], value)
    const options = await getApGroupOptions(value)
    setSelectedVenue(selected as unknown as VenueExtended)
    setApGroupOption(options as DefaultOptionType[])
    setDeviceGps(null as unknown as DeviceGps)
    formRef?.current?.setFieldValue('apGroupId', options?.[0]?.value ?? (value ? null : ''))
  }

  const onSaveCoordinates = (latLng: DeviceGps) => {
    setDeviceGps(latLng)
    setGpsModalVisible(false)
    handleUpdateContext()

    if (!latLng) {
      formRef?.current?.setFieldValue('deviceGps', latLng)
    }
  }

  const handleUpdateContext = () => {
    if (isEditMode) {
      setEditContextData && setEditContextData({
        ...editContextData,
        tabTitle: $t({ defaultMessage: 'AP Details' }),
        isDirty: getFormDirty(formRef?.current as StepsFormInstance, apDetails?.data as ApDeep),
        hasError: getFormValid(formRef?.current as StepsFormInstance),
        updateChanges: () => handleUpdateAp(formRef?.current?.getFieldsValue() as ApDeep)
      })
    }
  }

  return <>
    {!isEditMode && <PageHeader
      title={$t({ defaultMessage: 'Add AP' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Access Points' }), link: '/devices/aps' }
      ]}
    />}
    <StepsForm
      formRef={formRef}
      onFinish={
        !isEditMode
          ? handleAddAp
          : handleUpdateAp
      }
      onFormChange={handleUpdateContext}
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/aps`
      })}
      buttonLabel={{
        submit: !isEditMode
          ? $t({ defaultMessage: 'Add' })
          : $t({ defaultMessage: 'Apply' })
      }}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={8}>
            <Loader states={[{
              isLoading: isVenuesListLoading || apDetails.isLoading,
              isFetching: isApDetailsUpdating
            }]}>
              <Form.Item
                name='venueId'
                label={<>
                  {$t({ defaultMessage: 'Venue' })}
                  {(apMeshRoleDisabled || dhcpRoleDisabled) && <Tooltip
                    title={
                      apMeshRoleDisabled
                        ? $t(WifiNetworkMessages.AP_VENUE_MESH_DISABLED_TOOLTIP)
                        : (dhcpRoleDisabled
                          ? $t(WifiNetworkMessages.AP_VENUE_DHCP_DISABLED_TOOLTIP)
                          : ''
                        )
                    }
                    placement='bottom'
                  >
                    <QuestionMarkCircleOutlined />
                  </Tooltip>}
                </>}
                initialValue={null}
                rules={[{
                  required: true
                }, {
                  validator: (_, value) => {
                    const selected = getVenueById(
                      venuesList?.data as unknown as VenueExtended[], value
                    )
                    const originalVenue = getVenueById(
                      venuesList?.data as unknown as VenueExtended[],
                      apDetails?.data?.venueId as string
                    )
                    if (selected?.country && originalVenue?.country) {
                      return checkValues(selected?.country, originalVenue?.country, true)
                    }
                    return Promise.resolve()
                  },
                  message: $t(validationMessages.diffVenueCountry)
                }, {
                  validator: (_, value) => {
                    const selectedVenue = getVenueById(
                      venuesList?.data as unknown as VenueExtended[], value)
                    if (selectedVenue?.dhcp && selectedVenue?.dhcp?.enabled) {
                      return checkObjectNotExists(
                        cellularApModels, apDetails?.data?.model, $t({ defaultMessage: 'Venue' })
                      )
                    }
                    return Promise.resolve()
                  },
                  message: $t(validationMessages.cellularApDhcpLimitation)
                }]}
                children={<Select
                  disabled={apMeshRoleDisabled || dhcpRoleDisabled}
                  options={[
                    { label: $t({ defaultMessage: 'Select venue...' }), value: null },
                    ...venueOption
                  ]}
                  onChange={async (value) => await handleVenueChange(value)}
                />}
              />
              <Form.Item
                name='apGroupId'
                label={$t({ defaultMessage: 'AP Group' })}
                initialValue={null}
                children={<Select
                  disabled={!selectedVenue || apGroupOption?.length < 2}
                  options={selectedVenue?.id ? apGroupOption : []}
                />}
              />
              <Form.Item
                name='name'
                label={<>
                  {$t({ defaultMessage: 'AP Name' })}
                  <Tooltip
                    title={$t(WifiNetworkMessages.AP_NAME_TOOLTIP)}
                    placement='bottom'
                  >
                    <QuestionMarkCircleOutlined />
                  </Tooltip>
                </>}
                rules={[
                  { required: true },
                  { min: 2, transform: (value) => value.trim() },
                  { max: 32, transform: (value) => value.trim() },
                  { validator: (_, value) => checkValues(value, 'aaaa') },
                  { validator: (_, value) => hasGraveAccentAndDollarSign(value) },
                  { validator: (_, value) => apNameRegExp(value) },
                  {
                    validator: (_, value) => {
                      const nameList = apList?.data?.data?.filter(
                        item => item.serialNumber !== apDetails?.data?.serialNumber
                      ).map(item => item.name) ?? []
                      return checkObjectNotExists(nameList, value,
                        $t({ defaultMessage: 'AP Name' }), 'value')
                    }
                  }
                ]}
                validateFirst
                hasFeedback
                children={<Input />}
              />
              <Form.Item
                name='serialNumber'
                label={$t({ defaultMessage: 'Serial Number' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => serialNumberRegExp(value) },
                  {
                    validator: (_, value) => {
                      const serialNumbers = apList?.data?.data?.filter(
                        item => item.serialNumber !== apDetails?.data?.serialNumber
                      ).map(item => item.serialNumber) ?? []
                      return checkObjectNotExists(serialNumbers, value,
                        $t({ defaultMessage: 'Serial Number' }), 'value')
                    }
                  }
                ]}
                validateFirst
                hasFeedback
                children={<Input disabled={isEditMode} />}
              />
              <Form.Item
                name='description'
                label={$t({ defaultMessage: 'Description' })}
                children={<Input.TextArea rows={4} maxLength={180} />}
              />
              {/* TODO: */}
              {/* <Form.Item
                name=''
                label={$t({ defaultMessage: 'Tags' })}
                children={<Input />}
              /> */}
              {isApGpsFeatureEnabled && <Form.Item
                label={$t({ defaultMessage: 'GPS Coordinates' })}
                children={selectedVenue?.id
                  ? <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {$t({ defaultMessage: '{latitude}, {longitude} {status}' }, {
                      latitude: deviceGps?.latitude || selectedVenue?.latitude,
                      longitude: deviceGps?.longitude || selectedVenue?.longitude,
                      status: !deviceGps ? '(As venue)' : ''
                    })}
                    <Space size={0} split={<UI.Divider />} >
                      <Button
                        type='link'
                        size='small'
                        onClick={() => setGpsModalVisible(true)}>
                        {$t({ defaultMessage: 'Change' })}
                      </Button>
                      {deviceGps && <Button
                        type='link'
                        size='small'
                        onClick={() => onSaveCoordinates(null as unknown as DeviceGps)}>
                        {$t({ defaultMessage: 'Same as Venue' })}
                      </Button>}
                    </Space>
                  </Space>
                  : '-'}
              />}
            </Loader>
          </Col>
        </Row>

        <CoordinatesModal
          formRef={formRef}
          fieldName='deviceGps'
          selectedVenue={selectedVenue}
          deviceGps={deviceGps}
          gpsModalVisible={gpsModalVisible}
          setGpsModalVisible={setGpsModalVisible}
          onSaveCoordinates={onSaveCoordinates}
        />

      </StepsForm.StepForm>
    </StepsForm>
  </>
}

function CoordinatesModal (props: {
  formRef: React.MutableRefObject<StepsFormInstance<ApDeep> | undefined>,
  fieldName: string,
  selectedVenue: VenueExtended,
  deviceGps: DeviceGps,
  gpsModalVisible: boolean,
  setGpsModalVisible: (data: boolean) => void,
  onSaveCoordinates: (data: DeviceGps) => void
}) {
  const { $t } = useIntl()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const {
    formRef,
    fieldName,
    selectedVenue,
    deviceGps,
    gpsModalVisible,
    setGpsModalVisible,
    onSaveCoordinates
  } = props

  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 0, lng: 0
  })
  const [marker, setMarker] = useState<google.maps.LatLng>()
  const [coordinatesValid, setCoordinatesValid] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      const coord = deviceGps || selectedVenue
      formRef?.current?.setFieldValue(fieldName, `${coord?.latitude}, ${coord?.longitude}`)
      if (window.google) {
        const latlng = new google.maps.LatLng({
          lat: Number(coord?.latitude),
          lng: Number(coord?.longitude)
        })
        updateMarkerPosition(latlng)
      }
    }, 500)
  }, [gpsModalVisible, window.google])

  const updateMarkerPosition = (latlng: google.maps.LatLng) => {
    setMarker(latlng)
    setCenter(latlng.lat() ? latlng.toJSON() : { lat: 0, lng: 0 })
    setZoom(16)
  }

  const onChangeCoordinates = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const values = e.target.value?.split(',')
    try {
      const isValid = await formRef?.current?.validateFields([fieldName])
      if (isValid) {
        if (window.google) {
          const latlng = new google.maps.LatLng({
            lat: Number(values[0]),
            lng: Number(values[1])
          })
          updateMarkerPosition(latlng)
        }
        setCoordinatesValid(true)
      }
    } catch (error) {
      setCoordinatesValid(false)
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onApplyCoordinates = () => {
    const venueLatLng = pick(selectedVenue, ['latitude', 'longitude'])
    const latLng = transformLatLng(formRef?.current?.getFieldValue(fieldName))
    if (!isEqual(venueLatLng, latLng)) {
      showActionModal({
        type: 'confirm',
        width: 450,
        title: $t({ defaultMessage: 'Please confirm that...' }),
        content: $t({
          defaultMessage: `Your GPS coordinates are outside the venue: 
            {venueName}. Are you sure you want to place the device in this new position?"`
        }, { venueName: selectedVenue.name }),
        okText: $t({ defaultMessage: 'Drop It' }),
        onOk: () => onSaveCoordinates(latLng),
        onCancel: () => setGpsModalVisible(false)
      })
    } else {
      setGpsModalVisible(false)
    }
  }

  const onDragEndMaker = (event: google.maps.MapMouseEvent) => {
    const hasError = formRef?.current
      ? formRef?.current?.getFieldError(fieldName).length > 0 : false
    const latLng = [
      event.latLng?.lat().toFixed(6),
      event.latLng?.lng().toFixed(6)
    ]
    if (hasError) {
      updateMarkerPosition(event?.latLng as google.maps.LatLng)
      formRef.current?.setFields([{ name: fieldName, value: latLng.join(', '), errors: [] }])
    }
    // formRef?.current?.validateFields([fieldName])
    formRef?.current?.setFieldValue(fieldName, `${latLng.join(', ')}`)
    setCoordinatesValid(true)
  }

  return <Modal
    width={550}
    title={$t({ defaultMessage: 'GPS Coordinates' })}
    subTitle={
      $t({ defaultMessage: 'Drag and drop the marker to the location where this device is placed' })
    }
    visible={gpsModalVisible}
    okText={$t({ defaultMessage: 'Apply' })}
    okButtonProps={{
      disabled: !coordinatesValid
    }}
    onOk={onApplyCoordinates}
    onCancel={() => setGpsModalVisible(false)}
  >
    <GoogleMap.FormItem>
      <Form.Item
        noStyle
        label={false}
        name={fieldName}
        rules={[{
          required: isMapEnabled,
          message: $t(validationMessages.gpsCoordinates)
        }, {
          validator: (_, value) => {
            const latLng = value.split(',').map((v: string) => v.trim())
            const asVeneue = isEqual([selectedVenue?.latitude, selectedVenue?.longitude], latLng)
            return asVeneue
              ? Promise.resolve()
              : gpsRegExp(latLng[0], latLng[1])
          }
        }]}
        validateFirst
      >
        <Input placeholder={$t({
          defaultMessage: 'Enter the latitude and longitude. e.g. 37.4117499, -122.0193697'
        })}
        autoComplete='off'
        data-testid='coordinates-input'
        onChange={onChangeCoordinates}
        />
      </Form.Item>
      {isMapEnabled ?
        <GoogleMap
          libraries={['places']}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          zoom={zoom}
          center={center}
        >
          {marker && <GoogleMapMarker
            position={marker}
            draggable={true}
            onDragEnd={onDragEndMaker}
          />}
        </GoogleMap>
        : <Typography.Title level={3}>
          {$t({ defaultMessage: 'Map is not enabled' })}
        </Typography.Title>}
    </GoogleMap.FormItem>

  </Modal>
}

function getVenueById (venuesList: VenueExtended[], venueId: string) {
  return venuesList?.filter(item => item.id === venueId)[0] ?? {}
}

function checkDhcpRoleDisabled (dhcpAp: DhcpApInfo) {
  return (
    (dhcpAp?.venueDhcpMode === DhcpModeEnum.EnableOnMultipleAPs
    || dhcpAp?.venueDhcpMode === DhcpModeEnum.EnableOnHierarchicalAPs
    ) && (dhcpAp?.dhcpApRole === ApDhcpRoleEnum.PrimaryServer
    || dhcpAp?.dhcpApRole === ApDhcpRoleEnum.BackupServer
    ))
}

function transformLatLng (value: string) {
  const latLng = value?.split(',').map((v: string) => v.trim())
  return (
    latLng?.length ? {
      latitude: latLng[0],
      longitude: latLng[1]
    } : null
  ) as DeviceGps
}

function getFormDirty (form: StepsFormInstance, originalData: ApDeep) {
  const formData = form?.getFieldsValue()
  const checkFields = Object.keys(form?.getFieldsValue() ?? {}).concat(['deviceGps'])
  const oldData = pick(originalData, checkFields)
  const newData = omitBy(formData, v => !v)
  return !isEqual(oldData, newData)
}

function getFormValid (form: StepsFormInstance) {
  return form?.getFieldsError().map(item => item.errors).flat().length > 0
}