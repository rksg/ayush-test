import React, { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Input, Row, Select, Space } from 'antd'
import { DefaultOptionType }                    from 'antd/lib/select'
import { isEqual, omit, pick, isEmpty, omitBy } from 'lodash'
import { FormattedMessage, useIntl }            from 'react-intl'

import {
  Button,
  GoogleMap,
  GoogleMapMarker,
  PageHeader,
  Loader,
  Modal,
  showActionModal,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { GoogleMapWithPreference } from '@acx-ui/rc/components'
import {
  useApListQuery,
  useAddApMutation,
  useGetApOperationalQuery,
  useLazyApGroupListQuery,
  useLazyGetDhcpApQuery,
  useUpdateApMutation,
  useVenuesListQuery,
  useWifiCapabilitiesQuery,
  useGetVenueVersionListQuery
} from '@acx-ui/rc/services'
import {
  ApDeep,
  ApDhcpRoleEnum,
  ApErrorHandlingMessages,
  APMeshRole,
  apNameRegExp,
  CatchErrorResponse,
  checkObjectNotExists,
  checkValues,
  DeviceGps,
  DhcpApInfo,
  DhcpModeEnum,
  gpsRegExp,
  hasGraveAccentAndDollarSign,
  serialNumberRegExp,
  VenueExtended,
  WifiNetworkMessages,
  gpsToFixed,
  redirectPreviousPage,
  validateTags, DhcpAp, DhcpApResponse
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams, TenantLink
} from '@acx-ui/react-router-dom'
import { compareVersions, validationMessages } from '@acx-ui/utils'

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
  const params = useParams()
  const { $t } = useIntl()
  const isApGpsFeatureEnabled = useIsSplitOn(Features.AP_GPS)
  const wifiEdaflag = useIsSplitOn(Features.WIFI_EDA_READY_TOGGLE)
  const wifiEdaGatewayflag = useIsSplitOn(Features.WIFI_EDA_GATEWAY)
  const { tenantId, action, serialNumber } = useParams()
  const formRef = useRef<StepsFormLegacyInstance<ApDeep>>()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')
  const {
    editContextData, setEditContextData, previousPath, isOnlyOneTab
  } = useContext(ApEditContext)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const { data: apList } = useApListQuery({ params: { tenantId }, payload: defaultApPayload })
  const { data: venuesList, isLoading: isVenuesListLoading }
    = useVenuesListQuery({ params: { tenantId }, payload: defaultPayload })
  const { data: apDetails, isLoading: isApDetailsLoading }
    // eslint-disable-next-line max-len
    = useGetApOperationalQuery({ params: { tenantId, serialNumber: serialNumber ? serialNumber : '' } })
  const wifiCapabilities = useWifiCapabilitiesQuery({ params: { tenantId } })
  const { data: venueVersionList } = useGetVenueVersionListQuery({ params })

  const [addAp] = useAddApMutation()
  const [updateAp, { isLoading: isApDetailsUpdating }] = useUpdateApMutation()
  const [getDhcpAp] = useLazyGetDhcpApQuery()
  const [apGroupList] = useLazyApGroupListQuery()

  const isEditMode = action === 'edit'
  const [selectedVenue, setSelectedVenue] = useState({} as unknown as VenueExtended)
  const [venueFwVersion, setVenueFwVersion] = useState('-')
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [apGroupOption, setApGroupOption] = useState([] as DefaultOptionType[])
  const [gpsModalVisible, setGpsModalVisible] = useState(false)
  const [deviceGps, setDeviceGps] = useState(null as DeviceGps | null)

  const [dhcpRoleDisabled, setDhcpRoleDisabled] = useState(false)
  const [apMeshRoleDisabled, setApMeshRoleDisabled] = useState(false)
  const [cellularApModels, setCellularApModels] = useState([] as string[])
  const [triApModels, setTriApModels] = useState([] as string[])

  const BASE_VERSION = '6.2.1'

  // the payload would different based on the feature flag
  const retrieveDhcpAp = (dhcpApResponse: DhcpAp) => {
    if (wifiEdaflag || wifiEdaGatewayflag) {
      const result = dhcpApResponse as DhcpApInfo[]
      return result[0]
    } else {
      const result = dhcpApResponse as DhcpApResponse
      return result.response?.[0]
    }
  }

  const venueInfos = (venueFwVersion: string) => {
    const contentInfo = <><br/><br/>{$t({
      defaultMessage: 'If you are adding an <b>{apModels} or {lastApModel}</b> AP, ' +
        'please update the firmware in this venue to <b>{baseVersion}</b> or greater. ' +
        'This can be accomplished in the Administration\'s {fwManagementLink} section.' }, {
      b: chunks => <strong>{chunks}</strong>,
      apModels: triApModels.length > 1 ? triApModels.slice(0, -1).join(',') : 'R560',
      lastApModel: triApModels.length > 1 ? triApModels[triApModels.length - 1]: 'R760',
      baseVersion: BASE_VERSION,
      fwManagementLink: (<TenantLink
        to={'/administration/fwVersionMgmt'}>{
          $t({ defaultMessage: 'Firmware Management' })
        }</TenantLink>)
    })}</>

    return <span>
      {$t({ defaultMessage: 'Venue Firmware Version: {fwVersion}' }, {
        fwVersion: venueFwVersion
      })}
      {
        checkBelowFwVersion(venueFwVersion) ? contentInfo : ''
      }
    </span>
  }

  const checkBelowFwVersion = (version: string) => {
    if (version === '-') return false
    if (isEditMode && apDetails) {
      if (!triApModels.includes(apDetails.model)) return false
    }
    return compareVersions(version, BASE_VERSION) < 0
  }

  useEffect(() => {
    if (!wifiCapabilities.isLoading) {
      setCellularApModels(wifiCapabilities?.data?.apModels
        ?.filter(apModel => apModel.canSupportCellular)
        .map(apModel => apModel.model) ?? [])
      setTriApModels(wifiCapabilities?.data?.apModels
        ?.filter(apModel => apModel.supportTriRadio)
        .map(apModel => apModel.model) ?? [])
    }
  }, [wifiCapabilities])

  useEffect(() => {
    if (isEditMode && !isVenuesListLoading && !isApDetailsLoading && apDetails) {
      const setData = async (apDetails: ApDeep) => {
        const selectVenue = getVenueById(
          venuesList?.data as unknown as VenueExtended[], apDetails.venueId)
        const venueLatLng = pick(selectVenue, ['latitude', 'longitude'])
        const options = await getApGroupOptions(apDetails.venueId)
        const dhcpApResponse = await getDhcpAp({
          params: { tenantId }, payload: [serialNumber] }, true).unwrap()
        const dhcpAp = retrieveDhcpAp(dhcpApResponse)

        setSelectedVenue(selectVenue as unknown as VenueExtended)
        setApGroupOption(options as DefaultOptionType[])
        setApMeshRoleDisabled(
          !!apDetails?.meshRole && (apDetails?.meshRole !== APMeshRole.DISABLED))
        setDhcpRoleDisabled(checkDhcpRoleDisabled(dhcpAp as DhcpApInfo))
        setDeviceGps((apDetails?.deviceGps || venueLatLng) as unknown as DeviceGps)
        formRef?.current?.setFieldsValue({ description: '', ...apDetails })
      }

      setData(apDetails)
    }
  }, [apDetails, venuesList])

  useEffect(() => {
    if (!isVenuesListLoading) {
      setVenueOption(venuesList?.data?.map(item => ({
        label: item.name, value: item.id
      })) ?? [])
    }
  }, [venuesList])

  useEffect(() => {
    if (selectedVenue.hasOwnProperty('id')) {
      const venueInfo = venueVersionList?.data.find(venue => venue.id === selectedVenue.id)
      setVenueFwVersion(venueInfo && venueInfo.hasOwnProperty('versions')
        ? venueInfo.versions[0].version
        : '-')
    }
  }, [selectedVenue, venueVersionList])

  useEffect(() => {
    handleUpdateContext()
  }, [deviceGps])

  const handleAddAp = async (values: ApDeep) => {
    const sameAsVenue = isEqual(deviceGps, pick(selectedVenue, ['latitude', 'longitude']))
    try {
      const payload = [{
        ...omit(values, 'deviceGps'),
        ...(deviceGps && !sameAsVenue && { deviceGps: deviceGps })
      }]
      await addAp({ params: { tenantId: tenantId }, payload }).unwrap()
      navigate(`${basePath.pathname}/wifi`, { replace: true })
    } catch (err) {
      handleError(err as CatchErrorResponse)
    }
  }

  const handleUpdateAp = async (values: ApDeep) => {
    const sameAsVenue = isEqual(deviceGps, pick(selectedVenue, ['latitude', 'longitude']))
    try {
      const payload = {
        ...omit(values, 'deviceGps'),
        ...(!sameAsVenue && { deviceGps: transformLatLng(values?.deviceGps as string)
          || deviceGps })
      }
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })
      await updateAp({ params: { tenantId, serialNumber }, payload }).unwrap()
      if (isOnlyOneTab) {
        redirectPreviousPage(navigate, previousPath, basePath)
      }
    } catch (err) {
      handleError(err as CatchErrorResponse)
    }
  }

  const handleError = async (error: CatchErrorResponse) => {
    const errorType = (error?.status === 423
      ? 'REQUEST_LOCKING'
      : error?.data?.errors?.[0]?.code) as keyof typeof errorTypeMap

    const errorTypeMap = {
      'WIFI-10130': 'SERIAL_NUMBER_ALREADY_REGISTERED',
      'WIFI-10114': 'SERVICE_IS_NOT_SUPPORTED',
      'WIFI-10126': 'UPGRADE_YOUR_LICENSE',
      'WIFI-10140': 'CELLULAR_AP_CANNOT_BE_MOVED',
      'REQUEST_LOCKING': 'REQUEST_LOCKING'
    }

    const errorMsg = ApErrorHandlingMessages[
          errorTypeMap[errorType] as keyof typeof ApErrorHandlingMessages
    ] ?? ApErrorHandlingMessages.ERROR_OCCURRED

    showActionModal({
      type: 'error',
      title: $t({ defaultMessage: 'Error' }),
      content: (<FormattedMessage
        {...errorMsg}
        values={{
          br: () => <br />,
          action: isEditMode
            ? $t({ defaultMessage: 'updating' })
            : $t({ defaultMessage: 'creating' })
        }}
      />),
      customContent: {
        action: 'SHOW_ERRORS',
        errorDetails: error
      }
    })
  }

  const getApGroupOptions = async (venueId: string) => {
    let result: { label: string; value: string | null }[] = []
    result.push({
      label: $t({ defaultMessage: 'No group (inherit from Venue)' }),
      value: null
    })

    const list = venueId ? (await apGroupList({ params: { tenantId, venueId } }, true)).data : []
    if (venueId && list?.length) {
      list?.filter((item) => {
        if (isEditMode && item.id === apDetails?.apGroupId && item.isDefault) {
          result[0].value = item.id
        }
        return !item.isDefault
      })
        .sort((a, b) => (a.name > b.name) ? 1 : -1)
        .forEach((item) => (
          result.push({
            label: item.name,
            value: item.id
          })
        ))
    }
    return result
  }

  const handleVenueChange = async (value: string) => {
    const selectVenue = getVenueById(venuesList?.data as unknown as VenueExtended[], value)
    const options = await getApGroupOptions(value)
    setSelectedVenue(selectVenue as unknown as VenueExtended)
    setApGroupOption(options as DefaultOptionType[])
    const sameAsVenue = isEqual(deviceGps, pick(selectedVenue, ['latitude', 'longitude']))
    if (sameAsVenue) {
      setDeviceGps(pick(selectVenue, ['latitude', 'longitude']) as unknown as DeviceGps)
    }
    formRef?.current?.setFieldValue('apGroupId', options[0]?.value ?? (value ? null : ''))
    if (formRef?.current?.getFieldValue('name')) {
      formRef?.current?.validateFields(['name'])
    }
    const venueInfo = venueVersionList?.data.find(venue => venue.id === value)
    setVenueFwVersion(venueInfo ? venueInfo.versions[0].version : '-')
  }

  const onSaveCoordinates = (latLng: DeviceGps | null) => {
    setDeviceGps(latLng)
    setGpsModalVisible(false)
  }

  const handleUpdateContext = () => {
    if (isEditMode) {
      const form = formRef?.current as StepsFormLegacyInstance
      const originalData = (isEmpty(apDetails?.deviceGps) ? {
        ...apDetails,
        ...{
          deviceGps: {
            latitude: selectedVenue?.latitude,
            longitude: selectedVenue?.longitude
          }
        }
      } : apDetails) as ApDeep



      setEditContextData && setEditContextData({
        ...editContextData,
        tabTitle: $t({ defaultMessage: 'General' }),
        isDirty: checkFormIsDirty(form, originalData, deviceGps as DeviceGps),
        hasError: checkFormIsInvalid(form),
        updateChanges: () => handleUpdateAp(form?.getFieldsValue() as ApDeep)
      })
    }
  }

  return <>
    {!isEditMode && <PageHeader
      title={$t({ defaultMessage: 'Add AP' })}
      breadcrumb={isNavbarEnhanced ? [
        { text: $t({ defaultMessage: 'Wi-Fi' }) },
        { text: $t({ defaultMessage: 'Access Points' }) },
        { text: $t({ defaultMessage: 'AP List' }), link: '/devices/wifi' }
      ] : [
        { text: $t({ defaultMessage: 'Access Points' }), link: '/devices/wifi' }
      ]}
    />}
    <StepsFormLegacy
      formRef={formRef}
      onFinish={!isEditMode ? handleAddAp : handleUpdateAp}
      onFormChange={handleUpdateContext}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{
        submit: !isEditMode
          ? $t({ defaultMessage: 'Add' })
          : $t({ defaultMessage: 'Apply' })
      }}
    >
      <StepsFormLegacy.StepForm>
        <Row gutter={20}>
          <Col span={8}>
            <Loader states={[{
              isLoading: isVenuesListLoading || isApDetailsLoading,
              isFetching: isApDetailsUpdating
            }]}>
              <Form.Item
                name='venueId'
                style={{ marginBottom: '0px' }}
                label={<>
                  {$t({ defaultMessage: 'Venue' })}
                  {(apMeshRoleDisabled || dhcpRoleDisabled) && <Tooltip.Question
                    title={
                      apMeshRoleDisabled
                        ? $t(WifiNetworkMessages.AP_VENUE_MESH_DISABLED_TOOLTIP)
                        : (dhcpRoleDisabled
                          ? $t(WifiNetworkMessages.AP_VENUE_DHCP_DISABLED_TOOLTIP)
                          : ''
                        )
                    }
                    placement='bottom'
                  />}
                </>}
                initialValue={null}
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please select venue' })
                }, {
                  validator: (_, value) => {
                    const venues = venuesList?.data as unknown as VenueExtended[]
                    const selectVenue = getVenueById(venues, value)
                    const originalVenue = getVenueById(venues, apDetails?.venueId as string)
                    if (selectVenue?.country && originalVenue?.country) {
                      return checkValues(selectVenue?.country, originalVenue?.country, true)
                    }
                    return Promise.resolve()
                  },
                  message: $t(validationMessages.diffVenueCountry)
                }, {
                  validator: (_, value) => {
                    const venues = venuesList?.data as unknown as VenueExtended[]
                    const selectVenue = getVenueById(venues, value)
                    if (!!selectVenue?.dhcp?.enabled) {
                      return checkObjectNotExists(
                        cellularApModels, apDetails?.model, $t({ defaultMessage: 'Venue' })
                      )
                    }
                    return Promise.resolve()
                  },
                  message: $t(validationMessages.cellularApDhcpLimitation)
                }]}
                children={<Select
                  disabled={apMeshRoleDisabled || dhcpRoleDisabled}
                  options={venueOption}
                  onChange={async (value) => await handleVenueChange(value)}
                />}
              />
              <Form.Item
                name='venueInfos'
              >
                {venueInfos(venueFwVersion)}
              </Form.Item>
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
                  <Tooltip.Question
                    title={$t(WifiNetworkMessages.AP_NAME_TOOLTIP)}
                    placement='bottom'
                  />
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
                      const venueId = formRef?.current?.getFieldValue('venueId')
                      const nameList = apList?.data?.filter(item => (
                        item.name !== apDetails?.name
                        && (selectedVenue ? item.venueId === venueId : false)
                      )).map(item => item.name) ?? []
                      return checkObjectNotExists(nameList, value,
                        $t({ defaultMessage: 'AP Name' }), 'value',
                        $t({ defaultMessage: 'in this Venue' })
                      )
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
                      const serialNumbers = apList?.data?.filter(
                        item => item.serialNumber !== apDetails?.serialNumber
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
                initialValue=''
                children={<Input.TextArea rows={4} maxLength={180} />}
              />
              <Form.Item
                name='tags'
                label={$t({ defaultMessage: 'Tags' })}
                rules={[{
                  validator: (_, value) => validateTags(value)
                }]}
                children={<Select mode='tags' maxLength={24} />}
              />
              {isApGpsFeatureEnabled && <GpsCoordinatesFormItem />}
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

      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </>

  function GpsCoordinatesFormItem () {
    const sameAsVenue = isEqual(
      [deviceGps?.latitude, deviceGps?.longitude],
      [selectedVenue?.latitude, selectedVenue?.longitude]
    )
    return <Form.Item
      label={$t({ defaultMessage: 'GPS Coordinates' })}
      children={selectedVenue?.id
        ? <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          {$t({ defaultMessage: '{latitude}, {longitude} {status}' }, {
            latitude: deviceGps?.latitude || selectedVenue?.latitude,
            longitude: deviceGps?.longitude || selectedVenue?.longitude,
            status: sameAsVenue ? '(As venue)' : ''
          })}
          <Space size={0} split={<UI.Divider />} >
            <Button
              type='link'
              size='small'
              onClick={() => setGpsModalVisible(true)}>
              {$t({ defaultMessage: 'Change' })}
            </Button>
            {!sameAsVenue && <Button
              type='link'
              size='small'
              onClick={() => onSaveCoordinates(
                selectedVenue?.latitude ? {
                  latitude: selectedVenue.latitude,
                  longitude: selectedVenue.longitude
                } as unknown as DeviceGps
                  : null
              )}
            >
              {$t({ defaultMessage: 'Same as Venue' })}
            </Button>}
          </Space>
        </Space>
        : '-'}
    />
  }
}

function CoordinatesModal (props: {
  formRef: React.MutableRefObject<StepsFormLegacyInstance<ApDeep> | undefined>,
  fieldName: string,
  selectedVenue: VenueExtended,
  deviceGps: DeviceGps | null,
  gpsModalVisible: boolean,
  setGpsModalVisible: (data: boolean) => void,
  onSaveCoordinates: (data: DeviceGps | null) => void
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
            {venueName}. Are you sure you want to place the device in this new position?`
        }, { venueName: selectedVenue.name }),
        okText: $t({ defaultMessage: 'Drop It' }),
        cancelText: $t({ defaultMessage: 'Cancel' }),
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
            const sameAsVenue = isEqual([selectedVenue?.latitude, selectedVenue?.longitude], latLng)
            return sameAsVenue
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
        <GoogleMapWithPreference
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
        </GoogleMapWithPreference>
        :
        <GoogleMap.NotEnabled />
      }
    </GoogleMap.FormItem>

  </Modal>
}

function getVenueById (venuesList: VenueExtended[], venueId: string) {
  const selectVenue = venuesList?.filter(item => item.id === venueId)[0] ?? {}

  return { ...selectVenue,
    latitude: gpsToFixed(selectVenue?.latitude),
    longitude: gpsToFixed(selectVenue?.longitude)
  }
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

function checkFormIsDirty (
  form: StepsFormLegacyInstance,
  originalData: ApDeep,
  deviceGps: DeviceGps
) {
  const formData = form?.getFieldsValue()
  const checkFields = Object.keys(form?.getFieldsValue() ?? {}).concat(['deviceGps'])
  const oldData = pick(originalData, checkFields)
  const newData = { ...omit(formData, 'deviceGps'), deviceGps: deviceGps }
  //omitBy({ ...omit(formData, 'deviceGps'), deviceGps: deviceGps }, v => !v)
  return !!Object.values(formData).length &&
    !isEqual(omitBy(oldData, isEmpty), omitBy(newData, isEmpty))
}

function checkFormIsInvalid (form: StepsFormLegacyInstance) {
  return form?.getFieldsError().map(item => item.errors).flat().length > 0
}
